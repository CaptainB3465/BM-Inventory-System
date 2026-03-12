const API_BASE_URL = '/api';

// Global State
let inventory = [];
let editingId = null;
let editingCustomerId = null;
let currentUser = null; // {username: '...', role: '...'}
let orders = [];
let customers = [];
let receipts = [];
let cart = []; // For future multi-item orders, currently single-buy

// Initialize app on DOM Load
document.addEventListener('DOMContentLoaded', () => {

    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showApp();
    } else {
        window.location.href = '/auth.html';
    }

    // NOTE: productForm, customerForm, and settingsForm submit handlers are
    // managed by dashboard.js which has the full, up-to-date implementations.
    // Do NOT add duplicate listeners here.

    // Setup search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchProducts(e.target.value);
    });

    // Setup Navigation
    setupNavigation();
});

// --- Auth Handlers ---
// Login is now handled by auth.js on auth.html page.
// app.js only handles the authenticated state on index.html.

function showApp() {
    // Show chatbot widget (sidebar and main-area are always visible in new layout)
    const chatbot = document.getElementById('chatbotAppWidget');
    if (chatbot) chatbot.style.display = 'block';

    // Update Profile UI
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userAvatar = document.getElementById('userAvatar');

    // Expose current user globally so dashboard.js can access it
    window._currentUser = currentUser;

    const displayName = currentUser.fullName || currentUser.email || 'User';
    if (userNameDisplay) userNameDisplay.textContent = displayName;
    if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();

    // Apply role restrictions
    applyRoleRestrictions();
    updateNavVisibility();

    // Fetch initial data — dashboard.js will also call these on bootstrap
    fetchInventory();
    fetchCustomers();
    fetchOrders();
    fetchSettings();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    window.location.href = '/auth.html';
}

function applyRoleRestrictions() {
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const customerOnlyElements = document.querySelectorAll('.customer-only');

    if (currentUser) {
        if (currentUser.role !== 'ADMIN') {
            adminOnlyElements.forEach(el => el.style.display = 'none');
        } else {
            adminOnlyElements.forEach(el => el.style.display = '');
        }

        if (currentUser.role !== 'CUSTOMER') {
            customerOnlyElements.forEach(el => el.style.display = 'none');
        } else {
            customerOnlyElements.forEach(el => el.style.display = '');
        }
    }
}

function updateNavVisibility() {
    // Hide/Show sidebar items and content sections based on role
    // Works with both old .nav-links li and new .nav-item classes
    document.querySelectorAll('.nav-item, .nav-links li').forEach(li => {
        if (li.classList.contains('admin-only') && currentUser.role !== 'ADMIN')
            li.style.display = 'none';
        else if (li.classList.contains('customer-only') && currentUser.role !== 'CUSTOMER')
            li.style.display = 'none';
        else
            li.style.display = '';
    });
}

// --- Navigation Handlers ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const views = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active nav item
            document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
            e.currentTarget.parentElement.classList.add('active');

            // Hide all views
            views.forEach(view => {
                view.style.display = 'none';
                view.classList.remove('active');
            });

            // Show selected view
            const targetId = e.currentTarget.getAttribute('data-target');
            if (targetId) {
                const targetView = document.getElementById(targetId);
                if (targetView) {
                    targetView.style.display = 'block';
                    // Trigger reflow for animation
                    void targetView.offsetWidth;
                    targetView.classList.add('fade-in');
                    targetView.classList.add('active');

                    // Specific logic for views if needed
                    if (targetId === 'products-view') {
                        fetchInventory();
                    } else if (targetId === 'customers-view') {
                        fetchCustomers();
                    } else if (targetId === 'marketplace-view') {
                        updateMarketplace();
                    } else if (targetId === 'orders-view') {
                        fetchOrders();
                    } else if (targetId === 'settings-view') {
                        fetchSettings();
                    } else if (targetId === 'receipts-view') {
                        fetchReceipts();
                    }
                }
            }
        });
    });
}

