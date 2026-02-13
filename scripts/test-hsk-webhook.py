#!/usr/bin/env python3
"""
花生壳 Webhook 地址测试工具
模拟腾讯云 IM 回调请求，测试 Webhook 连通性

用法:
    python3 test-hsk-webhook.py [webhook_url]
    
默认测试地址:
    http://120qcsd114971.vicp.fun/webhook/tencent-im
"""

import sys
import json
import time
import socket
import urllib.request
import urllib.error
from urllib.parse import urlparse
from datetime import datetime

# 颜色代码
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'

def print_header():
    print(f"{Colors.BLUE}{'='*62}{Colors.NC}")
    print(f"{Colors.BLUE}{'花生壳 Webhook 地址测试工具':^60}{Colors.NC}")
    print(f"{Colors.BLUE}{'='*62}{Colors.NC}")
    print()

def print_section(title):
    print(f"{Colors.YELLOW}▶ {title}{Colors.NC}")
    print("-" * 62)

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.NC}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.NC}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.NC}")

def print_info(msg):
    print(f"{Colors.CYAN}ℹ {msg}{Colors.NC}")

def resolve_dns(hostname):
    """解析域名 DNS"""
    try:
        ip = socket.gethostbyname(hostname)
        return ip
    except socket.gaierror as e:
        return None

def make_request(url, payload, timeout=10):
    """发送 HTTP POST 请求"""
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Tencent-IM-Webhook-Test/1.0'
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            end_time = time.time()
            duration = (end_time - start_time) * 1000
            
            body = response.read().decode('utf-8')
            return {
                'status': response.status,
                'body': body,
                'duration': duration,
                'headers': dict(response.headers)
            }
    except urllib.error.HTTPError as e:
        end_time = time.time()
        duration = (end_time - start_time) * 1000
        
        body = e.read().decode('utf-8') if e.read() else ""
        return {
            'status': e.code,
            'body': body,
            'duration': duration,
            'headers': dict(e.headers) if e.headers else {},
            'error': str(e)
        }
    except urllib.error.URLError as e:
        return {
            'status': None,
            'body': str(e.reason),
            'duration': None,
            'error': str(e)
        }
    except Exception as e:
        return {
            'status': None,
            'body': str(e),
            'duration': None,
            'error': str(e)
        }

def test_basic_connectivity(url):
    """测试基础连通性"""
    print_section("测试1: 基础连通性测试")
    
    parsed = urlparse(url)
    hostname = parsed.hostname
    port = parsed.port or 80
    
    # DNS 解析
    print(f"域名: {hostname}")
    ip = resolve_dns(hostname)
    if ip:
        print(f"解析 IP: {ip}")
    else:
        print_error("DNS 解析失败")
        return False
    
    # TCP 连接测试
    print(f"测试 TCP 连接 {ip}:{port}...")
    try:
        sock = socket.create_connection((ip, port), timeout=5)
        sock.close()
        print_success("TCP 连接成功")
    except Exception as e:
        print_error(f"TCP 连接失败: {e}")
        return False
    
    print()
    return True

