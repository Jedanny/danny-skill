#!/bin/bash
# detect-tools.sh - 检测已安装的 AI 编码工具

detect_claude_code() {
    if command -v claude &> /dev/null; then
        echo "claude-code:found"
        return 0
    else
        echo "claude-code:not-found"
        return 1
    fi
}

detect_cursor() {
    if [ -d "$HOME/AppData/Local/Cursor" ] || [ -d "/Applications/Cursor.app" ]; then
        echo "cursor:found"
        return 0
    else
        echo "cursor:not-found"
        return 1
    fi
}

detect_opencode() {
    if command -v opencode &> /dev/null; then
        echo "opencode:found"
        return 0
    else
        echo "opencode:not-found"
        return 1
    fi
}

# Main detection
echo "Detecting AI coding tools..."
echo "---"

detect_claude_code
detect_cursor
detect_opencode

echo "---"
echo "Detection complete"
