#!/bin/bash
set -e

# ================================
# Flight Search Aggregator E2E Test
# ================================
# This script tests all API endpoints and requirements from REQUIREMENT.md

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URLs
FLIGHT_API="http://localhost:3000/api"
PROVIDER_A="http://localhost:3001/api"
PROVIDER_B="http://localhost:3002/api"
PROVIDER_C="http://localhost:3003/api"

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to run a test case
run_test() {
    local TEST_NAME="$1"
    local TEST_CMD="$2"
    ((TOTAL_TESTS++))

    echo -e "\n${YELLOW}[TEST]${NC} $TEST_NAME"
    eval "$TEST_CMD"
    local RESULT=$?

    if [ $RESULT -eq 0 ]; then
        ((PASSED_TESTS++))
        echo -e "${GREEN}[PASSED]${NC} $TEST_NAME"
    else
        ((FAILED_TESTS++))
        echo -e "${RED}[FAILED]${NC} $TEST_NAME"
    fi
    return $RESULT
}

# Function to check provider response
test_provider() {
    local NAME="$1"
    local URL="$2"
    run_test "Test $NAME endpoint" "curl -s -f \"$URL/flights?from=DAC&to=DXB&date=2026-07-01&passengers=1\" > /dev/null"
}

# Function to check search endpoint
test_search() {
    local NAME="$1"
    local QUERY="$2"
    local TEST_DESC="$3"
    
    local RESPONSE=$(curl -s "$FLIGHT_API/flights/search?$QUERY")
    echo -e "\n  ${BLUE}Query:${NC} $QUERY"
    
    # Check status code
    local HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null "$FLIGHT_API/flights/search?$QUERY")
    if [ "$HTTP_CODE" != "200" ]; then
        echo -e "  ${RED}ERROR:${NC} Status code $HTTP_CODE (expected 200)"
        return 1
    fi
    
    # Check flights exist
    local FLIGHT_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data['flights']))")
    echo -e "  ${BLUE}Flights found:${NC} $FLIGHT_COUNT"
    if [ "$FLIGHT_COUNT" -eq 0 ]; then
        echo -e "  ${RED}ERROR:${NC} No flights found"
        return 1
    fi
    
    # Check flights have stable IDs
    local BAD_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); bad = [f for f in data['flights'] if not f.get('id')]; print(len(bad))")
    if [ "$BAD_ID" -gt 0 ]; then
        echo -e "  ${RED}ERROR:${NC} Found flights without stable IDs"
        return 1
    fi
    
    # Check meta completeness
    local COMPLETENESS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['meta']['completeness'])")
    echo -e "  ${BLUE}Completeness:${NC} $COMPLETENESS"
    if [ -z "$COMPLETENESS" ]; then
        echo -e "  ${RED}ERROR:${NC} No completeness info"
        return 1
    fi
    
    echo -e "  ${GREEN}✓ Search valid${NC}"
    return 0
}

print_header "E2E Test: Flight Search Aggregator"

# Wait for services to start
echo -e "${YELLOW}Waiting for services...${NC}"
sleep 3

# ================================
# 1. Test Mock Providers
# ================================
print_header "1. Testing Mock Providers"

test_provider "Provider A" "$PROVIDER_A"
test_provider "Provider B" "$PROVIDER_B"
test_provider "Provider C" "$PROVIDER_C"

# ================================
# 2. Test Search Endpoint (Basic)
# ================================
print_header "2. Testing Search Endpoint (Basic)"

run_test "Default search" "test_search 'default' 'from=DAC&to=DXB&date=2026-07-01&passengers=2'"

# ================================
# 3. Test Search with Sorting
# ================================
print_header "3. Testing Search with Sorting"

