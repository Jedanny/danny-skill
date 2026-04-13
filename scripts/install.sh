#!/bin/bash
# install.sh - danny-skill installer

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

AUTO_INSTALL="false"
DRY_RUN="false"
TARGET_TOOL="detected"
TARGET_ROOT="$HOME"
INSTALL_MODE="link"
REPLACE_EXISTING="false"

usage() {
    cat <<'USAGE'
Usage: ./scripts/install.sh [options]

Options:
  -y, --yes                         Run without interactive prompts
  --dry-run                         Print planned writes without copying
  --mode <link|copy>                Install by symlink/junction or copy (default: link)
  --copy                            Shortcut for --mode copy
  --replace                         Replace existing skill paths before installing
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
        --mode)
            if [ "$#" -lt 2 ]; then
                echo "Missing value for --mode" >&2
                exit 1
            fi
            INSTALL_MODE="$2"
            shift 2
            ;;
        --copy)
            INSTALL_MODE="copy"
            shift
            ;;
        --replace)
            REPLACE_EXISTING="true"
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

case "$INSTALL_MODE" in
    link|copy)
        ;;
    *)
        echo "Unsupported install mode: $INSTALL_MODE" >&2
        usage >&2
        exit 1
        ;;
esac

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

is_windows_shell() {
    case "$(uname -s 2>/dev/null || true)" in
        MINGW*|MSYS*|CYGWIN*)
            return 0
            ;;
    esac

    [ "${OS:-}" = "Windows_NT" ] && command -v cmd.exe >/dev/null 2>&1 && command -v cygpath >/dev/null 2>&1
}

create_directory_link() {
    local source="$1"
    local target="$2"

    if is_windows_shell && command -v cmd.exe >/dev/null 2>&1 && command -v cygpath >/dev/null 2>&1; then
        cmd.exe /c mklink /J "$(cygpath -w "$target")" "$(cygpath -w "$source")" >/dev/null
    else
        ln -s "$source" "$target"
    fi
}

install_skill() {
    local source="$1"
    local target="$2"
    local skill_name
    skill_name="$(basename "$source")"

    if [ "$DRY_RUN" = "true" ]; then
        if [ "$REPLACE_EXISTING" = "true" ]; then
            echo "DRY RUN: would replace $target"
        fi

        if [ "$INSTALL_MODE" = "link" ]; then
            echo "DRY RUN: would link $source to $target"
        else
            echo "DRY RUN: would copy $source to $target"
        fi
        return 0
    fi

    if [ -e "$target" ] || [ -L "$target" ]; then
        if [ "$REPLACE_EXISTING" = "true" ]; then
            rm -rf "$target"
        elif [ -L "$target" ] && [ "$(readlink "$target")" = "$source" ]; then
            echo "  Linked: $skill_name"
            return 0
        else
            echo "  Skipped existing $target (use --replace to overwrite)" >&2
            return 0
        fi
    fi

    if [ "$INSTALL_MODE" = "link" ]; then
        create_directory_link "$source" "$target"
        echo "  Linked: $skill_name"
    else
        mkdir -p "$target"
        cp -R "$source"/. "$target"/
        echo "  Copied: $skill_name"
    fi
}

install_skills_to() {
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

            install_skill "$skill" "$target"
        fi
    done
}

install_tool() {
    local tool="$1"
    local destination
    destination="$(destination_for_tool "$tool")"

    echo "Installing skills for $tool using $INSTALL_MODE mode..."
    install_skills_to "$destination"
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
