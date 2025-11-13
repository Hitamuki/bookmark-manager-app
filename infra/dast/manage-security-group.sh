#!/bin/bash

##############################################################################
# セキュリティグループ管理スクリプト
#
# 使用方法:
#   ./manage-security-group.sh [add|remove] [オプション]
#
# コマンド:
#   add      自分のIPアドレスをセキュリティグループに追加
#   remove   自分のIPアドレスをセキュリティグループから削除
#   list     現在のセキュリティグループルールを表示
#
# オプション:
#   -i, --ip IP          手動でIPアドレスを指定（デフォルト: 自動検出）
#   -h, --help           ヘルプを表示
#
# 例:
#   ./manage-security-group.sh add
#   ./manage-security-group.sh remove
#   ./manage-security-group.sh list
#   ./manage-security-group.sh add -i 203.0.113.10
##############################################################################

set -e

# デフォルト設定
REGION="ap-northeast-1"
ALB_SG_NAME="bookmark-manager-staging-alb-sg"
DESCRIPTION="Temporary access for DAST testing"
MY_IP=""

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘルプ表示
show_help() {
    cat << EOF
セキュリティグループ管理スクリプト

使用方法:
  $0 <command> [オプション]

コマンド:
  add      自分のIPアドレスをセキュリティグループに追加
  remove   自分のIPアドレスをセキュリティグループから削除
  list     現在のセキュリティグループルールを表示

オプション:
  -i, --ip IP          手動でIPアドレスを指定（デフォルト: 自動検出）
  -h, --help           このヘルプを表示

例:
  # 自分のIPを追加（自動検出）
  $0 add

  # 特定のIPを追加
  $0 add -i 203.0.113.10

  # 自分のIPを削除
  $0 remove

  # 現在のルールを表示
  $0 list

注意:
  - AWS CLIがインストールされ、認証情報が設定されている必要があります
  - セキュリティグループへの変更権限が必要です

EOF
}

