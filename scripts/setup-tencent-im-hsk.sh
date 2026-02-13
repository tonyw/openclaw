#!/usr/bin/env bash
# Setup Tencent IM with HSK (花生壳) - OpenClaw Gateway Integration
#
# 使用方法: bash scripts/setup-tencent-im-hsk.sh
# 注意: 不要用 sh 运行，因为 sh 可能指向 dash，不支持某些特性
# 
# This script helps you:
# 1. Install and configure HSK (花生壳) for Tencent IM Webhook
# 2. Configure OpenClaw Gateway for LAN + Webhook mode
# 3. Test Tencent IM callback connectivity
#
# Usage: ./setup-tencent-im-hsk.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Configuration
HSK_WEBHOOK_PORT="${HSK_WEBHOOK_PORT:-18794}"
HSK_WEBHOOK_PATH="${HSK_WEBHOOK_PATH:-/webhook/tencent-im}"
OPENCLAW_CONFIG="${HOME}/.openclaw/openclaw.json"

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ==================== STEP 1: Check Prerequisites ====================

step1_check_prerequisites() {
    print_header "Step 1: 检查环境 prerequisites"
    
    local all_good=true
    
    # Check OS
    if [[ "$OS" == "macos" ]]; then
        print_success "检测到 macOS 系统"
    elif [[ "$OS" == "linux" ]]; then
        print_success "检测到 Linux 系统"
    else
        print_error "不支持的操作系统: $OSTYPE"
        print_info "本脚本支持 macOS 和 Linux"
        exit 1
    fi
    
    # Check OpenClaw config exists
    if [[ -f "$OPENCLAW_CONFIG" ]]; then
        print_success "OpenClaw 配置文件存在: $OPENCLAW_CONFIG"
    else
        print_error "OpenClaw 配置文件不存在: $OPENCLAW_CONFIG"
        print_info "请先运行 OpenClaw 并完成初始配置"
        exit 1
    fi
    
    # Check if Tencent IM is configured
    if grep -q '"tencent-im"' "$OPENCLAW_CONFIG" 2>/dev/null; then
        print_success "Tencent IM 通道已配置"
    else
        print_warning "Tencent IM 通道未配置"
        print_info "请先配置 channels.tencent-im"
    fi
    
    # Check required tools
    if command_exists curl; then
        print_success "curl 已安装"
    else
        print_error "curl 未安装"
        all_good=false
    fi
    
    if command_exists jq; then
        print_success "jq 已安装"
    else
        print_warning "jq 未安装（建议安装以便更好地处理JSON）"
        print_info "Mac: brew install jq"
        print_info "Linux: sudo apt-get install jq"
    fi
    
    if [[ "$all_good" == false ]]; then
        print_error "请先安装缺失的依赖"
        exit 1
    fi
    
    echo ""
    read -p "按回车继续..."
}

# ==================== STEP 2: Install HSK ====================

