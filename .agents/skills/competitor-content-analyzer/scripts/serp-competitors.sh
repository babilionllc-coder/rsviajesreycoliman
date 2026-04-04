#!/bin/bash
# DataForSEO SERP Competitors
# Usage: bash serp-competitors.sh "keyword" [location_code] [language_code]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/../../.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

KEYWORD="${1:?Usage: serp-competitors.sh \"keyword\" [location_code] [language_code]}"
LOCATION="${2:-2484}"
LANGUAGE="${3:-es}"

if [ -z "$DATAFORSEO_AUTH" ]; then
  echo "Error: DATAFORSEO_AUTH not set in .env"
  exit 1
fi

echo "🏆 Finding SERP competitors for: \"$KEYWORD\""

curl -s -X POST \
  "https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live" \
  -H "Authorization: Basic $DATAFORSEO_AUTH" \
  -H "Content-Type: application/json" \
  -d "[{
    \"keywords\": [\"$KEYWORD\"],
    \"location_code\": $LOCATION,
    \"language_code\": \"$LANGUAGE\",
    \"limit\": 15
  }]" | python3 -c "
import json, sys
data = json.load(sys.stdin)
tasks = data.get('tasks', [])
if not tasks or not tasks[0].get('result'):
    print('No results found.')
    sys.exit(0)
items = tasks[0]['result'][0].get('items', [])
print(f'Found {len(items)} competing domains:\n')
print(f'{\"Domain\":<40} {\"Rank\":>6} {\"Organic\":>10} {\"Paid\":>8} {\"Keywords\":>10}')
print('-' * 78)
for item in items:
    domain = item.get('domain', 'N/A')
    rank = item.get('avg_position', 0) or 0
    organic = item.get('organic_count', 0) or 0
    paid = item.get('paid_count', 0) or 0
    keywords = item.get('intersections', 0) or 0
    print(f'{domain:<40} {rank:>6.1f} {organic:>10} {paid:>8} {keywords:>10}')
"
