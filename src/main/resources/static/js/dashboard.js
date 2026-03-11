/**
 * =============================================================
 * B-MIS DASHBOARD — dashboard.js
 * Handles: Chart.js initialization, nav switching,
 *          sidebar toggle, and dashboard metrics loading.
 * =============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------
    // SIDEBAR TOGGLE (mobile)
    // ----------------------------------------------------------
    const sidebar       = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const overlay       = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }

    sidebarToggle?.addEventListener('click', () =>
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar()
    );

    overlay?.addEventListener('click', closeSidebar);

    // ----------------------------------------------------------
    // VIEW NAVIGATION
    // ----------------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item[data-target]');

    function switchView(targetId) {
        // Hide all sections
        document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
        // Remove active from all nav items
        navItems.forEach(n => n.classList.remove('active'));

        // Show target section
        const target = document.getElementById(targetId);
        if (target) target.classList.remove('hidden');

        // Activate nav item
        const activeNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Load view-specific data
        if (targetId === 'products-view')  loadProductGallery();
        if (targetId === 'stock-view')     loadInventoryTable();
        if (targetId === 'orders-view')    loadOrders();
        if (targetId === 'customers-view') loadCustomers();

        closeSidebar();
    }

    navItems.forEach(item => {
        item.querySelector('.nav-link')?.addEventListener('click', e => {
            e.preventDefault();
            switchView(item.dataset.target);
        });
    });

    // "View all" links from dashboard cards
    document.querySelectorAll('.link-more[data-target]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            switchView(link.dataset.target);
        });
    });

    // ----------------------------------------------------------
    // CHATBOT TOGGLE
    // ----------------------------------------------------------
    window.toggleChatbot = function () {
        const panel = document.getElementById('chatbotContainer');
        panel?.classList.toggle('active');
    };

    window.handleChatKeypress = function (e) {
        if (e.key === 'Enter') window.sendMessage?.();
    };

    // ----------------------------------------------------------
    // CHARTS
    // ----------------------------------------------------------

    /** Bar chart — Stock Overview */
    function renderStockChart(data = []) {
        const ctx = document.getElementById('stockChart');
        if (!ctx || !window.Chart) return;

        if (ctx._chartInstance) ctx._chartInstance.destroy();

        const labels = data.map(d => d.name || 'Product').slice(0, 10);
        const values = data.map(d => d.quantity ?? 0).slice(0, 10);

        const colors = labels.map((_, i) => {
            const palette = [
                'rgba(79,70,229,.7)',
                'rgba(16,185,129,.7)',
                'rgba(124,58,237,.7)',
                'rgba(245,158,11,.7)',
                'rgba(239,68,68,.7)',
                'rgba(34,211,238,.7)',
            ];
            return palette[i % palette.length];
        });

        ctx._chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Stock (Units)',
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.parsed.y} units`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    }
                }
            }
        });
    }

    /** Donut chart — Inventory Health */
    function renderHealthChart(inStock, lowStock, outOfStock) {
        const ctx = document.getElementById('healthChart');
        if (!ctx || !window.Chart) return;

        if (ctx._chartInstance) ctx._chartInstance.destroy();

        const total = inStock + lowStock + outOfStock || 1;

        ctx._chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                datasets: [{
                    data: [inStock, lowStock, outOfStock],
                    backgroundColor: [
                        'rgba(16,185,129,.8)',
                        'rgba(245,158,11,.8)',
                        'rgba(239,68,68,.8)',
                    ],
                    borderWidth: 0,
                    hoverOffset: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / total * 100)}%)`
                        }
                    }
                }
            }
        });

        // Build legend
        const legendEl = document.getElementById('donutLegend');
        if (!legendEl) return;
        const colors = ['#10b981', '#f59e0b', '#ef4444'];
        const labels = ['In Stock', 'Low Stock', 'Out of Stock'];
        const values = [inStock, lowStock, outOfStock];

        legendEl.innerHTML = labels.map((l, i) => `
            <div class="donut-legend-item">
                <span class="legend-dot" style="background:${colors[i]}"></span>
                <span>${l}</span>
                <span class="legend-val">${values[i]}</span>
            </div>
        `).join('');
    }

    // ----------------------------------------------------------
    // METRICS & TABLE — Dashboard
    // ----------------------------------------------------------
    function loadDashboardData(products = []) {
        const total      = products.length;
        const totalStock = products.reduce((s, p) => s + (p.quantity ?? 0), 0);
        const totalValue = products.reduce((s, p) => s + (p.quantity ?? 0) * (p.price ?? 0), 0);
        const threshold  = parseInt(localStorage.getItem('lowStockThreshold') || '10', 10);
        const low        = products.filter(p => (p.quantity ?? 0) <= threshold && (p.quantity ?? 0) > 0);
        const out        = products.filter(p => (p.quantity ?? 0) === 0);
        const inStock    = products.filter(p => (p.quantity ?? 0) > threshold);

        // Stat cards
        document.getElementById('totalProducts').textContent = total;
        document.getElementById('totalStock').textContent    = totalStock.toLocaleString();
        document.getElementById('totalValue').textContent    = '$' + totalValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        document.getElementById('lowStockCount').textContent = low.length + out.length;

        // Charts
        renderStockChart(products);
        renderHealthChart(inStock.length, low.length, out.length);

        // Recent table (latest 8 products)
        const recent = [...products].reverse().slice(0, 8);
        renderRecentTable(recent, threshold);
    }

    function renderRecentTable(products, threshold = 10) {
        const tbody = document.getElementById('recentTableBody');
        if (!tbody) return;

        if (!products.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No products yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(p => {
            const qty = p.quantity ?? 0;
            let statusTag;
            if (qty === 0)          statusTag = '<span class="status-tag tag-red">Out of Stock</span>';
            else if (qty <= threshold) statusTag = '<span class="status-tag tag-amber">Low Stock</span>';
            else                    statusTag = '<span class="status-tag tag-green">In Stock</span>';

            const isAdmin = window._currentUser?.role === 'ADMIN';
            const actions = isAdmin ? `
                <td>
                    <button class="tbl-btn" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="tbl-btn del" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </td>` : '<td class="admin-only"></td>';

            return `
            <tr>
                <td><span class="sku-tag">${p.sku || '—'}</span></td>
                <td>${p.name}</td>
                <td>${p.category || 'General'}</td>
                <td><strong>${qty}</strong></td>
                <td>$${parseFloat(p.price ?? 0).toFixed(2)}</td>
                <td>${statusTag}</td>
                ${actions}
            </tr>`;
        }).join('');
    }

    // ----------------------------------------------------------
    // INVENTORY TABLE (Stock View)
    // ----------------------------------------------------------
    window.loadInventoryTable = async function () {
        const tbody = document.getElementById('inventoryBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i></td></tr>`;

        try {
            const products = await fetchProducts();
            if (!tbody) return;

            if (!products.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No products in inventory.</td></tr>`;
                return;
            }

            const threshold = parseInt(localStorage.getItem('lowStockThreshold') || '10', 10);
            const isAdmin = window._currentUser?.role === 'ADMIN';

            tbody.innerHTML = products.map(p => {
                const qty = p.quantity ?? 0;
                let statusTag;
                if (qty === 0)              statusTag = '<span class="status-tag tag-red">Out of Stock</span>';
                else if (qty <= threshold)  statusTag = '<span class="status-tag tag-amber">Low Stock</span>';
                else                        statusTag = '<span class="status-tag tag-green">In Stock</span>';

                const actions = isAdmin ? `
                    <td>
                        <button class="tbl-btn" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="tbl-btn del" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>` : '<td></td>';

                return `
                <tr>
                    <td><span class="sku-tag">${p.sku || '—'}</span></td>
                    <td>${p.name}</td>
                    <td>${p.description || '—'}</td>
                    <td>${qty}</td>
                    <td>$${parseFloat(p.price ?? 0).toFixed(2)}</td>
                    ${actions}
                </tr>`;
            }).join('');
        } catch {
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Failed to load data.</td></tr>`;
        }
    };

    // ----------------------------------------------------------
    // PRODUCT GALLERY (Products view)
    // ----------------------------------------------------------
    window.loadProductGallery = async function () {
        const gallery = document.getElementById('productGallery');
        if (!gallery) return;
        gallery.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading…</div>`;

        try {
            const products = await fetchProducts();
            if (!products.length) {
                gallery.innerHTML = `<div class="empty-state">No products yet. Add your first one!</div>`;
                return;
            }

            const isAdmin   = window._currentUser?.role === 'ADMIN';
            const threshold = parseInt(localStorage.getItem('lowStockThreshold') || '10', 10);

            gallery.innerHTML = products.map(p => {
                const qty = p.quantity ?? 0;
                let tag;
                if (qty === 0)              tag = '<span class="status-tag tag-red">Out of Stock</span>';
                else if (qty <= threshold)  tag = '<span class="status-tag tag-amber">Low Stock</span>';
                else                        tag = '<span class="status-tag tag-green">In Stock</span>';

                const imgSrc = p.imageUrl ? p.imageUrl : `https://via.placeholder.com/280x180?text=${encodeURIComponent(p.name)}`;

                return `
                <div class="product-card">
                    <div class="product-image-container">
                        <img src="${imgSrc}" alt="${p.name}" loading="lazy">
                    </div>
                    <div class="product-details">
                        <p class="product-sku">${p.sku || 'NO-SKU'}</p>
                        <h3>${p.name}</h3>
                        <p class="product-desc">${p.description || ''}</p>
                        <div class="product-meta">
                            <span class="product-price">$${parseFloat(p.price ?? 0).toFixed(2)}</span>
                            ${tag}
                        </div>
                        ${isAdmin ? `
                        <div class="d-flex gap-2 mt-3">
                            <button class="tbl-btn w-100 text-center" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                            <button class="tbl-btn del w-100 text-center" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                        </div>` : ''}
                    </div>
                </div>`;
            }).join('');
        } catch {
            gallery.innerHTML = `<div class="empty-state">Failed to load products.</div>`;
        }
    };

    // ----------------------------------------------------------
    // ORDERS (Sales view)
    // ----------------------------------------------------------
    window.loadOrders = async function () {
        const tbody = document.getElementById('orderBody');
        if (!tbody) return;
        try {
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error();
            const orders = await res.json();

            if (!orders.length) {
                tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No orders yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = orders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '—'}</td>
                <td>${o.customer?.name || o.customerId || '—'}</td>
                <td>${o.items?.length ?? 0} item(s)</td>
                <td>$${parseFloat(o.totalAmount ?? 0).toFixed(2)}</td>
                <td><span class="status-tag ${o.status === 'COMPLETED' ? 'tag-green' : o.status === 'PENDING' ? 'tag-amber' : 'tag-red'}">${o.status || 'PENDING'}</span></td>
                <td><button class="tbl-btn" onclick="viewOrder(${o.id})"><i class="fa-solid fa-eye"></i></button></td>
            </tr>`).join('');
        } catch {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No sales data available.</td></tr>`;
        }
    };

    // ----------------------------------------------------------
    // CUSTOMERS
    // ----------------------------------------------------------
    window.loadCustomers = async function () {
        const tbody = document.getElementById('customerBody');
        if (!tbody) return;
        try {
            const res = await fetch('/api/customers');
            if (!res.ok) throw new Error();
            const customers = await res.json();

            if (!customers.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No customers yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = customers.map(c => `
            <tr>
                <td>${c.name || '—'}</td>
                <td>${c.contact || c.email || '—'}</td>
                <td>${c.address || '—'}</td>
                <td>${c.orderCount ?? '—'}</td>
                <td><span class="status-tag tag-green">Active</span></td>
                <td>
                    <button class="tbl-btn" onclick="editCustomer(${c.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="tbl-btn del" onclick="deleteCustomer(${c.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`).join('');
        } catch {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No customer data available.</td></tr>`;
        }
    };

    // ----------------------------------------------------------
    // SETTINGS FORM
    // ----------------------------------------------------------
    document.getElementById('settingsForm')?.addEventListener('submit', e => {
        e.preventDefault();
        const name      = document.getElementById('settingCompanyName')?.value;
        const currency  = document.getElementById('settingCurrency')?.value;
        const threshold = document.getElementById('settingThreshold')?.value;
        const email     = document.getElementById('settingEmail')?.value;

        localStorage.setItem('companyName',       name);
        localStorage.setItem('currency',          currency);
        localStorage.setItem('lowStockThreshold', threshold);
        localStorage.setItem('supportEmail',      email);

        alert('Settings saved!');
    });

    // ----------------------------------------------------------
    // PRODUCT MODAL
    // ----------------------------------------------------------
    window.openModal = function (product = null) {
        document.getElementById('modalTitle').textContent = product ? 'Edit Product' : 'Add New Product';
        document.getElementById('productId').value   = product?.id ?? '';
        document.getElementById('sku').value         = product?.sku ?? '';
        document.getElementById('name').value        = product?.name ?? '';
        document.getElementById('description').value = product?.description ?? '';
        document.getElementById('quantity').value    = product?.quantity ?? '';
        document.getElementById('price').value       = product?.price ?? '';
        document.getElementById('productModal').classList.remove('hidden');
    };

    window.closeModal = function () {
        document.getElementById('productModal').classList.add('hidden');
        document.getElementById('productForm').reset();
    };

    document.getElementById('productForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const payload = {
            sku:         document.getElementById('sku').value,
            name:        document.getElementById('name').value,
            description: document.getElementById('description').value,
            quantity:    parseInt(document.getElementById('quantity').value, 10),
            price:       parseFloat(document.getElementById('price').value),
        };

        try {
            const res = id
                ? await fetch(`/api/products/${id}`, { method: 'PUT',   headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                : await fetch('/api/products',        { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (res.ok) {
                closeModal();
                await bootstrapDashboard();
            } else {
                alert('Failed to save product.');
            }
        } catch {
            alert('Network error. Please try again.');
        }
    });

    window.editProduct = async function (id) {
        try {
            const res = await fetch(`/api/products/${id}`);
            const p   = await res.json();
            openModal(p);
        } catch {
            alert('Failed to load product data.');
        }
    };

    window.deleteProduct = async function (id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) await bootstrapDashboard();
            else alert('Failed to delete product.');
        } catch {
            alert('Network error.');
        }
    };

    // ----------------------------------------------------------
    // CUSTOMER MODAL
    // ----------------------------------------------------------
    window.openCustomerModal = function (customer = null) {
        document.getElementById('customerModalTitle').textContent = customer ? 'Edit Customer' : 'Add New Customer';
        document.getElementById('customerId').value      = customer?.id ?? '';
        document.getElementById('customerName').value    = customer?.name ?? '';
        document.getElementById('customerEmail').value   = customer?.email ?? '';
        document.getElementById('customerPhone').value   = customer?.phone ?? '';
        document.getElementById('customerAddress').value = customer?.address ?? '';
        document.getElementById('customerStatus').value  = customer?.status ?? 'Active';
        document.getElementById('customerModal').classList.remove('hidden');
    };

    window.closeCustomerModal = function () {
        document.getElementById('customerModal').classList.add('hidden');
        document.getElementById('customerForm').reset();
    };

    document.getElementById('customerForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const id = document.getElementById('customerId').value;
        const payload = {
            name:    document.getElementById('customerName').value,
            email:   document.getElementById('customerEmail').value,
            phone:   document.getElementById('customerPhone').value,
            address: document.getElementById('customerAddress').value,
            status:  document.getElementById('customerStatus').value,
        };

        try {
            const res = id
                ? await fetch(`/api/customers/${id}`, { method: 'PUT',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                : await fetch('/api/customers',        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (res.ok) {
                closeCustomerModal();
                loadCustomers();
            } else {
                alert('Failed to save customer.');
            }
        } catch {
            alert('Network error.');
        }
    });

    window.editCustomer = async function (id) {
        try {
            const res = await fetch(`/api/customers/${id}`);
            const c   = await res.json();
            openCustomerModal(c);
        } catch {
            alert('Failed to load customer.');
        }
    };

    window.deleteCustomer = async function (id) {
        if (!confirm('Delete this customer?')) return;
        try {
            const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (res.ok) loadCustomers();
        } catch {
            alert('Network error.');
        }
    };

    // ----------------------------------------------------------
    // HELPERS
    // ----------------------------------------------------------
    async function fetchProducts() {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Products fetch failed');
        return res.json();
    }

    // ----------------------------------------------------------
    // BOOTSTRAP DASHBOARD (initial load)
    // ----------------------------------------------------------
    async function bootstrapDashboard() {
        try {
            const products = await fetchProducts();
            loadDashboardData(products);
        } catch {
            ['totalProducts','totalStock','totalValue','lowStockCount'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = 'N/A';
            });
            const tbody = document.getElementById('recentTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Could not load data.</td></tr>`;
        }
    }

    // ----------------------------------------------------------
    // SEARCH (live filter on recent table)
    // ----------------------------------------------------------
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#recentTableBody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });

    // ----------------------------------------------------------
    // INIT
    // ----------------------------------------------------------
    bootstrapDashboard();

}); // end DOMContentLoaded
