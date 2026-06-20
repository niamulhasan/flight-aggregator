#!/bin/bash

for i in {1..50}; do
  echo "=== Request $i ==="
  response=$(curl -s "http://localhost:3000/api/flights/search?from=DAC&to=DXB&date=2026-07-01&passengers=2")
  has_failure=$(echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(1 if len(data['meta']['providers']['failed']) > 0 else 0)
")
  if [ "$has_failure" -eq 1 ]; then
    echo "$response" | python3 -m json.tool
    exit 0
  fi
done