def test_c2c_callback(url):
    """测试单聊消息回调"""
    print_section("测试2: 模拟单聊消息回调 (C2C.CallbackAfterSendMsg)")
    
    payload = {
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
        "MsgTime": int(time.time())
    }
    
    print("请求体:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print()
    
    result = make_request(url, payload)
    
    if result.get('error') and not result.get('status'):
        print_error(f"请求失败: {result['error']}")
        return False
    
    print(f"HTTP 状态码: {result['status']}")
    if result['duration']:
        print(f"响应时间: {result['duration']:.2f}ms")
    
    print("响应体:")
    try:
        response_json = json.loads(result['body'])
        print(json.dumps(response_json, indent=2, ensure_ascii=False))
    except:
        print(result['body'])
    
    if result['status'] == 200:
        print_success("单聊回调测试通过")
        return True
    else:
        print_error(f"单聊回调测试失败 (HTTP {result['status']})")
        return False

def test_group_callback(url):
    """测试群聊消息回调"""
    print_section("测试3: 模拟群聊消息回调 (Group.CallbackAfterSendMsg)")
    
    payload = {
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
        "MsgTime": int(time.time())
    }
    
    print("请求体:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print()
    
    result = make_request(url, payload)
    
    if result.get('error') and not result.get('status'):
        print_error(f"请求失败: {result['error']}")
        return False
    
    print(f"HTTP 状态码: {result['status']}")
    if result['duration']:
        print(f"响应时间: {result['duration']:.2f}ms")
    
    print("响应体:")
    try:
        response_json = json.loads(result['body'])
        print(json.dumps(response_json, indent=2, ensure_ascii=False))
    except:
        print(result['body'])
    
    if result['status'] == 200:
        print_success("群聊回调测试通过")
        return True
    else:
        print_error(f"群聊回调测试失败 (HTTP {result['status']})")
        return False

def test_at_message(url):
    """测试 @ 消息回调"""
    print_section("测试4: 模拟 @提及 消息回调")
    
    payload = {
        "CallbackCommand": "Group.CallbackAfterSendMsg",
        "From_Account": "test_user_001",
        "GroupId": "@TGS#2TESTGROUP",
        "MsgBody": [
            {
                "MsgType": "TIMTextElem",
                "MsgContent": {
                    "Text": "@user005 你好，这是@消息测试"
                }
            }
        ],
        "AtUserList": ["user005"],
        "MsgTime": int(time.time())
    }
    
    print("请求体: (@提及消息)")
    print()
    
    result = make_request(url, payload)
    
    print(f"HTTP 状态码: {result['status']}")
    if result['duration']:
        print(f"响应时间: {result['duration']:.2f}ms")
    
    if result['status'] == 200:
        print_success("@提及消息回调测试通过")
        return True
    else:
        print_error(f"@提及消息回调测试失败 (HTTP {result['status']})")
        return False

def test_concurrent(url, count=5):
    """并发压力测试"""
    print_section(f"测试5: 并发压力测试 ({count} 次请求)")
    
    payload = {
        "CallbackCommand": "C2C.CallbackAfterSendMsg",
        "From_Account": "test_user_001",
        "To_Account": "user005",
        "MsgBody": [
            {
                "MsgType": "TIMTextElem",
                "MsgContent": {
                    "Text": "并发测试消息"
                }
            }
        ],
        "MsgTime": int(time.time())
    }
    
    success_count = 0
    total_time = 0
    
    for i in range(count):
        result = make_request(url, payload)
        if result['status'] == 200:
            success_count += 1
        if result['duration']:
            total_time += result['duration']
        print(f"  请求 {i+1}/{count}: HTTP {result['status']}, {result['duration']:.2f}ms")
    
    avg_time = total_time / count if count > 0 else 0
    
    print()
    print(f"成功率: {success_count}/{count} ({success_count/count*100:.1f}%)")
    print(f"平均响应时间: {avg_time:.2f}ms")
    
    if success_count == count:
        print_success("并发测试全部通过")
        return True
    else:
        print_warning(f"并发测试部分失败 ({count - success_count} 次失败)")
        return False

def main():
    # 默认 Webhook URL
    default_url = "http://120qcsd114971.vicp.fun/webhook/tencent-im"
    url = sys.argv[1] if len(sys.argv) > 1 else default_url
    
    print_header()
    print(f"目标 URL: {Colors.CYAN}{url}{Colors.NC}")
    print()
    
    # 运行测试
    results = []
    
    results.append(("基础连通性", test_basic_connectivity(url)))
    results.append(("单聊回调", test_c2c_callback(url)))
    results.append(("群聊回调", test_group_callback(url)))
    results.append(("@提及消息", test_at_message(url)))
    results.append(("并发测试", test_concurrent(url, 5)))
    
    # 总结
    print()
    print(f"{Colors.BLUE}{'='*62}{Colors.NC}")
    print(f"{Colors.BLUE}{'测试总结':^60}{Colors.NC}")
    print(f"{Colors.BLUE}{'='*62}{Colors.NC}")
    print()
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = f"{Colors.GREEN}通过{Colors.NC}" if result else f"{Colors.RED}失败{Colors.NC}"
        print(f"  {name:20} {status}")
    
    print()
    print(f"总计: {passed}/{total} 项测试通过")
    print()
    
    if passed == total:
        print_success("所有测试通过！花生壳 Webhook 配置成功！")
        print()
        print("你可以在腾讯云控制台配置回调 URL:")
        print(f"  {Colors.CYAN}{url}{Colors.NC}")
    else:
        print_warning("部分测试未通过，请检查:")
        print("  1. 花生壳客户端是否运行")
        print("  2. 映射配置是否正确")
        print("  3. OpenClaw Gateway 是否启动")
        print("  4. 防火墙是否放行对应端口")
    
    print()
    print("查看 Gateway 日志:")
    print("  journalctl --user -u openclaw-gateway -f | grep tencent")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n测试被中断")
        sys.exit(1)
    except Exception as e:
        print_error(f"测试出错: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
