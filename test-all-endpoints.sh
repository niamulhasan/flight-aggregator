#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}     FLIGHT SEARCH API TEST SUITE      ${NC}"
echo -e "${YELLOW}========================================${NC}"
sleep 1

echo -e "\n${YELLOW}1. Testing Provider A...${NC}"
RESP=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/flights?from=DAC&to=DXB&date=2026-07-01&passengers=1)
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 500 ]; then
  echo -e "  ${GREEN}✓ Provider A responded (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Provider A failed (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}2. Testing Provider B...${NC}"
RESP=$(curl -s -w "\n%{http_code}" http://localhost:3002/api/flights?from=DAC&to=DXB&date=2026-07-01&passengers=1)
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 500 ]; then
  echo -e "  ${GREEN}✓ Provider B responded (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Provider B failed (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}3. Testing Provider C...${NC}"
RESP=$(curl -s -w "\n%{http_code}" http://localhost:3003/api/flights?from=DAC&to=DXB&date=2026-07-01&passengers=1)
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 500 ]; then
  echo -e "  ${GREEN}✓ Provider C responded (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Provider C failed (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}4. Testing Search (default params)...${NC}"
RESP=$(curl -s -w "\n%{http_code}" 'http://localhost:3000/api/flights/search?from=DAC&to=DXB&date=2026-07-01&passengers=2')
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ]; then
  echo -e "  ${GREEN}✓ Search passed (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Search failed (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}5. Testing Search with sort by price asc...${NC}"
RESP=$(curl -s -w "\n%{http_code}" 'http://localhost:3000/api/flights/search?from=DAC&to=DXB&date=2026-07-01&passengers=2&sortBy=price&sortOrder=asc')
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ]; then
  echo -e "  ${GREEN}✓ Sort passed (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Sort failed (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}6. Testing Search with max stops 0...${NC}"
RESP=$(curl -s -w "\n%{http_code}" 'http://localhost:3000/api/flights/search?from=DAC&to=DXB&date=2026-07-01&passengers=2&maxStops=0')
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ]; then
  echo -e "  ${GREEN}✓ Max stops filter passed (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Max stops filter failed (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}7. Testing Search with carriers AA,EK...${NC}"
RESP=$(curl -s -w "\n%{http_code}" 'http://localhost:3000/api/flights/search?from=DAC&to=DXB&date=2026-07-01&passengers=2&carriers=AA,EK')
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ]; then
  echo -e "  ${GREEN}✓ Carriers filter passed (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Carriers filter failed (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}8. Testing Search with price range 250-300...${NC}"
RESP=$(curl -s -w "\n%{http_code}" 'http://localhost:3000/api/flights/search?from=DAC&to=DXB&date=2026-07-01&passengers=2&minPrice=250&maxPrice=300')
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ]; then
  echo -e "  ${GREEN}✓ Price filter passed (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Price filter failed (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}9. Testing Create Booking...${NC}"
BOOKING_RESP=$(curl -s -X POST 'http://localhost:3000/api/bookings' \
  -H 'Content-Type: application/json' \
  -d '{"flightId":"586130db4e1bd5b7074b085dc44b393d","passengers":[{"firstName":"John","lastName":"Doe","email":"john@example.com"}]}')
if echo "$BOOKING_RESP" | python3 -c "import sys, json; data = json.load(sys.stdin); print(1 if 'reference' in data else 0)" | grep -q 1; then
  BOOKING_REF=$(echo "$BOOKING_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin)['reference'])")
  echo -e "  ${GREEN}✓ Create Booking passed (ref: $BOOKING_REF)${NC}"
  ((PASSED++))
  
  echo -e "\n${YELLOW}10. Testing Retrieve Booking...${NC}"
  RESP=$(curl -s -w "\n%{http_code}" "http://localhost:3000/api/bookings/$BOOKING_REF")
  STATUS=$(echo "$RESP" | tail -n1)
  if [ "$STATUS" -eq 200 ]; then
    echo -e "  ${GREEN}✓ Retrieve Booking passed (status: $STATUS)${NC}"
    ((PASSED++))
  else
    echo -e "  ${RED}✗ Retrieve Booking failed (status: $STATUS)${NC}"
    ((FAILED++))
  fi
else
  echo -e "  ${RED}✗ Create Booking failed${NC}"
  echo "  Response: $BOOKING_RESP"
  ((FAILED++))
  ((FAILED++)) # count retrieve as failed too since we couldn't create
fi

echo -e "\n${YELLOW}11. Testing Swagger UI...${NC}"
RESP=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/docs)
STATUS=$(echo "$RESP" | tail -n1)
if [ "$STATUS" -eq 200 ]; then
  echo -e "  ${GREEN}✓ Swagger UI available (status: $STATUS)${NC}"
  ((PASSED++))
else
  echo -e "  ${RED}✗ Swagger UI not available (status: $STATUS)${NC}"
  ((FAILED++))
fi

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}          TEST SUMMARY                  ${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "  Total Tests: $((PASSED + FAILED))"
echo -e "  ${GREEN}PASSED: $PASSED${NC}"
echo -e "  ${RED}FAILED: $FAILED${NC}"
echo -e "${YELLOW}========================================${NC}"

if [ "$FAILED" -eq 0 ]; then
  echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
  exit 0
else
  echo -e "\n${RED}😢 Some tests failed!${NC}"
  exit 1
fi