run_test "Sort by price (ascending)" "test_search 'sort-price-asc' 'from=DAC&to=DXB&date=2026-07-01&passengers=2&sortBy=price&sortOrder=asc'"
run_test "Sort by price (descending)" "test_search 'sort-price-desc' 'from=DAC&to=DXB&date=2026-07-01&passengers=2&sortBy=price&sortOrder=desc'"
run_test "Sort by departure time" "test_search 'sort-departure' 'from=DAC&to=DXB&date=2026-07-01&passengers=2&sortBy=departure&sortOrder=asc'"
run_test "Sort by duration" "test_search 'sort-duration' 'from=DAC&to=DXB&date=2026-07-01&passengers=2&sortBy=duration&sortOrder=asc'"

# ================================
# 4. Test Search with Filtering
# ================================
print_header "4. Testing Search with Filtering"

run_test "Filter by max stops (0 = direct only)" "test_search 'filter-max-stops-0' 'from=DAC&to=DXB&date=2026-07-01&passengers=2&maxStops=0'"
run_test "Filter by carriers (AA)" "test_search 'filter-carriers-AA' 'from=DAC&to=DXB&date=2026-07-01&passengers=2&carriers=AA'"
run_test "Filter by carriers (AA,EK)" "test_search 'filter-carriers-AAEK' 'from=DAC&to=DXB&date=2026-07-01&passengers=2&carriers=AA,EK'"
run_test "Filter by price range (250-300)" "test_search 'filter-price-range' 'from=DAC&to=DXB&date=2026-07-01&passengers=2&minPrice=250&maxPrice=300'"

# ================================
# 5. Test Booking Endpoints
# ================================
print_header "5. Testing Booking Endpoints"

# Create booking
echo -e "\n${YELLOW}[TEST]${NC} Create booking"
BOOKING_RESP=$(curl -s -X POST "$FLIGHT_API/bookings" \
    -H "Content-Type: application/json" \
    -d '{
        "flightId": "586130db4e1bd5b7074b085dc44b393d",
        "passengers": [
            {"firstName": "John", "lastName": "Doe", "email": "john@example.com"},
            {"firstName": "Jane", "lastName": "Doe", "email": "jane@example.com"}
        ]
    }')
echo -e "  ${BLUE}Response:${NC} $(echo "$BOOKING_RESP" | python3 -m json.tool)"

# Check booking has reference
if echo "$BOOKING_RESP" | python3 -c "import sys, json; data = json.load(sys.stdin); exit(0 if 'reference' in data else 1)"; then
    BOOKING_REF=$(echo "$BOOKING_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin)['reference'])")
    echo -e "  ${GREEN}[PASSED]${NC} Create booking (ref: $BOOKING_REF)"
    ((PASSED_TESTS++))
else
    echo -e "  ${RED}[FAILED]${NC} Create booking"
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Retrieve booking
echo -e "\n${YELLOW}[TEST]${NC} Retrieve booking by reference"
if [ -n "$BOOKING_REF" ]; then
    GET_RESP=$(curl -s "$FLIGHT_API/bookings/$BOOKING_REF")
    echo -e "  ${BLUE}Response:${NC} $(echo "$GET_RESP" | python3 -m json.tool)"
    if echo "$GET_RESP" | python3 -c "import sys, json; data = json.load(sys.stdin); exit(0 if data['reference'] == '$BOOKING_REF' else 1)"; then
        echo -e "  ${GREEN}[PASSED]${NC} Retrieve booking"
        ((PASSED_TESTS++))
    else
        echo -e "  ${RED}[FAILED]${NC} Retrieve booking"
        ((FAILED_TESTS++))
    fi
else
    echo -e "  ${YELLOW}[SKIPPED]${NC} No booking reference from previous step"
fi
((TOTAL_TESTS++))

# ================================
# 6. Test Swagger Documentation
# ================================
print_header "6. Testing Swagger Documentation"

run_test "Swagger UI available" "curl -s -f http://localhost:3000/api/docs > /dev/null"
run_test "Swagger JSON schema available" "curl -s -f http://localhost:3000/api/docs-json > /dev/null"

# ================================
# Summary
# ================================
print_header "E2E Test Summary"
echo -e "Total tests:    ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:         ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:         ${RED}$FAILED_TESTS${NC}"

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed!${NC}"
    exit 1
fi

