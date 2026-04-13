#!/bin/bash
# install.sh - danny-skill installer

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

AUTO_INSTALL="false"
DRY_RUN="false"
TARGET_TOOL="detected"
TARGET_ROOT="$HOME"

usage() {
    cat <<'USAGE'
Usage: ./scripts/install.sh [options]

Options:
  -y, --yes                         Run without interactive prompts
  --dry-run                         Print planned writes without copying
  --tool <claude-code|codex|cursor|opencode|all>
                                     Install for one tool or every supported tool
  --target-root <path>              Use this root instead of $HOME
  -h, --help                        Show this help
USAGE
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        -y|--yes)
            AUTO_INSTALL="true"
            shift
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --tool)
            if [ "$#" -lt 2 ]; then
                echo "Missing value for --tool" >&2
                exit 1
            fi
            TARGET_TOOL="$2"
            shift 2
            ;;
        --target-root)
            if [ "$#" -lt 2 ]; then
                echo "Missing value for --target-root" >&2
                exit 1
            fi
            TARGET_ROOT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage >&2
            exit 1
            ;;
    esac
done

destination_for_tool() {
    case "$1" in
        claude-code)
            echo "$TARGET_ROOT/.claude/skills"
            ;;
        codex)
            echo "$TARGET_ROOT/.codex/skills"
            ;;
        cursor)
            echo "$TARGET_ROOT/.cursor/skills"
            ;;
        opencode)
            echo "$TARGET_ROOT/.opencode/plugins"
            ;;
        *)
            echo "Unsupported tool: $1" >&2
            exit 1
            ;;
    esac
}

copy_skills_to() {
    local destination="$1"

    if [ "$DRY_RUN" = "true" ]; then
        echo "DRY RUN: would create $destination"
    else
        mkdir -p "$destination"
    fi

    for skill in "$PROJECT_ROOT/skills"/*; do
        if [ -d "$skill" ]; then
            local skill_name
            skill_name="$(basename "$skill")"
            local target="$destination/$skill_name"

            if [ "$DRY_RUN" = "true" ]; then
                echo "DRY RUN: would install $skill_name to $target"
            else
                mkdir -p "$target"
                cp -R "$skill"/. "$target"/
                echo "  Installed: $skill_name"
            fi
        fi
    done
}

install_tool() {
    local tool="$1"
    local destination
    destination="$(destination_for_tool "$tool")"

    echo "Installing skills for $tool..."
    copy_skills_to "$destination"
    echo "  $tool skills path: $destination"
}

tool_detected() {
    case "$1" in
        claude-code)
            [ -d "$TARGET_ROOT/.claude" ] || command -v claude >/dev/null 2>&1
            ;;
        codex)
            [ -d "$TARGET_ROOT/.codex" ] || command -v codex >/dev/null 2>&1
            ;;
        cursor)
            [ -d "$TARGET_ROOT/.cursor" ] || [ -d "/Applications/Cursor.app" ] || command -v cursor >/dev/null 2>&1
            ;;
        opencode)
            [ -d "$TARGET_ROOT/.opencode" ] || command -v opencode >/dev/null 2>&1
            ;;
        *)
            return 1
            ;;
    esac
}

confirm_install() {
    local tool="$1"

    if [ "$AUTO_INSTALL" = "true" ]; then
        return 0
    fi

    read -r -p "  Install skills for $tool? (y/n) " reply
    [[ "$reply" =~ ^[Yy]$ ]]
}

echo "============================================"
echo "  danny-skill Installer"
echo "============================================"
echo ""

case "$TARGET_TOOL" in
    all)
        for tool in claude-code codex cursor opencode; do
            install_tool "$tool"
        done
        ;;
    claude-code|codex|cursor|opencode)
        install_tool "$TARGET_TOOL"
        ;;
    detected)
        for tool in claude-code codex cursor opencode; do
            if tool_detected "$tool"; then
                echo "$tool detected"
                if confirm_install "$tool"; then
                    install_tool "$tool"
                fi
            fi
        done
        ;;
    *)
        echo "Unsupported tool: $TARGET_TOOL" >&2
        usage >&2
        exit 1
        ;;
esac

echo ""
echo "Installation complete."
echo "Restart your AI coding tool before using danny-skill skills."
