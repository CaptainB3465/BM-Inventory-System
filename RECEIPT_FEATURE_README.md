# Receipt Generation and Printing Feature

This document describes the receipt generation and printing functionality added to the Inventory Management System.

## Overview

After a payment is approved for an order, the system automatically generates a receipt. The receipt includes all order details, customer information, and payment information. Receipts can be viewed in JSON format or as printable HTML pages.

## API Endpoints

### 1. Get Receipt by Order ID
```
GET /api/orders/{orderId}/receipt
```
Returns the receipt information for a specific order.

**Response:**
```json
{
  "id": 1,
  "receiptNumber": "RCP-1709661234567",
  "order": {
    "id": 1,
    "user": {...},
    "items": [...],
    "totalAmount": 399.99,
    "status": "PAID"
  },
  "payment": {
    "id": 1,
    "amount": 399.99,
    "paymentMethod": "Credit Card",
    "status": "COMPLETED",
    "transactionId": "txn-123456789"
  },
  "generatedAt": "2026-03-05T15:30:34.567"
}
```

### 2. Get Receipt by Receipt ID
```
GET /api/receipt/{receiptId}
```
Returns receipt information by receipt ID.

### 3. Get Printable Receipt
```
GET /api/receipts/{receiptId}/print
```
Returns an HTML page optimized for printing. The page automatically triggers the browser's print dialog when loaded.

## How It Works

1. **Order Creation**: Customer creates an order with products
2. **Payment Approval**: Admin approves the payment via `POST /api/orders/{id}/approve`
3. **Automatic Receipt Generation**: When payment is approved, a receipt is automatically created
4. **Receipt Access**: Receipts can be accessed via the API endpoints above

## Testing the Feature

### Manual Testing Steps:

1. **Start the Application:**
   ```powershell
   $env:JAVA_HOME = 'C:\Program Files\Java\jdk-25'
   Set-Location 'c:\Users\Administrator\Java Project files\Inventory management system'
   .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
   ```

2. **Create an Order:**
   Use your frontend or API client to create an order for user "customer" with some products.

3. **Approve Payment:**
   Call `POST /api/orders/{orderId}/approve` to approve the payment.

4. **View Receipt:**
   - JSON format: `GET /api/orders/{orderId}/receipt`
   - Printable HTML: `GET /api/receipts/{receiptId}/print`

### Example API Calls:

**Create Order:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer",
    "items": [
      {"productId": 1, "quantity": 1}
    ]
  }'
```

**Approve Payment:**
```bash
curl -X POST http://localhost:8080/api/orders/1/approve
```

**Get Receipt:**
```bash
curl http://localhost:8080/api/orders/1/receipt
```

**Print Receipt:**
Open `http://localhost:8080/api/receipts/1/print` in your browser and print.

## Receipt Template

The printable receipt uses an HTML template located at `src/main/resources/static/receipt-template.html`. The template includes:

- Company header with logo and contact information
- Receipt number and date
- Customer information
- Itemized list of products
- Payment details
- Total amount
- Print-optimized styling

## Database Changes

New tables added:
- `receipts`: Stores receipt information
- Foreign keys to `orders` and `payments` tables

## Security Considerations

- Receipts are generated only after successful payment approval
- Receipt numbers are unique and auto-generated
- All receipt data is stored securely in the database

## Future Enhancements

- PDF generation for receipts
- Email delivery of receipts
- Customizable receipt templates
- Multi-language support
- Digital receipt signatures