step2_install_hsk() {
    print_header "Step 2: 安装花生壳 (HSK)"
    
    # Check if HSK is already installed
    if [[ "$OS" == "macos" ]]; then
        if [[ -d "/Applications/花生壳.app" ]] || pgrep -x "花生壳" > /dev/null 2>&1; then
            print_success "花生壳已安装"
            print_info "如果已购买套餐，请确保已登录"
            echo ""
            read -p "按回车继续..."
            return
        fi
    elif [[ "$OS" == "linux" ]]; then
        if command_exists phddns || pgrep -x "phddns" > /dev/null 2>&1; then
            print_success "花生壳已安装"
            echo ""
            read -p "按回车继续..."
            return
        fi
    fi
    
    print_info "花生壳安装指南："
    echo ""
    echo "1. 访问官网购买/注册: https://hsk.oray.com/price"
    echo "   推荐购买「无忧+标准版」(约98-168元/年)"
    echo ""
    echo "2. 下载并安装对应系统版本:"
    
    if [[ "$OS" == "macos" ]]; then
        echo ""
        echo "   Mac 版下载地址:"
        echo "   https://hsk.oray.com/download"
        echo ""
        echo "   安装步骤:"
        echo "   - 下载 .dmg 文件"
        echo "   - 双击打开，拖动到 Applications"
        echo "   - 首次运行需在 系统设置 > 隐私与安全性 中允许"
        echo ""
        
        # Offer to open browser
        read -p "是否打开下载页面? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "https://hsk.oray.com/download" 2>/dev/null || true
        fi
    else
        echo ""
        echo "   Linux 版安装命令:"
        echo "   wget https://dl.oray.com/hsk/linux/phddns_5.3.0_amd64.deb"
        echo "   sudo dpkg -i phddns_5.3.0_amd64.deb"
        echo ""
        
        read -p "是否自动执行安装? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd /tmp
            wget -q --show-progress https://dl.oray.com/hsk/linux/phddns_5.3.0_amd64.deb
            sudo dpkg -i phddns_5.3.0_amd64.deb || sudo apt-get install -f -y
            print_success "花生壳安装完成"
        fi
    fi
    
    echo ""
    print_info "安装完成后:"
    echo "1. 打开花生壳客户端"
    echo "2. 登录你的贝锐账号（需先购买套餐）"
    echo "3. 创建映射: HTTP -> 127.0.0.1:${HSK_WEBHOOK_PORT}"
    echo ""
    read -p "按回车继续..."
}

# ==================== STEP 3: Configure HSK Mapping ====================

