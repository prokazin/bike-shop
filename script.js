// script.js — общая логика с уникальным ключом
// Используем уникальный ключ, чтобы не пересекаться с другими проектами
const STORAGE_KEY = 'bike_shop_products_v1';

// === Управление товарами ===
let products = [];

// Загрузка из localStorage с уникальным ключом
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

// Стартовые товары
function getDefaultProducts() {
    return [
        { id: 1, name: 'Горный', price: 45000, emoji: '🏁' },
        { id: 2, name: 'Электро', price: 78000, emoji: '⚡' },
        { id: 3, name: 'Шоссейный', price: 62000, emoji: '🚴' },
        { id: 4, name: 'Детский', price: 19000, emoji: '🛞' }
    ];
}

function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// === Рендер на главной странице ===
function renderMainProducts() {
    const container = document.getElementById('productList');
    if (!container) return;

    const list = loadProducts();
    container.innerHTML = list.map(p => `
        <div class="product-card" data-id="${p.id}">
            ${p.emoji || '🚲'} ${p.name}
            <small>₽ ${p.price.toLocaleString()}</small>
        </div>
    `).join('');
}

// === Рендер в админ-панели ===
function renderAdminProducts() {
    const container = document.getElementById('adminProductList');
    if (!container) return;

    const list = loadProducts();
    if (list.length === 0) {
        container.innerHTML = '<div class="empty-message">Товаров пока нет. Добавьте первый!</div>';
    } else {
        container.innerHTML = list.map(p => `
            <div class="admin-product-item" data-id="${p.id}">
                <div class="product-info">
                    <span>${p.emoji || '🚲'} ${p.name}</span>
                    <span class="product-price">₽ ${p.price.toLocaleString()}</span>
                </div>
                <button class="delete-btn" onclick="deleteProduct(${p.id})">✕ Удалить</button>
            </div>
        `).join('');
    }

    // Обновляем счетчик
    const counter = document.getElementById('productCount');
    if (counter) counter.textContent = list.length;

    // Обновляем выручку (сумма всех цен)
    const revenue = document.getElementById('totalRevenue');
    if (revenue) {
        const total = list.reduce((sum, p) => sum + p.price, 0);
        revenue.textContent = `₽ ${total.toLocaleString()}`;
    }
}

// === Добавление товара ===
function addProduct(name, price, emoji) {
    const list = loadProducts();
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    list.push({
        id: newId,
        name: name.trim(),
        price: parseInt(price),
        emoji: emoji.trim() || '🚲'
    });
    products = list;
    saveProducts();
    renderAdminProducts();
    renderMainProducts();
}

// === Удаление товара ===
function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    let list = loadProducts();
    list = list.filter(p => p.id !== id);
    products = list;
    saveProducts();
    renderAdminProducts();
    renderMainProducts();
}

// === Очистка всех данных (для отладки) ===
function clearAllData() {
    if (confirm('Удалить все товары?')) {
        localStorage.removeItem(STORAGE_KEY);
        products = getDefaultProducts();
        saveProducts();
        renderAdminProducts();
        renderMainProducts();
        alert('✅ Данные сброшены до стандартных');
    }
}

// === Инициализация ===
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем товары
    loadProducts();

    // Рендерим главную страницу
    renderMainProducts();

    // Рендерим админку (если мы на странице admin.html)
    if (document.getElementById('adminProductList')) {
        renderAdminProducts();
    }

    // === Форма добавления товара ===
    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('productName').value;
            const price = document.getElementById('productPrice').value;
            const emoji = document.getElementById('productEmoji').value;

            if (name && price) {
                addProduct(name, price, emoji);
                form.reset();
                alert('✅ Товар добавлен!');
            } else {
                alert('⚠️ Заполните название и цену');
            }
        });
    }

    // Секретная кнопка для сброса данных (для разработчика)
    // Нажмите Shift+Ctrl+Alt+D на админке
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.ctrlKey && e.altKey && e.key === 'd') {
            if (document.getElementById('adminProductList')) {
                clearAllData();
            }
        }
    });
});