// --- Modal Handlers ---
function openModal(id = null) {
    editingId = id;
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    form.reset();

    if (id) {
        title.innerText = "Edit Product";
        const product = inventory.find(p => p.id === id);
        if (product) {
            document.getElementById('sku').value = product.sku;
            document.getElementById('name').value = product.name;
            document.getElementById('description').value = product.description;
            document.getElementById('quantity').value = product.quantity;
            document.getElementById('price').value = product.price;
        }
    } else {
        title.innerText = "Add New Product";
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    editingId = null;
}

// --- API Calls & Data Handling ---
async function fetchInventory() {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        if (!response.ok) throw new Error('Failed to fetch inventory');

        inventory = await response.json();
        updateDashboard();
    } catch (error) {
        console.error('Error fetching inventory:', error);
        // Show simulated data if API fails (for initial testing before backend is running)
        if (inventory.length === 0) {
            console.log("Using simulated data since API is unreachable.");
            inventory = [
                { id: 1, sku: 'SKU-1001', name: 'Premium Laptop', description: '16GB RAM, 512GB SSD', quantity: 45, price: 1299.99 },
                { id: 2, sku: 'SKU-1002', name: 'Wireless Mouse', description: 'Ergonomic blob', quantity: 120, price: 49.50 },
                { id: 3, sku: 'SKU-1003', name: 'Mechanical Keyboard', description: 'Cherry MX Red', quantity: 8, price: 159.00 }
            ];
            updateDashboard();
        }
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const productData = {
        sku: document.getElementById('sku').value,
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        quantity: parseInt(document.getElementById('quantity').value, 10),
        price: parseFloat(document.getElementById('price').value)
    };

    try {
        let response;
        if (editingId) {
            // Update
            response = await fetch(`${API_BASE_URL}/inventory/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Create
            response = await fetch(`${API_BASE_URL}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            closeModal();
            fetchInventory();
        } else {
            alert('Failed to save product');
        }
    } catch (error) {
        console.error('Save error:', error);
        // Fallback for simulation
        if (editingId) {
            const index = inventory.findIndex(p => p.id === editingId);
            if (index !== -1) inventory[index] = { id: editingId, ...productData };
        } else {
            inventory.push({ id: Date.now(), ...productData });
        }
        closeModal();
        updateDashboard();
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchInventory();
        }
    } catch (error) {
        console.error('Delete error:', error);
        // Fallback for simulation
        inventory = inventory.filter(p => p.id !== id);
        updateDashboard();
    }
}

async function searchProducts(query) {
    if (!query.trim()) {
        updateTable(inventory);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/inventory/search?name=${encodeURIComponent(query)}`);
        if (response.ok) {
            const results = await response.json();
            updateTable(results);
        }
    } catch (error) {
        // Fallback simulation
        const lowerQuery = query.toLowerCase();
        const results = inventory.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.sku.toLowerCase().includes(lowerQuery));
        updateTable(results);
    }
}

// --- UI Updates ---
function updateDashboard() {
    updateTable(inventory);
    updateGallery(inventory);
    updateMarketplace();

    // Update metric cards
    document.getElementById('totalProducts').innerText = inventory.length;

    const totalVal = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Format currency manually instead of window.Intl if not supported, but Intl is better
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    document.getElementById('totalValue').innerText = formatter.format(totalVal);
}

function updateTable(data) {
    const tbody = document.getElementById('inventoryBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--gray-500)">No products found.</td></tr>`;
        return;
    }

    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.style.animationDelay = `${index * 0.05}s`;

        // Determine stock status logic
        let stockHtml = '';
        if (item.quantity === 0) stockHtml = `<span class="status-badge status-out-stock">Out of Stock</span>`;
        else if (item.quantity < 10) stockHtml = `<span class="status-badge status-low-stock">Low Stock (${item.quantity})</span>`;
        else stockHtml = `<span class="status-badge status-in-stock">In Stock (${item.quantity})</span>`;

        let actionHtml = '';
        if (currentUser && currentUser.role === 'ADMIN') {
            actionHtml = `
            <td class="actions-cell">
                <button class="btn-secondary" onclick="openModal(${item.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-danger" onclick="deleteProduct(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        } else {
            actionHtml = `
            <td class="actions-cell">
                 <span style="color: var(--gray-400); font-size: 0.8em;">Read-only</span>
            </td>`;
        }

        tr.innerHTML = `
            <td><span class="sku-badge">${item.sku}</span></td>
            <td><strong>${item.name}</strong></td>
            <td style="color: var(--gray-500); font-size: 0.9em; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.description}</td>
            <td>${stockHtml}</td>
            <td>$${item.price.toFixed(2)}</td>
            ${actionHtml}
        `;
        tbody.appendChild(tr);
    });
}

function updateGallery(data) {
    renderGallery(data, 'productGallery', false);
}

function updateMarketplace() {
    renderGallery(inventory, 'marketplaceGallery', true);
}

function renderGallery(data, containerId, isMarketplace) {
    const gallery = document.getElementById(containerId);
    if (!gallery) return;
    gallery.innerHTML = '';

    const imageMap = {
        'ELE-1001': 'images/monitor.png',
        'ELE-1002': 'images/headphones.png',
        'ELE-1003': 'images/keyboard.png',
        'ELE-1004': 'images/mouse.png',
        'ELE-1005': 'images/usbc_hub.png',
        'ELE-1006': 'images/security_camera.png',
        'ELE-1007': 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=400&q=80',
        'ELE-1008': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
        'ELE-1009': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
        'ELE-1010': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80'
    };

    const defaultImage = 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80'; // Sleek tech default

    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;

        const imageSrc = imageMap[item.sku] || defaultImage;

        let stockStatusClass = 'status-in-stock';
        let stockText = 'In Stock';
        if (item.quantity === 0) {
            stockStatusClass = 'status-out-stock';
            stockText = 'Out of Stock';
        } else if (item.quantity < 10) {
            stockStatusClass = 'status-low-stock';
            stockText = `Low Stock (${item.quantity})`;
        }

        let actionButtonHtml = '';
        if (isMarketplace && currentUser.role === 'CUSTOMER') {
            actionButtonHtml = `
                <div class="card-footer" style="padding: 16px; border-top: 1px solid var(--gray-100); background: #f9fafb;">
                    <button class="btn-primary" style="width: 100%; justify-content: center;" 
                            onclick="placeOrder(${item.id})" ${item.quantity === 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-cart-plus"></i> Buy Now
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imageSrc}" alt="${item.name}">
            </div>
            <div class="product-details">
                <div class="product-sku">${item.sku}</div>
                <h3>${item.name}</h3>
                <p class="product-desc">${item.description}</p>
                <div class="product-meta">
                    <span class="product-price">$${item.price.toFixed(2)}</span>
                    <span class="product-stock ${stockStatusClass}">${stockText}</span>
                </div>
            </div>
            ${actionButtonHtml}
        `;
        gallery.appendChild(card);
    });
}

// --- Chatbot Implementation ---
function toggleChatbot() {
    const container = document.getElementById('chatbotContainer');
    container.classList.toggle('active');

    if (container.classList.contains('active')) {
        setTimeout(() => document.getElementById('chatInput').focus(), 300);
    }
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function appendMessage(text, isUser) {
    const chatbox = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user' : 'ai'} fade-in`;

    let avatarHtml = '';
    if (isUser) {
        avatarHtml = `<div class="msg-avatar">AD</div>`;
    } else {
        avatarHtml = `<img src="https://cdn-icons-png.flaticon.com/512/8649/8649595.png" alt="AI Icon" class="msg-avatar">`;
    }

    msgDiv.innerHTML = `
        ${avatarHtml}
        <div class="msg-content">${text}</div>
    `;

    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function showTypingIndicator() {
    const chatbox = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator fade-in';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if (!text) return;

    // User message
    appendMessage(text, true);
    input.value = '';

    // Show AI typing
    showTypingIndicator();

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        removeTypingIndicator(); // remove before appending AI message

        if (response.ok) {
            const data = await response.json();
            appendMessage(data.reply, false);
        } else {
            appendMessage("Sorry, I'm having trouble connecting to my brain right now.", false);
        }
    } catch (error) {
        console.error("Chat error:", error);
        removeTypingIndicator();
        appendMessage("Debug Error: " + error.message, false);
        // Fallback simulation
        setTimeout(() => {
            const lowerMsg = text.toLowerCase();
            let simulatedReply = "I am currently disconnected from the backend server. Error: " + error.message;

            if (lowerMsg.includes('stock') || lowerMsg.includes('how many')) {
                simulatedReply = `We currently have ${inventory.length} items in the inventory total.`;
            } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                simulatedReply = "Hello! I am your AI Inventory Assistant (Offline Mode).";
            }

            appendMessage(simulatedReply, false);
        }, 1000);
    }
}

// --- Customer Management Handlers ---

async function fetchCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}/customers`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        customers = await response.json();
        updateCustomerTable(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

function updateCustomerTable(data) {
    const tbody = document.getElementById('customerBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--gray-500)">No customers found.</td></tr>`;
        return;
    }

    data.forEach((customer, index) => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.style.animationDelay = `${index * 0.05}s`;

        const statusClass = customer.status === 'Active' ? 'status-in-stock' : 'status-out-stock';

        let actionHtml = '';
        if (currentUser && currentUser.role === 'ADMIN') {
            actionHtml = `
            <td class="actions-cell">
                <button class="btn-secondary" onclick="openCustomerModal(${customer.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-danger" onclick="deleteCustomer(${customer.id})"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        } else {
            actionHtml = `
            <td class="actions-cell">
                 <span style="color: var(--gray-400); font-size: 0.8em;">Read-only</span>
            </td>`;
        }

        tr.innerHTML = `
            <td><strong>${customer.name}</strong></td>
            <td>
                <div style="font-size: 0.9em; color: var(--text-main)">${customer.email}</div>
                <div style="font-size: 0.8em; color: var(--gray-500)">${customer.phone}</div>
            </td>
            <td style="font-size: 0.85em; color: var(--gray-500); max-width: 200px;">${customer.address}</td>
            <td>${customer.totalOrders}</td>
            <td><span class="status-badge ${statusClass}">${customer.status}</span></td>
            ${actionHtml}
        `;
        tbody.appendChild(tr);
    });
}

function openCustomerModal(id = null) {
    editingCustomerId = id;
    const modal = document.getElementById('customerModal');
    const title = document.getElementById('customerModalTitle');
    const form = document.getElementById('customerForm');

    form.reset();

    if (id) {
        title.innerText = "Edit Customer";
        const customer = customers.find(c => c.id === id);
        if (customer) {
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerEmail').value = customer.email;
            document.getElementById('customerPhone').value = customer.phone;
            document.getElementById('customerAddress').value = customer.address;
            document.getElementById('customerStatus').value = customer.status;
        }
    } else {
        title.innerText = "Add New Customer";
    }

    modal.classList.add('active');
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.remove('active');
    editingCustomerId = null;
}

async function handleCustomerSubmit(e) {
    e.preventDefault();

    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        status: document.getElementById('customerStatus').value,
        totalOrders: editingCustomerId ? customers.find(c => c.id === editingCustomerId).totalOrders : 0
    };

    try {
        let response;
        if (editingCustomerId) {
            response = await fetch(`${API_BASE_URL}/customers/${editingCustomerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });
        }

        if (response.ok) {
            closeCustomerModal();
            fetchCustomers();
        } else {
            alert('Failed to save customer');
        }
    } catch (error) {
        console.error('Customer save error:', error);
    }
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchCustomers();
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
}
// --- Order & Payment Handlers ---

