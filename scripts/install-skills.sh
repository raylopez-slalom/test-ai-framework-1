#!/usr/bin/env bash
# install-skills.sh — copies the shared skills library into a target project
#
# Usage:
#   bash scripts/install-skills.sh /path/to/project
#   bash scripts/install-skills.sh /path/to/project --agent copilot
#   bash scripts/install-skills.sh /path/to/project --update
#
# --agent claude  (default) installs Claude Code slash commands → .claude/commands/
# --agent copilot           installs Copilot instructions → .github/copilot-instructions.md
#
# On --update: agent is read from the stored version file; --agent is ignored.
# Run from inside the ai-workshop repo.

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

# ── Args ──────────────────────────────────────────────────────────────────────
TARGET="${1:-}"
UPDATE_MODE=false
AGENT="claude"

if [ -z "$TARGET" ]; then
  echo "Usage: bash scripts/install-skills.sh /path/to/project [--agent claude|copilot] [--update]"
  exit 1
fi

if [ ! -d "$TARGET" ]; then
  echo -e "${RED}Target directory not found: $TARGET${NC}"
  exit 1
fi

shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --update)      UPDATE_MODE=true ;;
    --agent)       AGENT="${2:-claude}"; shift ;;
    --agent=*)     AGENT="${1#--agent=}" ;;
    *)             echo -e "${YELLOW}Unknown argument: $1 (ignored)${NC}" ;;
  esac
  shift
done

if [ "$AGENT" != "claude" ] && [ "$AGENT" != "copilot" ]; then
  echo -e "${RED}Unknown agent: $AGENT. Use 'claude' or 'copilot'.${NC}"
  exit 1
fi

# ── Resolve paths ─────────────────────────────────────────────────────────────
FRAMEWORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_SRC="$FRAMEWORK_DIR/.claude/skills"
VERSION_FILE="$TARGET/.claude/.skills-version"
CURRENT_VERSION=$(git -C "$FRAMEWORK_DIR" describe --tags --always 2>/dev/null || echo "untagged")

mkdir -p "$TARGET/.claude"

# ── On --update, always use the stored agent (never switch agents mid-project) ─
if $UPDATE_MODE && [ -f "$VERSION_FILE" ]; then
  STORED_AGENT=$(grep '^Agent:' "$VERSION_FILE" 2>/dev/null | awk '{print $2}' || echo "")
  if [ -n "$STORED_AGENT" ]; then
    if [ "$AGENT" != "claude" ] && [ "$AGENT" != "$STORED_AGENT" ]; then
      echo -e "${YELLOW}⚠  --agent $AGENT ignored on --update. Using stored agent: $STORED_AGENT${NC}"
    fi
    AGENT="$STORED_AGENT"
  fi
fi

echo "Agent: $AGENT  |  Framework: $CURRENT_VERSION  |  Mode: $([ $UPDATE_MODE = true ] && echo update || echo install)"
echo ""

# ── Install skills (agent-specific) ──────────────────────────────────────────
INSTALLED=0; UPDATED=0; SKIPPED=0

