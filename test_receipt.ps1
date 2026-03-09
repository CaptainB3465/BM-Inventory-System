# Test Receipt Functionality
# This script demonstrates the receipt generation and printing feature

Write-Host "=== Testing Receipt Functionality ===" -ForegroundColor Green
Write-Host ""

# Step 1: Create an order
Write-Host "1. Creating an order..." -ForegroundColor Yellow
$orderBody = @{
    username = "customer"  # Use existing user from DataInitializer
    items = @(
        @{ productId = 1; quantity = 1 },  # Ultra-HD 4K Monitor
        @{ productId = 2; quantity = 1 }   # Neural Sound Wireless Headphones
    )
} | ConvertTo-Json

try {
    $orderResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/orders" -Method POST -Body $orderBody -ContentType "application/json"
    $orderData = $orderResponse.Content | ConvertFrom-Json
    $orderId = $orderData.id
    Write-Host "✓ Order created with ID: $orderId" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create order: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorMessage = $reader.ReadToEnd()
        Write-Host "Error details: $errorMessage" -ForegroundColor Red
    }
    exit 1
}

# Step 2: Approve payment (this generates receipt)
Write-Host "`n2. Approving payment..." -ForegroundColor Yellow
try {
    $approveResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId/approve" -Method POST -ContentType "application/json"
    Write-Host "✓ Payment approved" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to approve payment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Get receipt
Write-Host "`n3. Retrieving receipt..." -ForegroundColor Yellow
try {
    $receiptResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId/receipt" -Method GET -ContentType "application/json"
    $receiptId = $receiptResponse.id
    $receiptNumber = $receiptResponse.receiptNumber
    Write-Host "✓ Receipt retrieved: $receiptNumber" -ForegroundColor Green
    Write-Host "  Receipt ID: $receiptId" -ForegroundColor Cyan
    Write-Host "  Generated: $($receiptResponse.generatedAt)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed to get receipt: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Get printable receipt HTML
Write-Host "`n4. Getting printable receipt..." -ForegroundColor Yellow
try {
    $printResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/receipts/$receiptId/print" -Method GET
    Write-Host "✓ Printable receipt HTML retrieved" -ForegroundColor Green
    Write-Host "  Content length: $($printResponse.Content.Length) characters" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed to get printable receipt: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "Receipt URLs:" -ForegroundColor Cyan
Write-Host "  View Receipt JSON: http://localhost:8080/api/orders/$orderId/receipt" -ForegroundColor White
Write-Host "  Print Receipt: http://localhost:8080/api/receipts/$receiptId/print" -ForegroundColor White
Write-Host ""
Write-Host "To print the receipt, open the print URL in your browser and use Ctrl+P" -ForegroundColor Yellow