step3_configure_hsk_mapping() {
    print_header "Step 3: 配置花生壳映射"
    
    print_info "请在花生壳控制台完成以下配置:"
    echo ""
    echo "1. 登录花生壳控制台: https://console.hsk.oray.com"
    echo ""
    echo "2. 点击「内网穿透」→「添加映射」"
    echo ""
    echo "3. 填写映射信息:"
    echo -e "   ${YELLOW}映射类型:${NC} HTTP"
    echo -e "   ${YELLOW}映射模板:${NC} 不使用模板"
    echo -e "   ${YELLOW}外网域名:${NC} 系统分配或自定义"
    echo -e "   ${YELLOW}内网主机:${NC} ${GREEN}127.0.0.1${NC}"
    echo -e "   ${YELLOW}内网端口:${NC} ${GREEN}${HSK_WEBHOOK_PORT}${NC}"
    echo ""
    echo "4. 保存后，复制系统分配的公网域名"
    echo "   格式类似: http://xxx.vicp.fun 或 http://xxx.go176.net"
    echo ""
    
    # Ask for the domain
    while true; do
        read -p "请输入你的花生壳公网域名 (如 http://xxx.vicp.fun): " HSK_DOMAIN
        
        if [[ -z "$HSK_DOMAIN" ]]; then
            print_error "域名不能为空"
            continue
        fi
        
        # Normalize domain (add http:// if missing)
        if [[ ! "$HSK_DOMAIN" =~ ^https?:// ]]; then
            HSK_DOMAIN="http://${HSK_DOMAIN}"
            print_info "已自动添加 http:// 前缀"
        fi
        
        # Remove trailing slash
        HSK_DOMAIN="${HSK_DOMAIN%/}"
        
        print_info "你的 Webhook 完整地址将是:"
        echo -e "   ${GREEN}${HSK_DOMAIN}${HSK_WEBHOOK_PATH}${NC}"
        echo ""
        
        read -p "确认正确? [Y/n] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            break
        fi
    done
    
    export HSK_DOMAIN
    echo "$HSK_DOMAIN" > /tmp/hsk_domain.txt
}

# ==================== STEP 4: Configure OpenClaw ====================

step4_configure_openclaw() {
    print_header "Step 4: 配置 OpenClaw Gateway"
    
    # Read domain from file if exists
    if [[ -f /tmp/hsk_domain.txt ]]; then
        HSK_DOMAIN=$(cat /tmp/hsk_domain.txt)
    fi
    
    if [[ -z "${HSK_DOMAIN:-}" ]]; then
        print_error "未获取到花生壳域名"
        return 1
    fi
    
    print_info "检查 OpenClaw 配置..."
    
    # Backup existing config
    local backup_file="${OPENCLAW_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$OPENCLAW_CONFIG" "$backup_file"
    print_success "已备份原配置到: $backup_file"
    
    # Check if we need to update config
    local needs_update=false
    
    if ! grep -q '"connectionMode": "webhook"' "$OPENCLAW_CONFIG" 2>/dev/null; then
        print_warning "Tencent IM 需要切换到 webhook 模式"
        needs_update=true
    fi
    
    if ! grep -q '"bind": "lan"' "$OPENCLAW_CONFIG" 2>/dev/null; then
        print_warning "Gateway 需要绑定到 LAN"
        needs_update=true
    fi
    
    if [[ "$needs_update" == true ]]; then
        print_info "正在更新配置..."
        
        # Use Python or jq to update JSON if available
        if command_exists python3; then
            python3 << EOF
import json
import sys

config_file = "$OPENCLAW_CONFIG"

with open(config_file, 'r') as f:
    config = json.load(f)

# Update gateway bind mode
if 'gateway' not in config:
    config['gateway'] = {}
config['gateway']['bind'] = 'lan'

# Ensure auth token exists
if 'auth' not in config['gateway']:
    config['gateway']['auth'] = {'mode': 'token', 'token': ''}
if config['gateway']['auth'].get('mode') == 'token' and not config['gateway']['auth'].get('token'):
    import secrets
    config['gateway']['auth']['token'] = secrets.token_hex(32)

# Allow insecure auth for LAN access
if 'controlUi' not in config['gateway']:
    config['gateway']['controlUi'] = {}
config['gateway']['controlUi']['allowInsecureAuth'] = True

# Update Tencent IM to webhook mode
if 'channels' not in config:
    config['channels'] = {}
if 'tencent-im' not in config['channels']:
    config['channels']['tencent-im'] = {
        'enabled': True,
        'sdkAppId': '',
        'secretKey': '',
        'adminUserId': '',
        'userId': ''
    }

config['channels']['tencent-im']['connectionMode'] = 'webhook'
config['channels']['tencent-im']['webhookPort'] = ${HSK_WEBHOOK_PORT}
config['channels']['tencent-im']['webhookPath'] = '${HSK_WEBHOOK_PATH}'

with open(config_file, 'w') as f:
    json.dump(config, f, indent=2)

print('配置更新完成')
EOF
            print_success "OpenClaw 配置已更新"
        else
            print_warning "未找到 python3，请手动修改配置文件:"
            echo "  配置文件路径: $OPENCLAW_CONFIG"
            echo ""
            echo "  需要添加/修改的内容:"
            echo '  1. gateway.bind = "lan"'
            echo '  2. gateway.controlUi.allowInsecureAuth = true'
            echo '  3. channels.tencent-im.connectionMode = "webhook"'
            echo "  4. channels.tencent-im.webhookPort = ${HSK_WEBHOOK_PORT}"
            echo '  5. channels.tencent-im.webhookPath = "'"${HSK_WEBHOOK_PATH}"'"'
        fi
    else
        print_success "配置检查通过，无需修改"
    fi
    
    echo ""
    read -p "按回车继续..."
}

# ==================== STEP 5: Restart Services ====================

step5_restart_services() {
    print_header "Step 5: 重启服务"
    
    print_info "重启 OpenClaw Gateway..."
    
    # Try different methods to restart
    if systemctl --user status openclaw-gateway >/dev/null 2>&1; then
        systemctl --user restart openclaw-gateway
        print_success "OpenClaw Gateway 已重启 (systemd)"
    elif command_exists pnpm && [[ -d "$PROJECT_ROOT" ]]; then
        cd "$PROJECT_ROOT"
        pnpm openclaw gateway restart 2>/dev/null || true
        print_success "OpenClaw Gateway 已重启 (pnpm)"
    else
        print_warning "请手动重启 OpenClaw Gateway"
        print_info "命令: systemctl --user restart openclaw-gateway"
        print_info "  或: pnpm openclaw gateway restart"
    fi
    
    # Wait for service to start
    echo ""
    print_info "等待服务启动 (3秒)..."
    sleep 3
    
    # Check status
    if systemctl --user status openclaw-gateway >/dev/null 2>&1; then
        echo ""
        systemctl --user status openclaw-gateway --no-pager 2>/dev/null | head -10 || true
    fi
    
    echo ""
    read -p "按回车继续..."
}

# ==================== STEP 6: Test Connection ====================

step6_test_connection() {
    print_header "Step 6: 测试连通性"
    
    # Read domain from file if exists
    if [[ -f /tmp/hsk_domain.txt ]]; then
        HSK_DOMAIN=$(cat /tmp/hsk_domain.txt)
    fi
    
    if [[ -z "${HSK_DOMAIN:-}" ]]; then
        print_error "未获取到花生壳域名，跳过测试"
        return 1
    fi
    
    local webhook_url="${HSK_DOMAIN}${HSK_WEBHOOK_PATH}"
    
    print_info "测试本地 Gateway..."
    if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${HSK_WEBHOOK_PORT}${HSK_WEBHOOK_PATH}" -X POST -d '{}' 2>/dev/null | grep -q "200\|401\|403"; then
        print_success "本地 Gateway 响应正常"
    else
        print_warning "本地 Gateway 未响应"
        print_info "请确保 OpenClaw Gateway 已启动"
    fi
    
    echo ""
    print_info "测试公网 Webhook 地址..."
    print_info "Webhook URL: ${webhook_url}"
    echo ""
    
    # Test with timeout
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${webhook_url}" -X POST -H "Content-Type: application/json" -d '{"test":"connectivity"}' 2>/dev/null || echo "000")
    
    case "$http_code" in
        200)
            print_success "公网 Webhook 可访问 (HTTP 200)"
            ;;
        401|403)
            print_success "公网 Webhook 可访问 (HTTP ${http_code} - 认证正常)"
            ;;
        000)
            print_error "无法连接到公网 Webhook"
            print_info "可能原因:"
            echo "  1. 花生壳客户端未运行"
            echo "  2. 映射配置错误"
            echo "  3. 网络防火墙阻止"
            ;;
        *)
            print_warning "公网 Webhook 返回 HTTP ${http_code}"
            print_info "可能是正常的，腾讯云回调会携带正确的数据格式"
            ;;
    esac
    
    echo ""
    print_info "模拟腾讯云回调测试..."
    local test_payload='{"CallbackCommand":"C2C.CallbackAfterSendMsg","From_Account":"test_user","To_Account":"bot","MsgBody":[{"MsgType":"TIMTextElem","MsgContent":{"Text":"Hello"}}]}'
    
    local response
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_payload" \
        --max-time 10 \
        "${webhook_url}" 2>/dev/null || echo '{"error":"connection failed"}')
    
    if echo "$response" | grep -q '"code".*0\|success\|ok'; then
        print_success "回调测试成功"
        echo "  响应: $response"
    else
        print_warning "回调测试返回: $response"
        print_info "如果返回包含 code:0，说明配置正确"
    fi
    
    echo ""
    read -p "按回车继续..."
}

