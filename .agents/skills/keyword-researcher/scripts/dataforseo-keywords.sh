#!/bin/bash
# DataForSEO Keyword Suggestions
# Usage: bash dataforseo-keywords.sh "seed keyword" [location_code] [language_code]
# Defaults: location=2484 (Mexico), language=es

set -e

# Load env
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/../../.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

KEYWORD="${1:?Usage: dataforseo-keywords.sh \"seed keyword\" [location_code] [language_code]}"
LOCATION="${2:-2484}"
LANGUAGE="${3:-es}"

if [ -z "$DATAFORSEO_AUTH" ]; then
  echo "Error: DATAFORSEO_AUTH not set in .env"
  exit 1
fi

echo "🔍 Searching keywords for: \"$KEYWORD\" (location: $LOCATION, lang: $LANGUAGE)"

curl -s -X POST \
  "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live" \
  -H "Authorization: Basic $DATAFORSEO_AUTH" \
  -H "Content-Type: application/json" \
  -d "[{
    \"keyword\": \"$KEYWORD\",
    \"location_code\": $LOCATION,
    \"language_code\": \"$LANGUAGE\",
    \"include_seed_keyword\": true,
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
print(f'Found {len(items)} keyword suggestions:\n')
print(f'{\"Keyword\":<50} {\"Volume\":>8} {\"CPC\":>8} {\"Competition\":>12} {\"Difficulty\":>10}')
print('-' * 92)
for item in items:
    ki = item.get('keyword_info', {})
    kp = item.get('keyword_properties', {})
    kw = item.get('keyword', 'N/A')
    vol = ki.get('search_volume', 0) or 0
    cpc = ki.get('cpc', 0) or 0
    comp = ki.get('competition_level', 'N/A') or 'N/A'
    diff = kp.get('keyword_difficulty', 0) or 0
    print(f'{kw:<50} {vol:>8} {cpc:>8.2f} {comp:>12} {diff:>10}')
"