async function fetchOrders() {
    if (!currentUser) return;
    try {
        let url = `${API_BASE_URL}/orders`;
        if (currentUser.role === 'CUSTOMER') {
            url += `?username=${currentUser.username}`;
            document.getElementById('ordersHeader').innerText = "My Orders";
        } else {
            document.getElementById('ordersHeader').innerText = "Order Management";
        }

        const response = await fetch(url);
        if (response.ok) {
            orders = await response.json();
            updateOrderTable(orders);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

function updateOrderTable(data) {
    const tbody = document.getElementById('orderBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--gray-500)">No orders found.</td></tr>`;
        return;
    }

    data.reverse().forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.style.animationDelay = `${index * 0.05}s`;

        const statusClass = order.status.toLowerCase();

        let actionHtml = '';
        if (currentUser.role === 'ADMIN') {
            if (order.status === 'PENDING') {
                actionHtml = `<button class="btn-icon success" title="Approve Payment" onclick="approveOrder(${order.id})"><i class="fa-solid fa-check"></i></button>`;
            } else if (order.status === 'PAID') {
                actionHtml = `<button class="btn-icon" title="Ship Order" onclick="shipOrder(${order.id})"><i class="fa-solid fa-truck"></i></button>`;
            } else if (order.status === 'SHIPPED') {
                actionHtml = `<button class="btn-icon" title="Mark Delivered" onclick="deliverOrder(${order.id})"><i class="fa-solid fa-house-chimney-check"></i></button>`;
            }
        }

        // Add receipt button for paid orders
        if (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
            actionHtml += `<button class="btn-icon" title="View Receipt" onclick="viewOrderReceipt(${order.id})"><i class="fa-solid fa-receipt"></i></button>`;
        }

        const date = new Date(order.createdAt).toLocaleDateString();
        const itemsSummary = order.items.map(it => `${it.quantity}x ${it.product.name}`).join(', ');

        tr.innerHTML = `
            <td>#ORD-${order.id}</td>
            <td>${date}</td>
            <td><strong>${order.user.username}</strong></td>
            <td style="font-size: 0.8em; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsSummary}">${itemsSummary}</td>
            <td>$${order.totalAmount.toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            <td><div class="order-actions">${actionHtml}</div></td>
        `;
        tbody.appendChild(tr);
    });
}

async function placeOrder(productId) {
    if (!confirm('Proceed to buy this product?')) return;

    const items = [{ productId: productId, quantity: 1 }];

    try {
        const response = await fetch(`${API_BASE_URL}/orders?username=${currentUser.username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        });

        if (response.ok) {
            alert('Order placed successfully! Pending payment approval.');
            fetchInventory();
            fetchOrders();
            // Switch to orders view
            document.querySelector('[data-target="orders-view"]').click();
        } else {
            alert('Failed to place order. Check stock or try again.');
        }
    } catch (error) {
        console.error('Order error:', error);
    }
}

async function approveOrder(id) {
    if (!confirm('Approve payment for this order?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/approve`, { method: 'POST' });
        if (response.ok) { fetchOrders(); }
    } catch (error) { console.error('Approval error:', error); }
}

async function shipOrder(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/ship`, { method: 'POST' });
        if (response.ok) { fetchOrders(); }
    } catch (error) { console.error('Ship error:', error); }
}

async function deliverOrder(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/deliver`, { method: 'POST' });
        if (response.ok) { fetchOrders(); }
    } catch (error) { console.error('Deliver error:', error); }
}

