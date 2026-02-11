#!/usr/bin/env bash
# 测试花生壳 Webhook 地址连通性
# 模拟腾讯云 IM 回调格式
#
# 用法: ./test-hsk-webhook.sh [webhook_url]
# 默认: http://120qcsd114971.vicp.fun/webhook/tencent-im

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 默认 Webhook URL
DEFAULT_WEBHOOK_URL="http://120qcsd114971.vicp.fun/webhook/tencent-im"
WEBHOOK_URL="${1:-$DEFAULT_WEBHOOK_URL}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          花生壳 Webhook 地址测试工具                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "目标 URL: ${CYAN}${WEBHOOK_URL}${NC}"
echo ""

# 检查依赖
if ! command -v curl &> /dev/null; then
    echo -e "${RED}错误: 需要安装 curl${NC}"
    exit 1
fi

# 测试函数
test_basic_connectivity() {
    echo -e "${YELLOW}▶ 测试1: 基础连通性测试${NC}"
    echo "───────────────────────────────────────────────────────────"
    
    local start_time end_time duration
    start_time=$(date +%s%N)
    
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}\n%{time_total}" \
        --max-time 10 \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"test":"connectivity"}' \
        "${WEBHOOK_URL}" 2>/dev/null | head -1)
    
    end_time=$(date +%s%N)
    duration=$(( (end_time - start_time) / 1000000 ))
    
    echo "HTTP 状态码: ${http_code}"
    echo "响应时间: ${duration}ms"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ 基础连通性测试通过${NC}"
    elif [ "$http_code" = "000" ]; then
        echo -e "${RED}✗ 无法连接到服务器${NC}"
        echo "可能原因:"
        echo "  - 花生壳客户端未运行"
        echo "  - 映射配置错误"
        echo "  - 网络防火墙阻止"
        return 1
    else
        echo -e "${YELLOW}⚠ 返回 HTTP ${http_code}（可能是正常的，取决于服务端实现）${NC}"
    fi
    echo ""
}

test_c2c_callback() {
    echo -e "${YELLOW}▶ 测试2: 模拟单聊消息回调 (C2C.CallbackAfterSendMsg)${NC}"
    echo "───────────────────────────────────────────────────────────"
    
    local payload='{
        "CallbackCommand": "C2C.CallbackAfterSendMsg",
        "From_Account": "test_user_001",
        "To_Account": "user005",
        "MsgBody": [
            {
                "MsgType": "TIMTextElem",
                "MsgContent": {
                    "Text": "你好，这是一条测试消息"
                }
            }
        ],
        "MsgRandom": 123456,
        "MsgSeq": 1,
        "MsgTime": '$(date +%s)'
    }'
    
    echo "请求体:"
    echo "$payload" | python3 -m json.tool 2>/dev/null || echo "$payload"
    echo ""
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        --max-time 10 \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${WEBHOOK_URL}" 2>/dev/null)
    
    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | sed '$d')
    
    echo "HTTP 状态码: ${http_code}"
    echo "响应体:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ 单聊回调测试通过${NC}"
    else
        echo -e "${RED}✗ 单聊回调测试失败${NC}"
    fi
    echo ""
}

test_group_callback() {
    echo -e "${YELLOW}▶ 测试3: 模拟群聊消息回调 (Group.CallbackAfterSendMsg)${NC}"
    echo "───────────────────────────────────────────────────────────"
    
    local payload='{
        "CallbackCommand": "Group.CallbackAfterSendMsg",
        "From_Account": "test_user_001",
        "GroupId": "@TGS#2TESTGROUP",
        "MsgBody": [
            {
                "MsgType": "TIMTextElem",
                "MsgContent": {
                    "Text": "大家好，这是群聊测试消息"
                }
            }
        ],
        "MsgRandom": 654321,
        "MsgSeq": 1,
        "MsgTime": '$(date +%s)'
    }'
    
    echo "请求体:"
    echo "$payload" | python3 -m json.tool 2>/dev/null || echo "$payload"
    echo ""
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        --max-time 10 \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${WEBHOOK_URL}" 2>/dev/null)
    
    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | sed '$d')
    
    echo "HTTP 状态码: ${http_code}"
    echo "响应体:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ 群聊回调测试通过${NC}"
    else
        echo -e "${RED}✗ 群聊回调测试失败${NC}"
    fi
    echo ""
}

test_image_message() {
    echo -e "${YELLOW}▶ 测试4: 模拟图片消息回调${NC}"
    echo "───────────────────────────────────────────────────────────"
    
    local payload='{
        "CallbackCommand": "C2C.CallbackAfterSendMsg",
        "From_Account": "test_user_001",
        "To_Account": "user005",
        "MsgBody": [
            {
                "MsgType": "TIMImageElem",
                "MsgContent": {
                    "UUID": "test-image-uuid",
                    "ImageFormat": 1,
                    "ImageInfoArray": [
                        {
                            "Type": 1,
                            "Size": 1024,
                            "Width": 100,
                            "Height": 100,
                            "URL": "https://example.com/test.jpg"
                        }
                    ]
                }
            }
        ],
        "MsgTime": '$(date +%s)'
    }'
    
    echo "请求体: (图片消息)"
    echo ""
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        --max-time 10 \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${WEBHOOK_URL}" 2>/dev/null)
    
    local http_code=$(echo "$response" | tail -1)
    echo "HTTP 状态码: ${http_code}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ 图片消息回调测试通过${NC}"
    else
        echo -e "${RED}✗ 图片消息回调测试失败${NC}"
    fi
    echo ""
}

show_dns_info() {
    echo -e "${YELLOW}▶ DNS 解析信息${NC}"
    echo "───────────────────────────────────────────────────────────"
    
    # 提取域名
    local domain
    domain=$(echo "$WEBHOOK_URL" | sed -E 's|https?://([^/:]+).*|\1|')
    
    echo "域名: ${domain}"
    echo ""
    
    if command -v nslookup &> /dev/null; then
        echo "nslookup 结果:"
        nslookup "$domain" 2>/dev/null | grep -E "Address|Name" | head -5 || echo "  解析失败"
    elif command -v dig &> /dev/null; then
        echo "dig 结果:"
        dig +short "$domain" 2>/dev/null | head -5 || echo "  解析失败"
    else
        echo "未找到 nslookup 或 dig 命令，跳过 DNS 解析"
    fi
    echo ""
}

# 主程序
main() {
    # 显示 DNS 信息
    show_dns_info
    
    # 运行测试
    test_basic_connectivity
    test_c2c_callback
    test_group_callback
    test_image_message
    
    # 总结
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                        测试总结                               ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "如果以上测试都返回 ${GREEN}HTTP 200${NC}，说明花生壳 Webhook 配置成功！"
    echo ""
    echo "你可以在腾讯云控制台配置回调 URL:"
    echo -e "  ${CYAN}${WEBHOOK_URL}${NC}"
    echo ""
    echo "并在 OpenClaw Gateway 日志中查看收到的消息:"
    echo "  journalctl --user -u openclaw-gateway -f | grep tencent"
    echo ""
}

main "$@"
