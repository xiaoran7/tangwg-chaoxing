# ===== 1. 建用户与目录 =====
sudo useradd -r -s /usr/sbin/nologin tiku 2>/dev/null || true
sudo mkdir -p /opt/tiku-proxy /var/lib/tiku-proxy
sudo chown -R tiku:tiku /opt/tiku-proxy /var/lib/tiku-proxy

# ===== 2. 放代码 =====
cd /opt/tiku-proxy
# 把 server.py 和 upstream.py 传上来后：
sudo -u tiku python3 -m venv .venv
sudo -u tiku .venv/bin/pip install -q --upgrade pip
sudo -u tiku .venv/bin/pip install -q fastapi "uvicorn[standard]" httpx

# ===== 3. 配置（密钥别提交到仓库）=====
sudo cp .env.example .env
sudo nano .env          # 填 CPA_BASE_URL / CPA_API_KEY / PROXY_TOKEN
sudo chmod 600 .env
sudo chown tiku:tiku .env

# ===== 4. systemd =====
sudo tee /etc/systemd/system/tiku-proxy.service >/dev/null <<'UNIT'
[Unit]
Description=Tiku Proxy (course-helper -> CPA)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=tiku
Group=tiku
WorkingDirectory=/opt/tiku-proxy
EnvironmentFile=/opt/tiku-proxy/.env
ExecStart=/opt/tiku-proxy/.venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000 --proxy-headers --forwarded-allow-ips='127.0.0.1'
Restart=always
RestartSec=3
# 基础加固
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/tiku-proxy

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now tiku-proxy
sudo systemctl status tiku-proxy --no-pager
