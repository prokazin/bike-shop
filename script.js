// script.js
const STORAGE_KEY = 'bike_site_products_v3';

// === 8 товаров ===
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
        try { products = JSON.parse(saved); }
        catch (e) { products = getDefaultProducts(); }
    } else {
        products = getDefaultProducts();
        saveProducts();
    }
    return products;
}

function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// === Рендер товаров в раме ===
function renderProducts(filter) {
    const container = document.getElementById('mainContent');
    if (!container) return;

    const list = loadProducts();
    let filtered = list;

    if (filter === 'mountain') {
        filtered = list.filter(p => p.brand === 'Trek' || p.brand === 'Giant' || p.brand === 'Specialized');
    } else if (filter === 'road') {
        filtered = list.filter(p => p.brand === 'Canyon' || p.brand === 'Scott');
    } else if (filter === 'electric') {
        filtered = list.filter(p => p.badge === 'Электро');
    } else if (filter === 'kids') {
        filtered = list.filter(p => p.price < 100000);
    } else if (filter === 'accessories') {
        filtered = list.filter(p => p.emoji === '🔋' || p.emoji === '⚡');
    }
    // 'catalog' или undefined — все товары

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-message">🚲 Товаров в этой категории пока нет</div>`;
        return;
    }

    container.innerHTML = `
        <div class="product-grid">
            ${filtered.map(p => `
                <div class="product-card">
                    <span class="emoji">${p.emoji || '🚲'}</span>
                    <div class="name">${p.name}</div>
                    <div class="brand">${p.brand || ''}</div>
                    <div class="price">${p.price.toLocaleString()} ₽</div>
                    ${p.badge ? `<div class="badge">${p.badge}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// === Рендер в админке ===
function renderAdmin() {
    const container = document.getElementById('adminList');
    if (!container) return;

    const list = loadProducts();
    if (list.length === 0) {
        container.innerHTML = '<div class="empty">Нет товаров</div>';
    } else {
        container.innerHTML = list.map(p => `
            <div class="admin-item">
                <div class="info">
                    <span>${p.emoji || '🚲'}</span>
                    <strong>${p.name}</strong>
                    <span class="brand">${p.brand || ''}</span>
                    <span class="price">${p.price.toLocaleString()} ₽</span>
                    ${p.badge ? `<span style="font-size:0.6rem;background:#e94560;color:#fff;padding:1px 10px;border-radius:30px;">${p.badge}</span>` : ''}
                </div>
                <button class="del" onclick="deleteProduct(${p.id})">✕</button>
            </div>
        `).join('');
    }

    const count = document.getElementById('productCount');
    if (count) count.textContent = list.length;

    const total = list.reduce((s, p) => s + p.price, 0);
    const sum = document.getElementById('totalSum');
    if (sum) sum.textContent = total.toLocaleString() + ' ₽';
}

// === Добавление ===
function addProduct(name, brand, price, emoji) {
    const list = loadProducts();
    const newId = list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
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
    renderAdmin();
    renderProducts(currentFilter);
}

// === Удаление ===
function deleteProduct(id) {
    if (!confirm('Удалить?')) return;
    let list = loadProducts();
    list = list.filter(p => p.id !== id);
    products = list;
    saveProducts();
    renderAdmin();
    renderProducts(currentFilter);
}

// === Навигация по вкладкам ===
let currentFilter = 'catalog';

function setupNavigation() {
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.page || 'catalog';
            renderProducts(currentFilter);
        });
    });
}

// === Инициализация ===
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    renderProducts('catalog');
    setupNavigation();

    // Админка
    if (document.getElementById('adminList')) {
        renderAdmin();
    }

    // Форма добавления
    const form = document.getElementById('addForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('pName').value;
            const brand = document.getElementById('pBrand').value;
            const price = document.getElementById('pPrice').value;
            const emoji = document.getElementById('pEmoji').value;
            if (name && price) {
                addProduct(name, brand, price, emoji);
                form.reset();
                alert('✅ Добавлено');
            } else {
                alert('⚠️ Заполните название и цену');
            }
        });
    }

    // Ссылка на админку (педаль)
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.addEventListener('click', function() {
            window.location.href = 'admin.html';
        });
    }
});
