#!/bin/bash
# DataForSEO Keywords For Site (competitor spy)
# Usage: bash dataforseo-site-keywords.sh "domain.com" [location_code] [language_code]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/../../.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

DOMAIN="${1:?Usage: dataforseo-site-keywords.sh \"domain.com\" [location_code] [language_code]}"
LOCATION="${2:-2484}"
LANGUAGE="${3:-es}"

if [ -z "$DATAFORSEO_AUTH" ]; then
  echo "Error: DATAFORSEO_AUTH not set in .env"
  exit 1
fi

echo "🕵️ Spying on keywords for: $DOMAIN"

curl -s -X POST \
  "https://api.dataforseo.com/v3/dataforseo_labs/google/keywords_for_site/live" \
  -H "Authorization: Basic $DATAFORSEO_AUTH" \
  -H "Content-Type: application/json" \
  -d "[{
    \"target\": \"$DOMAIN\",
    \"location_code\": $LOCATION,
    \"language_code\": \"$LANGUAGE\",
    \"limit\": 30,
    \"order_by\": [\"keyword_info.search_volume,desc\"]
  }]" | python3 -c "
import json, sys
data = json.load(sys.stdin)
tasks = data.get('tasks', [])
if not tasks or not tasks[0].get('result'):
    print('No results found.')
    sys.exit(0)
items = tasks[0]['result'][0].get('items', [])
print(f'Found {len(items)} keywords for domain:\n')
print(f'{\"Keyword\":<50} {\"Volume\":>8} {\"CPC\":>8} {\"Difficulty\":>10}')
print('-' * 80)
for item in items:
    ki = item.get('keyword_info', {})
    kp = item.get('keyword_properties', {})
    kw = item.get('keyword', 'N/A')
    vol = ki.get('search_volume', 0) or 0
    cpc = ki.get('cpc', 0) or 0
    diff = kp.get('keyword_difficulty', 0) or 0
    print(f'{kw:<50} {vol:>8} {cpc:>8.2f} {diff:>10}')
"
