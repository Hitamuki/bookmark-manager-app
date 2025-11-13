#!/bin/bash

##############################################################################
# OWASP ZAP DAST スキャン実行スクリプト
#
# 使用方法:
#   ./run-zap-scan.sh [オプション]
#
# オプション:
#   -t, --target URL     テスト対象のURL（デフォルト: Staging環境のALB）
#   -m, --mode MODE      スキャンモード（baseline | full）デフォルト: baseline
#   -h, --help           ヘルプを表示
#
# 例:
#   ./run-zap-scan.sh
#   ./run-zap-scan.sh -t http://example.com/
#   ./run-zap-scan.sh -m full
##############################################################################

set -e

# デフォルト設定
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_URL="http://bookmark-manager-staging-alb-491287683.ap-northeast-1.elb.amazonaws.com/samples"
SCAN_MODE="baseline"
REPORT_DIR="${SCRIPT_DIR}/reports"
DATE_STAMP=$(date +%Y%m%d-%H%M%S)

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘルプ表示
show_help() {
    cat << EOF
OWASP ZAP DAST スキャン実行スクリプト

使用方法:
  $0 [オプション]

オプション:
  -t, --target URL     テスト対象のURL
                       デフォルト: ${TARGET_URL}

  -m, --mode MODE      スキャンモード
                       baseline: ベースラインスキャン（受動的スキャンのみ、推奨）
                       full: フルスキャン（能動的攻撃を含む）
                       デフォルト: baseline

  -h, --help           このヘルプを表示

例:
  # デフォルト設定で実行
  $0

  # カスタムURLをテスト
  $0 -t http://example.com/

  # フルスキャンを実行
  $0 -m full

注意:
  - フルスキャンは能動的攻撃を含むため、本番環境では実行しないこと
  - スキャン前にECSタスクが起動していることを確認してください
  - セキュリティグループで自分のIPが許可されていることを確認してください

EOF
}

# 引数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            TARGET_URL="$2"
            shift 2
            ;;
        -m|--mode)
            SCAN_MODE="$2"
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

# スキャンモードのバリデーション
if [[ "$SCAN_MODE" != "baseline" && "$SCAN_MODE" != "full" ]]; then
    echo -e "${RED}エラー: スキャンモードは 'baseline' または 'full' を指定してください${NC}"
    exit 1
fi