# ==================== STEP 7: Display Summary ====================

step7_display_summary() {
    print_header "配置完成总结"
    
    # Read domain from file if exists
    if [[ -f /tmp/hsk_domain.txt ]]; then
        HSK_DOMAIN=$(cat /tmp/hsk_domain.txt)
    fi
    
    if [[ -n "${HSK_DOMAIN:-}" ]]; then
        echo -e "${GREEN}花生壳公网域名:${NC}"
        echo "  ${HSK_DOMAIN}"
        echo ""
        echo -e "${GREEN}Tencent IM Webhook 地址:${NC}"
        echo -e "  ${YELLOW}${HSK_DOMAIN}${HSK_WEBHOOK_PATH}${NC}"
        echo ""
    fi
    
    echo -e "${GREEN}下一步操作:${NC}"
    echo ""
    echo "1. 登录腾讯云 IM 控制台:"
    echo "   https://console.cloud.tencent.com/im/callback-setting"
    echo ""
    echo "2. 配置回调 URL:"
    if [[ -n "${HSK_DOMAIN:-}" ]]; then
        echo -e "   ${YELLOW}${HSK_DOMAIN}${HSK_WEBHOOK_PATH}${NC}"
    else
        echo "   [你的花生壳域名]/webhook/tencent-im"
    fi
    echo ""
    echo "3. 勾选以下回调命令:"
    echo "   ☑ C2C.CallbackAfterSendMsg  (单聊消息)"
    echo "   ☑ Group.CallbackAfterSendMsg (群聊消息)"
    echo ""
    echo "4. 保存配置并启用回调"
    echo ""
    
    echo -e "${GREEN}常用命令:${NC}"
    echo "  查看 Gateway 状态: systemctl --user status openclaw-gateway"
    echo "  重启 Gateway:       systemctl --user restart openclaw-gateway"
    echo "  查看日志:           tail -f /tmp/openclaw/openclaw-*.log"
    echo ""
    
    echo -e "${GREEN}故障排查:${NC}"
    echo "  1. 确保花生壳客户端正在运行"
    echo "  2. 确保 OpenClaw Gateway 正在运行"
    echo "  3. 检查防火墙是否放行 ${HSK_WEBHOOK_PORT} 端口"
    echo "  4. 查看日志: journalctl --user -u openclaw-gateway -f"
    echo ""
    
    # Save config summary
    local summary_file="${HOME}/.openclaw/tencent-im-hsk-config.txt"
    cat > "$summary_file" << EOF
Tencent IM + HSK 配置信息
========================
生成时间: $(date)

花生壳域名: ${HSK_DOMAIN:-未配置}
Webhook URL: ${HSK_DOMAIN:-}${HSK_WEBHOOK_PATH}
本地端口: ${HSK_WEBHOOK_PORT}

腾讯云 IM 回调配置:
1. 登录: https://console.cloud.tencent.com/im/callback-setting
2. 回调 URL: ${HSK_DOMAIN:-}${HSK_WEBHOOK_PATH}
3. 勾选: C2C.CallbackAfterSendMsg, Group.CallbackAfterSendMsg

OpenClaw 配置:
配置文件: ${OPENCLAW_CONFIG}
备份文件: ${OPENCLAW_CONFIG}.backup.*
EOF
    
    print_info "配置信息已保存到: $summary_file"
    echo ""
}

# ==================== Main ====================

main() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                              ║${NC}"
    echo -e "${BLUE}║      Tencent IM + 花生壳 内网穿透 一键配置脚本               ║${NC}"
    echo -e "${BLUE}║                                                              ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Check if running in interactive mode
    if [[ ! -t 0 ]]; then
        print_warning "非交互式终端 detected，部分功能可能无法使用"
        print_info "建议在终端中运行: bash scripts/setup-tencent-im-hsk.sh"
        sleep 2
    fi
    
    # Run all steps
    step1_check_prerequisites
    step2_install_hsk
    step3_configure_hsk_mapping
    step4_configure_openclaw
    step5_restart_services
    step6_test_connection
    step7_display_summary
    
    print_header "全部完成！"
    print_info "现在你可以去腾讯云控制台配置回调了"
    echo ""
}

# Run main function
main "$@"
