@echo off
echo === Testing Receipt Functionality ===
echo.

echo 1. Creating an order...
curl -s -X POST http://localhost:8080/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"customer\",\"items\":[{\"productId\":1,\"quantity\":1}]}" > order_response.txt

if errorlevel 1 (
    echo ✗ Failed to create order
    goto :end
)

echo Order response saved to order_response.txt
type order_response.txt
echo.

echo 2. Extracting order ID...
for /f "tokens=2 delims=:," %%i in ('findstr "\"id\":" order_response.txt') do set ORDER_ID=%%i
echo Order ID: %ORDER_ID%
echo.

if "%ORDER_ID%"=="" (
    echo ✗ Failed to extract order ID
    goto :end
)

echo 3. Approving payment...
curl -s -X POST http://localhost:8080/api/orders/%ORDER_ID%/approve ^
  -H "Content-Type: application/json" > approve_response.txt

if errorlevel 1 (
    echo ✗ Failed to approve payment
    goto :end
)

echo Payment approved
type approve_response.txt
echo.

echo 4. Getting receipt...
curl -s -X GET http://localhost:8080/api/orders/%ORDER_ID%/receipt ^
  -H "Content-Type: application/json" > receipt_response.txt

if errorlevel 1 (
    echo ✗ Failed to get receipt
    goto :end
)

echo Receipt response saved to receipt_response.txt
type receipt_response.txt
echo.

echo 5. Extracting receipt ID...
for /f "tokens=2 delims=:," %%i in ('findstr "\"id\":" receipt_response.txt') do set RECEIPT_ID=%%i
for /f "tokens=2 delims=\":," %%i in ('findstr "\"receiptNumber\":" receipt_response.txt') do set RECEIPT_NUMBER=%%i

echo ✓ Receipt generated successfully!
echo Receipt Number: %RECEIPT_NUMBER%
echo Receipt ID: %RECEIPT_ID%
echo.
echo === Receipt URLs ===
echo View Receipt JSON: http://localhost:8080/api/orders/%ORDER_ID%/receipt
echo Print Receipt: http://localhost:8080/api/receipts/%RECEIPT_ID%/print
echo.
echo To print the receipt, open the print URL in your browser and use Ctrl+P

:end
echo.
echo === Test Complete ===