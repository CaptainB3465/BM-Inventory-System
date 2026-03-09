import requests
import json
import time

BASE_URL = "http://localhost:8080"

def test_receipt_functionality():
    print("=== Testing Receipt Functionality ===\n")

    # Step 1: Login to get authentication (assuming admin user exists)
    print("1. Logging in...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }

    try:
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            print("✓ Login successful")
        else:
            print("✗ Login failed, proceeding without authentication")
            headers = {"Content-Type": "application/json"}
    except:
        print("✗ Login failed, proceeding without authentication")
        headers = {"Content-Type": "application/json"}

    # Step 2: Create an order
    print("\n2. Creating an order...")
    order_data = {
        "username": "testuser",
        "items": [
            {"productId": 1, "quantity": 2},
            {"productId": 2, "quantity": 1}
        ]
    }

    try:
        order_response = requests.post(f"{BASE_URL}/api/orders", json=order_data, headers=headers)
        if order_response.status_code == 200:
            order = order_response.json()
            order_id = order.get("id")
            print(f"✓ Order created with ID: {order_id}")
        else:
            print(f"✗ Failed to create order: {order_response.text}")
            return
    except Exception as e:
        print(f"✗ Error creating order: {e}")
        return

    # Step 3: Approve payment (this should generate a receipt)
    print("\n3. Approving payment...")
    time.sleep(1)  # Small delay

    try:
        approve_response = requests.post(f"{BASE_URL}/api/orders/{order_id}/approve", headers=headers)
        if approve_response.status_code == 200:
            print("✓ Payment approved")
        else:
            print(f"✗ Failed to approve payment: {approve_response.text}")
            return
    except Exception as e:
        print(f"✗ Error approving payment: {e}")
        return

    # Step 4: Get receipt data
    print("\n4. Retrieving receipt...")
    time.sleep(1)  # Small delay

    try:
        receipt_response = requests.get(f"{BASE_URL}/api/orders/{order_id}/receipt", headers=headers)
        if receipt_response.status_code == 200:
            receipt = receipt_response.json()
            receipt_id = receipt.get("id")
            receipt_number = receipt.get("receiptNumber")
            print(f"✓ Receipt retrieved: {receipt_number}")
            print(f"  Receipt ID: {receipt_id}")
            print(f"  Generated: {receipt.get('generatedAt')}")
        else:
            print(f"✗ Failed to get receipt: {receipt_response.text}")
            return
    except Exception as e:
        print(f"✗ Error getting receipt: {e}")
        return

    # Step 5: Get printable receipt HTML
    print("\n5. Getting printable receipt...")
    try:
        print_response = requests.get(f"{BASE_URL}/api/receipts/{receipt_id}/print", headers=headers)
        if print_response.status_code == 200:
            print("✓ Printable receipt HTML retrieved")
            print("  Receipt can be printed or saved as PDF")
            print("  Open in browser: http://localhost:8080/api/receipts/{receipt_id}/print")
        else:
            print(f"✗ Failed to get printable receipt: {print_response.text}")
    except Exception as e:
        print(f"✗ Error getting printable receipt: {e}")

    print("\n=== Test Complete ===")
    print(f"Receipt URL: http://localhost:8080/api/receipts/{receipt_id}/print")

if __name__ == "__main__":
    test_receipt_functionality()