#!/bin/bash
# 环境部署脚本 - 创建虚拟环境并安装依赖

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Python 环境部署 ==="
echo "项目根目录: $PROJECT_ROOT"

# 1. 创建虚拟环境
echo ""
echo "[1/2] 创建虚拟环境..."
python -m venv "$SCRIPT_DIR/venv"

# 2. 安装依赖
echo ""
echo "[2/2] 安装依赖..."
# Windows (Git Bash/msys) uses Scripts/, Linux/Mac uses bin/
if [[ -f "$SCRIPT_DIR/venv/Scripts/activate" ]]; then
    source "$SCRIPT_DIR/venv/Scripts/activate"
else
    source "$SCRIPT_DIR/venv/bin/activate"
fi

pip install -r "$SCRIPT_DIR/requirements.txt"

echo ""
echo "=== 环境部署完成 ==="
echo "虚拟环境路径: $SCRIPT_DIR/venv"
echo ""
echo "激活方式:"
if [[ -f "$SCRIPT_DIR/venv/Scripts/activate" ]]; then
    echo "  Windows Git Bash: source $SCRIPT_DIR/venv/Scripts/activate"
    echo "  Windows CMD:      $SCRIPT_DIR\\venv\\Scripts\\activate.bat"
else
    echo "  Linux/Mac: source $SCRIPT_DIR/venv/bin/activate"
fi