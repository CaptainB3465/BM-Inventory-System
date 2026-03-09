# Test Receipt Functionality
# This script demonstrates the receipt generation and printing feature

echo "=== Testing Receipt Functionality ==="
echo ""

# Step 1: Create an order
echo "1. Creating an order..."
ORDER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "items": [
      {"productId": 1, "quantity": 2},
      {"productId": 2, "quantity": 1}
    ]
  }')

echo "Order Response: $ORDER_RESPONSE"

# Extract order ID (this is a simple extraction, may need adjustment)
ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$ORDER_ID" ]; then
    echo "Failed to extract order ID"
    exit 1
fi

echo "Created order with ID: $ORDER_ID"
echo ""

# Step 2: Approve payment (this generates receipt)
echo "2. Approving payment..."
APPROVE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/orders/$ORDER_ID/approve \
  -H "Content-Type: application/json")

echo "Payment approval response: $APPROVE_RESPONSE"
echo ""

# Step 3: Get receipt
echo "3. Retrieving receipt..."
RECEIPT_RESPONSE=$(curl -s -X GET http://localhost:8080/api/orders/$ORDER_ID/receipt \
  -H "Content-Type: application/json")

echo "Receipt Response: $RECEIPT_RESPONSE"

# Extract receipt ID
RECEIPT_ID=$(echo $RECEIPT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
RECEIPT_NUMBER=$(echo $RECEIPT_RESPONSE | grep -o '"receiptNumber":"[^"]*"' | cut -d'"' -f4)

if [ -n "$RECEIPT_ID" ]; then
    echo ""
    echo "✓ Receipt generated successfully!"
    echo "Receipt Number: $RECEIPT_NUMBER"
    echo "Receipt ID: $RECEIPT_ID"
    echo ""
    echo "=== Receipt URLs ==="
    echo "View Receipt JSON: http://localhost:8080/api/orders/$ORDER_ID/receipt"
    echo "Print Receipt: http://localhost:8080/api/receipts/$RECEIPT_ID/print"
    echo ""
    echo "To print the receipt, open the print URL in your browser and use Ctrl+P or Cmd+P"
else
    echo "Failed to generate receipt"
fi