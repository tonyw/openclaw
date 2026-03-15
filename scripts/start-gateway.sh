#!/bin/bash
# OpenClaw Gateway 启动脚本

set -e

# 切换到项目目录
cd /Users/wangxin/workspace/openclaw

# 加载 nvm
source ~/.nvm/nvm.sh
nvm use 24

echo "Stopping existing gateway..."
pnpm openclaw gateway stop 2>/dev/null || true

# 等待进程完全停止
sleep 2

# 强制杀死残留进程
pkill -9 -f "openclaw-gateway" 2>/dev/null || true
sleep 1

echo "Starting gateway on port 18789..."
echo "Tencent IM webhook: http://0.0.0.0:12000/webhook"
echo "Logs: /tmp/openclaw-gateway.log"
echo ""

nohup pnpm openclaw gateway run --bind loopback --port 18789 > /tmp/openclaw-gateway.log 2>&1 &

sleep 3

echo "Checking status..."
tail -15 /tmp/openclaw-gateway.log