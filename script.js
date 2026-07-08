// script.js — логика с уникальным ключом
const STORAGE_KEY = 'velo_store_products_v2';

// === 8 стартовых товаров ===
function getDefaultProducts() {
    return [
        { id: 1, name: 'Trek Fuel EX 8', brand: 'Trek', price: 189000, emoji: '🏔️', badge: 'Топ' },
        { id: 2, name: 'Specialized Stumpjumper', brand: 'Specialized', price: 215000, emoji: '🚵', badge: 'Хит' },
        { id: 3, name: 'Canyon Spectral CF 7', brand: 'Canyon', price: 172000, emoji: '⚡', badge: 'Новинка' },
        { id: 4, name: 'Giant Trance Advanced', brand: 'Giant', price: 198000, emoji: '🌟', badge: '' },
        { id: 5, name: 'Scott Spark 940', brand: 'Scott', price: 156000, emoji: '🏁', badge: 'Скидка' },
        { id: 6, name: 'Merida Big Nine 6000', brand: 'Merida', price: 134000, emoji: '🚴', badge: '' },
        { id: 7, name: 'Cube Stereo Hybrid 140', brand: 'Cube', price: 245000, emoji: '🔋', badge: 'Электро' },
        { id: 8, name: 'Santa Cruz Bronson', brand: 'Santa Cruz', price: 289000, emoji: '🔥', badge: 'Премиум' }
    ];
}

let products = [];

function loadProducts() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            products = JSON.parse(saved);
        } catch (e) {
            products = getDefaultProducts();
        }
    } else {
        products = getDefaultProducts();
        saveProducts();
    }
    return products;
}

function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// === Рендер на главной ===
function renderMainProducts() {
    const container = document.getElementById('productList');
    if (!container) return;

    const list = loadProducts();
    container.innerHTML = list.map(p => `
        <div class="product-card" data-id="${p.id}">
            <div class="product-image">
                ${p.emoji || '🚲'}
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <div class="brand">${p.brand || 'VELO'}</div>
                <h3>${p.name}</h3>
                <div class="specs">
                    <span>⚙️ 2026</span>
                    <span>🚲 Горный</span>
                </div>
                <div class="product-price-row">
                    <span class="product-price">${p.price.toLocaleString()} ₽</span>
                    <span class="product-status">● В наличии</span>
                </div>
            </div>
        </div>
    `).join('');
}

// === Рендер в админке ===
function renderAdminProducts() {
    const container = document.getElementById('adminProductList');
    if (!container) return;

    const list = loadProducts();
    if (list.length === 0) {
        container.innerHTML = '<div class="empty-message">📭 Товаров пока нет. Добавьте первый!</div>';
    } else {
        container.innerHTML = list.map(p => `
            <div class="admin-product-item" data-id="${p.id}">
                <div class="product-info">
                    <span>${p.emoji || '🚲'}</span>
                    <strong>${p.name}</strong>
                    <span class="product-brand">${p.brand || ''}</span>
                    <span class="product-price">${p.price.toLocaleString()} ₽</span>
                    ${p.badge ? `<span style="font-size:0.7rem;background:#e94560;color:#fff;padding:2px 10px;border-radius:30px;">${p.badge}</span>` : ''}
                </div>
                <button class="delete-btn" onclick="deleteProduct(${p.id})">✕ Удалить</button>
            </div>
        `).join('');
    }

    const counter = document.getElementById('productCount');
    if (counter) counter.textContent = list.length;

    const total = list.reduce((sum, p) => sum + p.price, 0);
    const revenue = document.getElementById('totalRevenue');
    if (revenue) revenue.textContent = `₽ ${total.toLocaleString()}`;

    const avg = document.getElementById('avgPrice');
    if (avg && list.length > 0) {
        avg.textContent = `₽ ${Math.round(total / list.length).toLocaleString()}`;
    } else if (avg) {
        avg.textContent = '₽ 0';
    }
}

// === Добавление ===
function addProduct(name, brand, price, emoji) {
    const list = loadProducts();
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    list.push({
        id: newId,
        name: name.trim(),
        brand: brand.trim() || 'VELO',
        price: parseInt(price),
        emoji: emoji.trim() || '🚲',
        badge: ''
    });
    products = list;
    saveProducts();
    renderAdminProducts();
    renderMainProducts();
}

// === Удаление ===
function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    let list = loadProducts();
    list = list.filter(p => p.id !== id);
    products = list;
    saveProducts();
    renderAdminProducts();
    renderMainProducts();
}

// === Очистка ===
function clearAllData() {
    if (confirm('Сбросить каталог к 8 стандартным товарам?')) {
        localStorage.removeItem(STORAGE_KEY);
        products = getDefaultProducts();
        saveProducts();
        renderAdminProducts();
        renderMainProducts();
        alert('✅ Каталог восстановлен!');
    }
}

// === Инициализация ===
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    renderMainProducts();

    if (document.getElementById('adminProductList')) {
        renderAdminProducts();
    }

    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('productName').value;
            const brand = document.getElementById('productBrand').value;
            const price = document.getElementById('productPrice').value;
            const emoji = document.getElementById('productEmoji').value;

            if (name && price) {
                addProduct(name, brand, price, emoji);
                form.reset();
                alert('✅ Товар добавлен в каталог!');
            } else {
                alert('⚠️ Заполните название и цену');
            }
        });
    }

    // Ссылка на админку
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }

    // Секретный сброс: Shift+Ctrl+Alt+D
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.ctrlKey && e.altKey && e.key === 'd') {
            if (document.getElementById('adminProductList')) {
                clearAllData();
            }
        }
    });
});
