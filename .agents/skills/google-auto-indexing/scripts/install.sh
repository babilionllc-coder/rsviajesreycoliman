#!/bin/bash
# Google Auto-Indexing — One-Command Installer
# Sets up the entire auto-indexing infrastructure in the current project.
#
# Usage:
#   cd /path/to/your/project
#   bash ~/.claude/skills/google-auto-indexing/scripts/install.sh

set -e

SKILL_DIR="$HOME/.claude/skills/google-auto-indexing"
TEMPLATES_DIR="$SKILL_DIR/templates"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Google Auto-Indexing Installer${NC}"
echo ""

# Verify we're in a git repo
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository. cd into your project first.${NC}"
    exit 1
fi

PROJECT_ROOT=$(pwd)
PROJECT_NAME=$(basename "$PROJECT_ROOT")
echo -e "${GREEN}✓${NC} Project root: $PROJECT_ROOT"
echo ""

# Prompt for domain
read -p "Enter your site domain (e.g., mysite.com, no https://): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Domain required.${NC}"
    exit 1
fi

# Create directories
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p .github/workflows
mkdir -p .agents/scripts

# Copy and customize GitHub Action
echo -e "${BLUE}📝 Installing GitHub Action workflow...${NC}"
sed "s|YOURDOMAIN.com|$DOMAIN|g" "$TEMPLATES_DIR/auto-index.yml" > .github/workflows/auto-index.yml
echo -e "${GREEN}✓${NC} .github/workflows/auto-index.yml"

# Copy force_index.js as-is (no customization needed)
cp "$TEMPLATES_DIR/force_index.js" .agents/scripts/force_index.js
echo -e "${GREEN}✓${NC} .agents/scripts/force_index.js"

# Copy auto_sitemap.js with domain substitution
sed "s|https://YOURDOMAIN.com|https://$DOMAIN|g" "$TEMPLATES_DIR/auto_sitemap.js" > .agents/scripts/auto_sitemap.js
echo -e "${GREEN}✓${NC} .agents/scripts/auto_sitemap.js"

# Generate IndexNow key
echo -e "${BLUE}🔑 Generating IndexNow key...${NC}"
INDEXNOW_KEY=$(python3 -c "import uuid; print(uuid.uuid4().hex)")
echo "$INDEXNOW_KEY" > indexnow-key.txt
echo "$INDEXNOW_KEY" > "$INDEXNOW_KEY.txt"
echo -e "${GREEN}✓${NC} indexnow-key.txt"
echo -e "${GREEN}✓${NC} $INDEXNOW_KEY.txt (verification file)"

# Handle .gitignore
if [ -f .gitignore ]; then
    if grep -q "^\*\.txt" .gitignore; then
        echo -e "${YELLOW}⚠${NC}  Adding IndexNow exceptions to .gitignore"
        # Add exceptions after *.txt rule
        if ! grep -q "!indexnow-key.txt" .gitignore; then
            echo "" >> .gitignore
            echo "# IndexNow verification (allow despite *.txt rule)" >> .gitignore
            echo "!indexnow-key.txt" >> .gitignore
            echo "!$INDEXNOW_KEY.txt" >> .gitignore
        fi
    fi
fi

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}           REMAINING MANUAL STEPS              ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}1. Create Google Cloud Service Account:${NC}"
echo "   → https://console.cloud.google.com"
echo "   → Create project → Enable 'Indexing API'"
echo "   → IAM & Admin → Service Accounts → Create"
echo "   → Keys tab → Add Key → JSON (download it)"
echo ""
echo -e "${BLUE}2. Add service account as Owner in Search Console:${NC}"
echo "   → https://search.google.com/search-console"
echo "   → Select property '$DOMAIN'"
echo "   → Settings → Users and permissions → Add user"
echo "   → Email: the client_email from downloaded JSON"
echo "   → Permission: OWNER (not Full user!)"
echo ""
echo -e "${BLUE}3. Add GitHub Secret:${NC}"
REPO_URL=$(git config --get remote.origin.url 2>/dev/null | sed 's/\.git$//' || echo "YOUR_REPO_URL")
echo "   → $REPO_URL/settings/secrets/actions"
echo "   → New repository secret"
echo "   → Name: GOOGLE_SERVICE_ACCOUNT_KEY"
echo "   → Value: paste entire JSON keyfile contents"
echo ""
echo -e "${BLUE}4. Review and customize (if needed):${NC}"
echo "   → .agents/scripts/auto_sitemap.js (update staticUrls list)"
echo ""
echo -e "${BLUE}5. Commit and push:${NC}"
echo "   git add .github .agents indexnow-key.txt $INDEXNOW_KEY.txt"
echo "   git commit -m 'feat: zero-touch search engine auto-indexing'"
echo "   git push origin main"
echo ""
echo -e "${BLUE}6. Verify at:${NC}"
echo "   $REPO_URL/actions"
echo ""
echo -e "${GREEN}After these steps — every push to main auto-indexes on Google + Bing + Yandex.${NC}"
echo -e "${GREEN}No Search Console work, ever again.${NC}"
