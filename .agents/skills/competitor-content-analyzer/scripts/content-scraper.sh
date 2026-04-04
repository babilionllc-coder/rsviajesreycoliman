#!/bin/bash
# Firecrawl Content Scraper
# Usage: bash content-scraper.sh "https://url-to-scrape.com/page"

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/../../.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

URL="${1:?Usage: content-scraper.sh \"https://url-to-scrape.com/page\"}"

if [ -z "$FIRECRAWL_API_KEY" ]; then
  echo "Error: FIRECRAWL_API_KEY not set in .env"
  exit 1
fi

echo "🕷️ Scraping content from: $URL"

curl -s -X POST \
  "https://api.firecrawl.dev/v1/scrape" \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$URL\",
    \"formats\": [\"markdown\"]
  }" | python3 -c "
import json, sys
data = json.load(sys.stdin)

if not data.get('success'):
    print(f'Error: {data.get(\"error\", \"Unknown error\")}')
    sys.exit(1)

content = data.get('data', {})
markdown = content.get('markdown', '')
metadata = content.get('metadata', {})

print(f'📄 Title: {metadata.get(\"title\", \"N/A\")}')
print(f'📝 Description: {metadata.get(\"description\", \"N/A\")[:150]}')
print(f'📊 Word Count: ~{len(markdown.split())}')
print(f'🔗 URL: {metadata.get(\"sourceURL\", URL)}')

# Count headings
h2_count = markdown.count('\n## ')
h3_count = markdown.count('\n### ')
print(f'📋 Structure: {h2_count} H2 headings, {h3_count} H3 headings')
print()
print('=' * 80)
print('FULL CONTENT (Markdown):')
print('=' * 80)
print(markdown[:5000])
if len(markdown) > 5000:
    print(f'\n... [truncated, total {len(markdown)} chars]')
"