// --- System Settings Handlers ---
let systemSettings = null;

async function fetchSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (response.ok) {
            systemSettings = await response.json();
            updateSettingsUI();
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
}

function updateSettingsUI() {
    if (!systemSettings) return;

    document.getElementById('settingCompanyName').value = systemSettings.companyName;
    document.getElementById('settingCurrency').value = systemSettings.currency;
    document.getElementById('settingThreshold').value = systemSettings.lowStockThreshold;
    document.getElementById('settingEmail').value = systemSettings.contactEmail;
    document.getElementById('settingTheme').value = systemSettings.theme;
    document.getElementById('settingChatbot').checked = systemSettings.enableChatbot;

    // Update Global UI elements
    const logoTitle = document.querySelector('.sidebar-header h2');
    if (logoTitle) logoTitle.innerText = systemSettings.companyName.split(' ')[0]; // Use first word as logo text

    // Toggle chatbot visibility
    const chatbotWidget = document.getElementById('chatbotAppWidget');
    if (chatbotWidget) {
        chatbotWidget.style.display = systemSettings.enableChatbot ? 'block' : 'none';
    }
}

async function handleSettingsSubmit(e) {
    e.preventDefault();

    const settingsData = {
        companyName: document.getElementById('settingCompanyName').value,
        currency: document.getElementById('settingCurrency').value,
        lowStockThreshold: parseInt(document.getElementById('settingThreshold').value, 10),
        contactEmail: document.getElementById('settingEmail').value,
        theme: document.getElementById('settingTheme').value,
        enableChatbot: document.getElementById('settingChatbot').checked
    };

    try {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settingsData)
        });

        if (response.ok) {
            systemSettings = await response.json();
            updateSettingsUI();
            alert('Settings updated successfully!');
        } else {
            alert('Failed to update settings');
        }
    } catch (error) {
        console.error('Settings update error:', error);
    }
}

