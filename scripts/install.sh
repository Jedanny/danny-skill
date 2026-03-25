#!/bin/bash
# install.sh - danny-skill 安装脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  danny-skill Installer"
echo "============================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect tools
echo "Detecting installed AI coding tools..."
echo ""

detect_and_install() {
    local tool=$1
    local install_func=$2

    if command -v "$tool" &> /dev/null || [ -d "$HOME/.claude" ]; then
        echo -e "${GREEN}✓${NC} $tool detected"
        if [ "$AUTO_INSTALL" = "true" ]; then
            echo "  Installing assets..."
            eval "$install_func"
            echo -e "  ${GREEN}✓${NC} Installed"
        else
            read -p "  Install assets for $tool? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                eval "$install_func"
                echo -e "  ${GREEN}✓${NC} Installed"
            fi
        fi
    else
        echo -e "${YELLOW}○${NC} $tool not found, skipping"
    fi
}

install_claude_code() {
    local skills_dir="$HOME/.claude/skills"
    mkdir -p "$skills_dir"

    # Copy skills
    if [ -d "$PROJECT_ROOT/assets/skills" ]; then
        cp -r "$PROJECT_ROOT/assets/skills/"* "$skills_dir/"
    fi

    echo "  Claude Code skills installed to $skills_dir"
}

install_cursor() {
    # Cursor 配置路径: $HOME/.cursor/
    # Skills 目录: $HOME/.cursor/skills/
    echo "  [TODO] Cursor adapter not yet implemented"
    return 1
}

install_opencode() {
    # OpenCode 配置路径: $HOME/.config/opencode/
    # Plugins 目录: $HOME/.config/opencode/plugins/
    echo "  [TODO] OpenCode adapter not yet implemented"
    return 1
}

# Main installation flow
if [ "$1" = "-y" ] || [ "$1" = "--yes" ]; then
    AUTO_INSTALL="true"
    echo "Auto-install mode: will install to all detected tools"
    echo ""
else
    AUTO_INSTALL="false"
    echo "Interactive mode: will ask for confirmation"
    echo ""
fi

# Check for Node.js (required for TypeScript build)
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js found: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js first."
    exit 1
fi

# Build TypeScript
echo ""
echo "Building project..."
cd "$PROJECT_ROOT"
if command -v pnpm &> /dev/null; then
    pnpm install
    pnpm run build
    echo -e "${GREEN}✓${NC} Build complete"
elif command -v npm &> /dev/null; then
    npm install
    npm run build
    echo -e "${GREEN}✓${NC} Build complete"
else
    echo -e "${RED}✗${NC} pnpm or npm not found. Please install Node.js first."
    exit 1
fi

echo ""
echo "Installing assets..."

detect_and_install "claude" "install_claude_code"
detect_and_install "cursor" "install_cursor"
detect_and_install "opencode" "install_opencode"

echo ""
echo "============================================"
echo -e "${GREEN}Installation complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Restart your AI coding tool"
echo "  2. Try /read to test read-code skill"
echo "  3. Check ~/.claude/skills/ for installed assets"
echo ""