# レポートディレクトリの作成
mkdir -p "${REPORT_DIR}"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  OWASP ZAP DAST スキャン${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "対象URL: ${GREEN}${TARGET_URL}${NC}"
echo -e "スキャンモード: ${GREEN}${SCAN_MODE}${NC}"
echo -e "レポート出力先: ${GREEN}${REPORT_DIR}${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# 対象URLの疎通確認
echo -e "${YELLOW}[1/4] 対象URLの疎通確認中...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${TARGET_URL}" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ 疎通確認成功${NC}"
else
    echo -e "${RED}✗ 対象URLに接続できません: ${TARGET_URL}${NC}"
    echo -e "${YELLOW}  - ECSタスクが起動しているか確認してください${NC}"
    echo -e "${YELLOW}  - セキュリティグループで自分のIPが許可されているか確認してください${NC}"
    exit 1
fi

# Dockerイメージの確認
echo -e "${YELLOW}[2/4] Dockerイメージの確認中...${NC}"
if ! docker images | grep -q "zaproxy/zaproxy"; then
    echo -e "${YELLOW}ZAPイメージをプル中...${NC}"
    docker pull ghcr.io/zaproxy/zaproxy:stable
fi
echo -e "${GREEN}✓ Dockerイメージ確認完了${NC}"

# ZAPスキャンの実行
echo -e "${YELLOW}[3/4] ZAPスキャン実行中...${NC}"
echo -e "${YELLOW}  ※ スキャンには数分〜数十分かかる場合があります${NC}"

if [[ "$SCAN_MODE" == "baseline" ]]; then
    # ベースラインスキャン（受動的スキャンのみ）
    docker run --rm \
        -v "${REPORT_DIR}:/zap/wrk:rw" \
        -t ghcr.io/zaproxy/zaproxy:stable \
        zap-baseline.py \
        -t "${TARGET_URL}" \
        -r "zap-baseline-report-${DATE_STAMP}.html" \
        -J "zap-baseline-report-${DATE_STAMP}.json" \
        -w "zap-baseline-report-${DATE_STAMP}.md" \
        -x "zap-baseline-report-${DATE_STAMP}.xml" \
        -l INFO \
        -a || true  # ZAPは脆弱性検出時に非0を返すため、エラーにしない
else
    # フルスキャン（能動的攻撃を含む）
    echo -e "${RED}警告: フルスキャンは能動的攻撃を含みます${NC}"
    read -p "続行しますか? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo -e "${YELLOW}スキャンをキャンセルしました${NC}"
        exit 0
    fi

    docker run --rm \
        -v "${REPORT_DIR}:/zap/wrk:rw" \
        -t ghcr.io/zaproxy/zaproxy:stable \
        zap-full-scan.py \
        -t "${TARGET_URL}" \
        -r "zap-full-report-${DATE_STAMP}.html" \
        -J "zap-full-report-${DATE_STAMP}.json" \
        -w "zap-full-report-${DATE_STAMP}.md" \
        -x "zap-full-report-${DATE_STAMP}.xml" \
        -l INFO \
        -a || true
fi

# レポートの確認
echo -e "${YELLOW}[4/4] レポート生成確認中...${NC}"
if ls "${REPORT_DIR}"/zap-*-report-"${DATE_STAMP}".html >/dev/null 2>&1; then
    echo -e "${GREEN}✓ レポート生成完了${NC}"
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${GREEN}✓ ZAPスキャン完了${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    echo -e "生成されたレポート:"
    ls -lh "${REPORT_DIR}"/zap-*-report-"${DATE_STAMP}".*
    echo ""
    echo -e "HTMLレポートを開く:"
    echo -e "${GREEN}  open ${REPORT_DIR}/zap-${SCAN_MODE}-report-${DATE_STAMP}.html${NC}"
else
    echo -e "${RED}✗ レポート生成に失敗しました${NC}"
    exit 1
fi

# レポートサマリーの表示（JSONから抽出）
JSON_REPORT="${REPORT_DIR}/zap-${SCAN_MODE}-report-${DATE_STAMP}.json"
if command -v jq >/dev/null 2>&1 && [ -f "${JSON_REPORT}" ]; then
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  脆弱性サマリー${NC}"
    echo -e "${BLUE}=====================================${NC}"

    HIGH=$(jq '[.site[].alerts[] | select(.riskcode == "3")] | length' "${JSON_REPORT}" 2>/dev/null || echo "0")
    MEDIUM=$(jq '[.site[].alerts[] | select(.riskcode == "2")] | length' "${JSON_REPORT}" 2>/dev/null || echo "0")
    LOW=$(jq '[.site[].alerts[] | select(.riskcode == "1")] | length' "${JSON_REPORT}" 2>/dev/null || echo "0")
    INFO=$(jq '[.site[].alerts[] | select(.riskcode == "0")] | length' "${JSON_REPORT}" 2>/dev/null || echo "0")

    echo -e "${RED}High: ${HIGH}${NC}"
    echo -e "${YELLOW}Medium: ${MEDIUM}${NC}"
    echo -e "${BLUE}Low: ${LOW}${NC}"
    echo -e "Informational: ${INFO}"
    echo -e "${BLUE}=====================================${NC}"

    if [ "$HIGH" -gt 0 ]; then
        echo -e "${RED}⚠️  高リスクの脆弱性が検出されました！詳細はレポートを確認してください。${NC}"
    fi
fi

echo ""
echo -e "${GREEN}スキャン完了！${NC}"
