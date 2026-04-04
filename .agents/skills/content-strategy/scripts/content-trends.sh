#!/bin/bash
# DataForSEO Content Analysis — Phrase Trends
# Usage: bash content-trends.sh "keyword or brand" [date_from] [date_to]
# Default: last 30 days

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/../../.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

KEYWORD="${1:?Usage: content-trends.sh \"keyword or brand\" [date_from] [date_to]}"
DATE_FROM="${2:-$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d '-30 days' +%Y-%m-%d)}"
DATE_TO="${3:-$(date +%Y-%m-%d)}"

if [ -z "$DATAFORSEO_AUTH" ]; then
  echo "Error: DATAFORSEO_AUTH not set in .env"
  exit 1
fi

echo "📈 Analyzing content trends for: \"$KEYWORD\" ($DATE_FROM to $DATE_TO)"

# First: get summary
curl -s -X POST \
  "https://api.dataforseo.com/v3/content_analysis/summary/live" \
  -H "Authorization: Basic $DATAFORSEO_AUTH" \
  -H "Content-Type: application/json" \
  -d "[{
    \"keyword\": \"$KEYWORD\",
    \"date_from\": \"$DATE_FROM\",
    \"date_to\": \"$DATE_TO\",
    \"internal_list_limit\": 5
  }]" | python3 -c "
import json, sys
data = json.load(sys.stdin)
tasks = data.get('tasks', [])
if not tasks or not tasks[0].get('result'):
    print('No summary data found.')
    sys.exit(0)
result = tasks[0]['result'][0]
print(f'📊 CONTENT ANALYSIS SUMMARY')
print(f'   Total mentions: {result.get(\"total_count\", 0)}')
print(f'   Sentiment: {json.dumps(result.get(\"sentiment_connotations\", {}), indent=2)}')
print(f'   Top domains:')
domains = result.get('top_domains', [])
for d in domains[:10]:
    print(f'      • {d.get(\"domain\", \"N/A\")}: {d.get(\"count\", 0)} mentions')
print()

# Rating distribution
ratings = result.get('rating_distribution', {})
if ratings:
    print(f'   Ratings: ⭐{ratings.get(\"1\",0)} | ⭐⭐{ratings.get(\"2\",0)} | ⭐⭐⭐{ratings.get(\"3\",0)} | ⭐⭐⭐⭐{ratings.get(\"4\",0)} | ⭐⭐⭐⭐⭐{ratings.get(\"5\",0)}')
"
