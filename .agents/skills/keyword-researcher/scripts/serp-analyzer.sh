#!/bin/bash
# SerpAPI SERP Analyzer
# Usage: bash serp-analyzer.sh "target keyword" [location] [language]
# Defaults: location="Mexico", language="es"

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/../../.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

KEYWORD="${1:?Usage: serp-analyzer.sh \"target keyword\" [location] [language]}"
LOCATION="${2:-Mexico}"
LANGUAGE="${3:-es}"

if [ -z "$SERPAPI_KEY" ]; then
  echo "Error: SERPAPI_KEY not set in .env"
  exit 1
fi

echo "🔍 Analyzing SERP for: \"$KEYWORD\" (location: $LOCATION, lang: $LANGUAGE)"

ENCODED_KW=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$KEYWORD'))")

curl -s "https://serpapi.com/search.json?q=${ENCODED_KW}&location=${LOCATION}&hl=${LANGUAGE}&gl=mx&num=10&api_key=${SERPAPI_KEY}" | python3 -c "
import json, sys
data = json.load(sys.stdin)

# AI Overview
ai = data.get('ai_overview', {})
if ai:
    print('🤖 AI OVERVIEW DETECTED')
    print(f'   Source: {ai.get(\"source\", \"N/A\")}')
    text = ai.get('text', ai.get('snippet', ''))
    if text:
        print(f'   Summary: {text[:200]}...')
    print()

# People Also Ask
paa = data.get('related_questions', [])
if paa:
    print('❓ PEOPLE ALSO ASK:')
    for q in paa[:5]:
        print(f'   • {q.get(\"question\", \"N/A\")}')
    print()

# Organic Results
results = data.get('organic_results', [])
print(f'📊 TOP {len(results)} ORGANIC RESULTS:')
print(f'{\"#\":>3} {\"Title\":<60} {\"Domain\":<35}')
print('-' * 100)
for r in results:
    pos = r.get('position', 0)
    title = r.get('title', 'N/A')[:58]
    link = r.get('displayed_link', r.get('link', 'N/A'))[:33]
    print(f'{pos:>3} {title:<60} {link:<35}')

# Related Searches
related = data.get('related_searches', [])
if related:
    print(f'\n🔗 RELATED SEARCHES:')
    for r in related[:8]:
        print(f'   • {r.get(\"query\", \"N/A\")}')
"
