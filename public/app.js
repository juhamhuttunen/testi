// Global state
let products = [];
let currentProduct = null;

// DOM Elements
const productsTableBody = document.getElementById('productsTableBody');
const productModal = document.getElementById('productModal');
const quantityModal = document.getElementById('quantityModal');
const productForm = document.getElementById('productForm');
const addProductBtn = document.getElementById('addProductBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add product button
    addProductBtn.addEventListener('click', () => {
        openProductModal();
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeModals();
        });
    });

    // Cancel buttons
    document.getElementById('cancelBtn').addEventListener('click', closeModals);
    document.getElementById('cancelQuantityBtn').addEventListener('click', closeModals);

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === productModal || e.target === quantityModal) {
            closeModals();
        }
    });

    // Product form submission
    productForm.addEventListener('submit', handleProductSubmit);

    // Quantity update button
    document.getElementById('updateQuantityBtn').addEventListener('click', handleQuantityUpdate);

    // Search and filter
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        products = await response.json();
        displayProducts(products);
        updateStatistics(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

// Display products in table
function displayProducts(productsToDisplay) {
    if (productsToDisplay.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div>🎿</div>
                    <p>No products found</p>
                </td>
            </tr>
        `;
        return;
    }

    productsTableBody.innerHTML = productsToDisplay.map(product => {
        const totalValue = (product.price * product.quantity).toFixed(2);
        const quantityClass = product.quantity < 10 ? 'quantity-low' : 
                            product.quantity < 20 ? 'quantity-medium' : 'quantity-good';
        const categoryClass = `category-${product.category.toLowerCase()}`;

        return `
            <tr>
                <td><strong>${product.sku || 'N/A'}</strong></td>
                <td>
                    <div class="product-name">${product.name}</div>
                    ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                </td>
                <td><span class="category-badge ${categoryClass}">${product.category}</span></td>
                <td><strong>$${product.price.toFixed(2)}</strong></td>
                <td><span class="quantity-badge ${quantityClass}">${product.quantity}</span></td>
                <td><strong>$${totalValue}</strong></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-quantity" onclick="openQuantityModal(${product.id})">📦 Qty</button>
                        <button class="btn btn-edit" onclick="openProductModal(${product.id})">✏️ Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Update statistics
function updateStatistics(productsData) {
    const totalProducts = productsData.length;
    const totalValue = productsData.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStockCount = productsData.filter(p => p.quantity < 10).length;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('lowStockCount').textContent = lowStockCount;
}

// Filter products based on search and category
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                            (product.sku && product.sku.toLowerCase().includes(searchTerm));
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filtered);
    updateStatistics(filtered);
}

// Open product modal (for add or edit)
function openProductModal(productId = null) {
    const modalTitle = document.getElementById('modalTitle');
    
    if (productId) {
        // Edit mode
        currentProduct = products.find(p => p.id === productId);
        modalTitle.textContent = 'Edit Product';
        document.getElementById('productId').value = currentProduct.id;
        document.getElementById('productName').value = currentProduct.name;
        document.getElementById('productDescription').value = currentProduct.description || '';
        document.getElementById('productCategory').value = currentProduct.category;
        document.getElementById('productSku').value = currentProduct.sku || '';
        document.getElementById('productPrice').value = currentProduct.price;
        document.getElementById('productQuantity').value = currentProduct.quantity;
    } else {
        // Add mode
        currentProduct = null;
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
        document.getElementById('productId').value = '';
    }
    
    productModal.style.display = 'block';
}

// Open quantity modal
function openQuantityModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;
    document.getElementById('quantityProductName').textContent = product.name;
    document.getElementById('currentQuantity').textContent = product.quantity;
    document.getElementById('newQuantity').value = product.quantity;
    quantityModal.style.display = 'block';
}

// Close all modals
function closeModals() {
    productModal.style.display = 'none';
    quantityModal.style.display = 'none';
    productForm.reset();
    currentProduct = null;
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value,
        sku: document.getElementById('productSku').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value)
    };

    const productId = document.getElementById('productId').value;

    try {
        let response;
        if (productId) {
            // Update existing product
            response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (!response.ok) throw new Error('Failed to save product');

        closeModals();
        await loadProducts();
        showSuccess(productId ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Failed to save product');
    }
}

// Handle quantity update
async function handleQuantityUpdate() {
    if (!currentProduct) return;

    const newQuantity = parseInt(document.getElementById('newQuantity').value);
    
    try {
        const response = await fetch(`/api/products/${currentProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentProduct,
                quantity: newQuantity
            })
        });

        if (!response.ok) throw new Error('Failed to update quantity');

        closeModals();
        await loadProducts();
        showSuccess('Quantity updated successfully!');
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError('Failed to update quantity');
    }
}

// Delete product
async function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete product');

        await loadProducts();
        showSuccess('Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
    }
}

// Show success message
function showSuccess(message) {
    // Simple alert for now - could be enhanced with a toast notification
    alert(message);
}

// Show error message
function showError(message) {
    alert('Error: ' + message);
}