// --- Receipts Handlers ---
async function fetchReceipts() {
    try {
        const response = await fetch(`${API_BASE_URL}/receipts`);
        if (response.ok) {
            const receipts = await response.json();
            updateReceiptTable(receipts);
        } else {
            console.error('Failed to fetch receipts');
        }
    } catch (error) {
        console.error('Error fetching receipts:', error);
    }
}

function updateReceiptTable(receipts) {
    const tbody = document.getElementById('receiptBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (receipts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--gray-500)">No receipts found.</td></tr>`;
        return;
    }

    receipts.reverse().forEach((receipt, index) => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.style.animationDelay = `${index * 0.05}s`;

        const date = new Date(receipt.generatedAt).toLocaleDateString();
        const customerName = receipt.order.user.username;
        const amount = receipt.order.totalAmount.toFixed(2);

        tr.innerHTML = `
            <td><strong>${receipt.receiptNumber}</strong></td>
            <td>#ORD-${receipt.order.id}</td>
            <td>${customerName}</td>
            <td>$${amount}</td>
            <td>${date}</td>
            <td>
                <button class="btn-icon" title="View Receipt" onclick="viewReceipt(${receipt.id})"><i class="fa-solid fa-eye"></i></button>
                <button class="btn-icon" title="Print Receipt" onclick="printReceipt(${receipt.id})"><i class="fa-solid fa-print"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewReceipt(receiptId) {
    // Fetch and display receipt details
    fetch(`${API_BASE_URL}/receipts/${receiptId}`)
        .then(r => {
            if (!r.ok) {
                throw new Error(`HTTP error! status: ${r.status}`);
            }
            return r.json();
        })
        .then(receipt => {
            // Format the details
            const items = receipt.order.items.map(item =>
                `${item.quantity}x ${item.product.name} @ $${item.priceAtOrder.toFixed(2)}`
            ).join('\n');

            const message = `Receipt #${receipt.receiptNumber}
Order ID: #ORD-${receipt.order.id}
Customer: ${receipt.order.user.username}
Date: ${new Date(receipt.generatedAt).toLocaleString()}
Amount: $${receipt.order.totalAmount.toFixed(2)}
Status: ${receipt.payment.status}
Transaction ID: ${receipt.payment.transactionId}

Items:
${items}`;

            alert(message);
        })
        .catch(error => {
            console.error('Error loading receipt:', error);
            alert('Failed to load receipt details. Please try again.');
        });
}

function viewOrderReceipt(orderId) {
    // Get receipt for a specific order
    fetch(`${API_BASE_URL}/orders/${orderId}/receipt`)
        .then(r => {
            if (r.ok) {
                return r.json();
            } else {
                throw new Error('Receipt not found');
            }
        })
        .then(receipt => {
            // Show receipt details or open print view
            const confirmed = confirm(`Receipt #${receipt.receiptNumber}\nOrder: #ORD-${receipt.order.id}\nAmount: $${receipt.order.totalAmount.toFixed(2)}\n\nClick OK to print receipt or Cancel to close`);
            if (confirmed) {
                printReceipt(receipt.id);
            }
        })
        .catch(error => {
            console.error('Error loading receipt:', error);
            alert('Receipt not available for this order yet.');
        });
}

function printReceipt(receiptId) {
    // Open the print template in a new window
    window.open(`${API_BASE_URL}/receipts/${receiptId}/print`, 'receipt', 'width=800,height=600');
}
