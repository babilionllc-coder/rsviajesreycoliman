#!/bin/bash
# Perplexity AI Topic Research
# Usage: bash topic-research.sh "your research question"

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/../../.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

QUESTION="${1:?Usage: topic-research.sh \"your research question\"}"

if [ -z "$PERPLEXITY_API_KEY" ]; then
  echo "Error: PERPLEXITY_API_KEY not set in .env"
  exit 1
fi

echo "🧠 Researching: \"$QUESTION\""
echo ""

curl -s -X POST \
  "https://api.perplexity.ai/chat/completions" \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"sonar\",
    \"messages\": [
      {
        \"role\": \"system\",
        \"content\": \"You are a real estate marketing research analyst specializing in the Mexican market. Provide detailed, data-driven answers with specific statistics, trends, and actionable insights. Always cite your sources.\"
      },
      {
        \"role\": \"user\",
        \"content\": \"$QUESTION\"
      }
    ],
    \"max_tokens\": 2000,
    \"return_citations\": true
  }" | python3 -c "
import json, sys
data = json.load(sys.stdin)
choices = data.get('choices', [])
if not choices:
    print('No response received.')
    sys.exit(0)

content = choices[0].get('message', {}).get('content', 'No content')
citations = data.get('citations', [])

print('📋 RESEARCH FINDINGS:')
print('=' * 80)
print(content)

if citations:
    print()
    print('📚 SOURCES:')
    for i, c in enumerate(citations, 1):
        print(f'   [{i}] {c}')
"