if [ "$AGENT" = "claude" ]; then
  # ── Claude Code: skills → .claude/commands/ ─────────────────────────────────
  SKILLS_DEST="$TARGET/.claude/commands"
  mkdir -p "$SKILLS_DEST"
  echo "Skills → $SKILLS_DEST"
  echo ""

  for skill_file in "$SKILLS_SRC"/*.md; do
    skill_name=$(basename "$skill_file")
    dest_file="$SKILLS_DEST/$skill_name"
    if [ -f "$dest_file" ]; then
      if $UPDATE_MODE; then
        if ! diff -q "$skill_file" "$dest_file" > /dev/null 2>&1; then
          cp "$skill_file" "$dest_file"
          echo -e "  ${GREEN}↑ updated${NC}  $skill_name"
          UPDATED=$((UPDATED + 1))
        else
          echo -e "  ${YELLOW}= current${NC}  $skill_name"
          SKIPPED=$((SKIPPED + 1))
        fi
      else
        echo -e "  ${YELLOW}! exists${NC}   $skill_name (use --update to overwrite)"
        SKIPPED=$((SKIPPED + 1))
      fi
    else
      cp "$skill_file" "$dest_file"
      echo -e "  ${GREEN}+ installed${NC} $skill_name"
      INSTALLED=$((INSTALLED + 1))
    fi
  done

  # .claude/settings.json — Claude-only
  SETTINGS_SRC="$FRAMEWORK_DIR/templates/.claude/settings.json"
  SETTINGS_DEST="$TARGET/.claude/settings.json"
  if [ ! -f "$SETTINGS_DEST" ] && [ -f "$SETTINGS_SRC" ]; then
    cp "$SETTINGS_SRC" "$SETTINGS_DEST"
    echo -e "${GREEN}Copied .claude/settings.json${NC}"
  fi

elif [ "$AGENT" = "copilot" ]; then
  # ── GitHub Copilot: skills → .github/copilot-instructions.md + AGENTS.md ───
  COPILOT_SRC="$FRAMEWORK_DIR/templates/copilot-instructions.md"
  COPILOT_DEST="$TARGET/.github/copilot-instructions.md"
  AGENTS_SRC="$FRAMEWORK_DIR/templates/AGENTS.md"
  AGENTS_DEST="$TARGET/AGENTS.md"

  mkdir -p "$TARGET/.github"

  # copilot-instructions.md
  if [ -f "$COPILOT_DEST" ]; then
    if $UPDATE_MODE; then
      if ! diff -q "$COPILOT_SRC" "$COPILOT_DEST" > /dev/null 2>&1; then
        cp "$COPILOT_SRC" "$COPILOT_DEST"
        echo -e "  ${GREEN}↑ updated${NC}  .github/copilot-instructions.md"
        UPDATED=$((UPDATED + 1))
      else
        echo -e "  ${YELLOW}= current${NC}  .github/copilot-instructions.md"
        SKIPPED=$((SKIPPED + 1))
      fi
    else
      echo -e "  ${YELLOW}! exists${NC}   .github/copilot-instructions.md (use --update to overwrite)"
      SKIPPED=$((SKIPPED + 1))
    fi
  else
    cp "$COPILOT_SRC" "$COPILOT_DEST"
    echo -e "  ${GREEN}+ installed${NC} .github/copilot-instructions.md"
    INSTALLED=$((INSTALLED + 1))
  fi

  # AGENTS.md
  if [ -f "$AGENTS_DEST" ]; then
    if $UPDATE_MODE; then
      if ! diff -q "$AGENTS_SRC" "$AGENTS_DEST" > /dev/null 2>&1; then
        cp "$AGENTS_SRC" "$AGENTS_DEST"
        echo -e "  ${GREEN}↑ updated${NC}  AGENTS.md"
        UPDATED=$((UPDATED + 1))
      else
        echo -e "  ${YELLOW}= current${NC}  AGENTS.md"
        SKIPPED=$((SKIPPED + 1))
      fi
    else
      echo -e "  ${YELLOW}! exists${NC}   AGENTS.md (use --update to overwrite)"
      SKIPPED=$((SKIPPED + 1))
    fi
  else
    cp "$AGENTS_SRC" "$AGENTS_DEST"
    echo -e "  ${GREEN}+ installed${NC} AGENTS.md"
    INSTALLED=$((INSTALLED + 1))
  fi
fi

# ── Shared: templates, .mcp.json, hooks, CI ───────────────────────────────────
echo ""

TEMPLATES_DEST="$TARGET/templates"
if [ ! -d "$TEMPLATES_DEST" ]; then
  cp -r "$FRAMEWORK_DIR/templates" "$TEMPLATES_DEST"
  echo -e "${GREEN}Copied templates/ to $TEMPLATES_DEST${NC}"
fi

MCP_SRC="$FRAMEWORK_DIR/templates/mcp.json"
MCP_DEST="$TARGET/.mcp.json"
if [ ! -f "$MCP_DEST" ] && [ -f "$MCP_SRC" ]; then
  cp "$MCP_SRC" "$MCP_DEST"
  echo -e "${GREEN}Created .mcp.json at project root${NC} — fill in credentials, it is gitignored"
fi

HOOKS_DEST="$TARGET/scripts"
if [ ! -d "$HOOKS_DEST" ]; then
  cp -r "$FRAMEWORK_DIR/scripts" "$HOOKS_DEST"
  chmod +x "$HOOKS_DEST/hooks/"* "$HOOKS_DEST/setup-hooks.sh" 2>/dev/null || true
  echo -e "${GREEN}Copied scripts/ to $HOOKS_DEST${NC}"
fi

CI_SRC="$FRAMEWORK_DIR/templates/ci"
CI_DEST="$TARGET/.github/workflows"
# Only copies top-level .yml files (GitHub Actions).
# ADO pipelines live in templates/ci/ado/ and must be copied manually.
if [ ! -f "$CI_DEST/jira-close-on-merge.yml" ] && [ -d "$CI_SRC" ]; then
  mkdir -p "$CI_DEST"
  find "$CI_SRC" -maxdepth 1 -name "*.yml" -exec cp {} "$CI_DEST/" \;
  echo -e "${GREEN}Copied GitHub Actions workflows to $CI_DEST${NC}"
  echo -e "  ${YELLOW}→ Add JIRA_URL, JIRA_EMAIL, JIRA_TOKEN to GitHub repo secrets to enable JIRA automation${NC}"
  echo -e "  ${YELLOW}→ Azure DevOps pipeline: copy templates/ci/ado/ manually (not installed by default)${NC}"
fi

# ── Record version + agent ────────────────────────────────────────────────────
{
  echo "$CURRENT_VERSION"
  echo "$(date -u '+%Y-%m-%d %H:%M UTC')"
  echo "Source: $FRAMEWORK_DIR"
  echo "Agent: $AGENT"
} > "$VERSION_FILE"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}Done.${NC} $INSTALLED installed, $UPDATED updated, $SKIPPED unchanged."
echo ""
echo "Framework version: $CURRENT_VERSION  |  Agent: $AGENT"
echo "Version recorded in: $VERSION_FILE"
echo ""
echo "Next steps for $TARGET:"
echo "  1. Fill in .mcp.json credentials (project root, already gitignored)"
echo "     → JIRA: ATLASSIAN_URL, ATLASSIAN_EMAIL, ATLASSIAN_TOKEN"
echo "     → GitHub: GITHUB_PERSONAL_ACCESS_TOKEN"
echo "  2. bash scripts/setup-hooks.sh                 (install git hooks)"
echo "  3. Add GitHub repo secrets for JIRA automation (Settings → Secrets → Actions):"
echo "     → JIRA_URL, JIRA_EMAIL, JIRA_TOKEN"
echo "     → Without these, CI workflows skip gracefully — nothing breaks"
echo "  4. Create docs/ files (architecture-specs.md, product-requirements.md, etc.)"
if [ "$AGENT" = "claude" ]; then
  echo "  5. Generate CLAUDE.md from your docs using the prompt in the getting-started guide"
elif [ "$AGENT" = "copilot" ]; then
  echo "  5. Fill in CLAUDE.md (or generate it from your docs — see getting-started guide)"
  echo "     Copilot reads CLAUDE.md as project context alongside copilot-instructions.md"
fi
echo "  6. cp templates/org-CLAUDE.md ORG-CLAUDE.md    (optional: org-wide conventions)"
echo "  7. cp templates/CONTEXT-OWNERS.md CONTEXT-OWNERS.md  (assign doc owners)"
echo "  8. Fill in scripts/hooks/pre-push              (uncomment your tech stack)"
