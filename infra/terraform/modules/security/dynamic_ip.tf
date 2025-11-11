# ============================================================
# Dynamic IP Address Detection
# ============================================================
# terraform plan/apply 実行時に現在のIPアドレスを自動取得します
# これにより、異なる場所（自宅、カフェなど）からのアクセスが可能になります

# 現在のIPアドレスを取得
data "http" "my_ip" {
  url = "https://ifconfig.me/ip"

  # リクエストヘッダーの設定
  request_headers = {
    Accept = "text/plain"
  }
}

# IPアドレスをCIDR形式に変換
locals {
  # 取得したIPアドレスから改行や空白を除去し、/32を付与
  my_ip_cidr = "${trimspace(data.http.my_ip.response_body)}/32"
}