# IPアドレスの自動検出
detect_my_ip() {
    echo -e "${YELLOW}IPアドレスを自動検出中...${NC}"

    # 複数のサービスを試す
    MY_IP=$(curl -s https://checkip.amazonaws.com/ || \
            curl -s https://ifconfig.me || \
            curl -s https://icanhazip.com || \
            curl -s https://api.ipify.org)

    if [ -z "$MY_IP" ]; then
        echo -e "${RED}エラー: IPアドレスの自動検出に失敗しました${NC}"
        echo -e "${YELLOW}  -i オプションで手動指定してください${NC}"
        exit 1
    fi

    echo -e "${GREEN}検出されたIPアドレス: ${MY_IP}${NC}"
}

# セキュリティグループIDの取得
get_security_group_id() {
    SG_ID=$(aws ec2 describe-security-groups \
        --region "${REGION}" \
        --filters "Name=tag:Name,Values=${ALB_SG_NAME}" \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null)

    if [ -z "$SG_ID" ] || [ "$SG_ID" == "None" ]; then
        echo -e "${RED}エラー: セキュリティグループが見つかりません: ${ALB_SG_NAME}${NC}"
        exit 1
    fi

    echo "$SG_ID"
}

# IPアドレスを追加
add_ip() {
    detect_my_ip

    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  IPアドレスをセキュリティグループに追加${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo -e "セキュリティグループ: ${GREEN}${ALB_SG_NAME}${NC}"
    echo -e "追加するIP: ${GREEN}${MY_IP}/32${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""

    SG_ID=$(get_security_group_id)
    echo -e "セキュリティグループID: ${GREEN}${SG_ID}${NC}"

    # 既に追加されているか確認
    EXISTING=$(aws ec2 describe-security-groups \
        --region "${REGION}" \
        --group-ids "${SG_ID}" \
        --query "SecurityGroups[0].IpPermissions[?FromPort==\`80\`].IpRanges[?CidrIp==\`${MY_IP}/32\`]" \
        --output text 2>/dev/null)

    if [ -n "$EXISTING" ]; then
        echo -e "${YELLOW}✓ このIPアドレスは既に登録されています${NC}"
        return 0
    fi

    # HTTPポート（80）へのアクセスを許可
    echo -e "${YELLOW}HTTP (80) ポートへのアクセスを許可中...${NC}"
    aws ec2 authorize-security-group-ingress \
        --region "${REGION}" \
        --group-id "${SG_ID}" \
        --ip-permissions \
            IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges="[{CidrIp=${MY_IP}/32,Description='${DESCRIPTION}'}]" \
        2>/dev/null || echo -e "${YELLOW}  (既に存在する可能性があります)${NC}"

    # HTTPSポート（443）へのアクセスを許可（将来的にHTTPS有効化時のため）
    echo -e "${YELLOW}HTTPS (443) ポートへのアクセスを許可中...${NC}"
    aws ec2 authorize-security-group-ingress \
        --region "${REGION}" \
        --group-id "${SG_ID}" \
        --ip-permissions \
            IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges="[{CidrIp=${MY_IP}/32,Description='${DESCRIPTION}'}]" \
        2>/dev/null || echo -e "${YELLOW}  (既に存在する可能性があります)${NC}"

    echo -e "${GREEN}✓ IPアドレスの追加が完了しました${NC}"
    echo ""
    echo -e "${BLUE}現在のルール:${NC}"
    list_rules
}

# IPアドレスを削除
remove_ip() {
    detect_my_ip

    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  IPアドレスをセキュリティグループから削除${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo -e "セキュリティグループ: ${GREEN}${ALB_SG_NAME}${NC}"
    echo -e "削除するIP: ${GREEN}${MY_IP}/32${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""

    SG_ID=$(get_security_group_id)
    echo -e "セキュリティグループID: ${GREEN}${SG_ID}${NC}"

    # HTTPポート（80）のルールを削除
    echo -e "${YELLOW}HTTP (80) ポートのルールを削除中...${NC}"
    aws ec2 revoke-security-group-ingress \
        --region "${REGION}" \
        --group-id "${SG_ID}" \
        --ip-permissions \
            IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges="[{CidrIp=${MY_IP}/32}]" \
        2>/dev/null || echo -e "${YELLOW}  (ルールが存在しない可能性があります)${NC}"

    # HTTPSポート（443）のルールを削除
    echo -e "${YELLOW}HTTPS (443) ポートのルールを削除中...${NC}"
    aws ec2 revoke-security-group-ingress \
        --region "${REGION}" \
        --group-id "${SG_ID}" \
        --ip-permissions \
            IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges="[{CidrIp=${MY_IP}/32}]" \
        2>/dev/null || echo -e "${YELLOW}  (ルールが存在しない可能性があります)${NC}"

    echo -e "${GREEN}✓ IPアドレスの削除が完了しました${NC}"
}

# 現在のルールを表示
list_rules() {
    SG_ID=$(get_security_group_id)

    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  現在のセキュリティグループルール${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo -e "セキュリティグループ: ${GREEN}${ALB_SG_NAME}${NC}"
    echo -e "ID: ${GREEN}${SG_ID}${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""

    aws ec2 describe-security-groups \
        --region "${REGION}" \
        --group-ids "${SG_ID}" \
        --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpProtocol,IpRanges[*].[CidrIp,Description]]' \
        --output table
}

# AWS CLIのチェック
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}エラー: AWS CLIがインストールされていません${NC}"
        echo -e "${YELLOW}インストール方法: https://aws.amazon.com/cli/${NC}"
        exit 1
    fi

    # AWS認証情報のチェック
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}エラー: AWS認証情報が設定されていません${NC}"
        echo -e "${YELLOW}aws configure を実行して設定してください${NC}"
        exit 1
    fi
}

# メイン処理
main() {
    # AWS CLIのチェック
    check_aws_cli

    # コマンドが指定されていない場合
    if [ $# -eq 0 ]; then
        show_help
        exit 1
    fi

    COMMAND=$1
    shift

    # オプション解析
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--ip)
                MY_IP="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}エラー: 不明なオプション: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done

    # コマンド実行
    case $COMMAND in
        add)
            add_ip
            ;;
        remove)
            remove_ip
            ;;
        list)
            list_rules
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo -e "${RED}エラー: 不明なコマンド: $COMMAND${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
