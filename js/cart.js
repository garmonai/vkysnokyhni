// Состояние корзины
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM элементы
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSubtotalElement = document.querySelector('.cart-subtotal');
    const cartTotalElement = document.querySelector('.cart-total');
    const cartCountElement = document.querySelector('.cart-count');

    // Функция обновления отображения корзины
    function updateCartDisplay() {
        if (!cartItemsContainer) return;

        // Проверяем есть ли товары в корзине
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Ваша корзина пуста</p>
                    <a href="catalog.html" class="btn">Перейти в каталог</a>
                </div>
            `;
            updateTotalSums(0);
            return;
        }

        // Формируем HTML для товаров
        let cartHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            cartHTML += createCartItemHTML(item, index);
        });

        // Обновляем HTML корзины
        cartItemsContainer.innerHTML = cartHTML;

        // Обновляем итоговые суммы
        updateTotalSums(subtotal);

        // Добавляем обработчики событий для кнопок
        setupCartControls();
    }

    // Функция создания HTML для одного товара
    function createCartItemHTML(item, index) {
        return `
            <div class="cart-item" data-index="${index}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">${item.price.toLocaleString()} ₽</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                    <div class="item-total">${(item.price * item.quantity).toLocaleString()} ₽</div>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Функция обновления итоговых сумм
    function updateTotalSums(subtotal) {
        if (cartSubtotalElement) cartSubtotalElement.textContent = `${subtotal.toLocaleString()} ₽`;
        if (cartTotalElement) cartTotalElement.textContent = `${subtotal.toLocaleString()} ₽`;
    }

    // Функция обновления одного товара
    function updateCartItem(index) {
        const item = cart[index];
        const cartItem = cartItemsContainer.querySelector(`.cart-item[data-index="${index}"]`);
        
        if (cartItem) {
            const quantityValue = cartItem.querySelector('.quantity-value');
            const itemTotal = cartItem.querySelector('.item-total');
            
            quantityValue.textContent = item.quantity;
            itemTotal.textContent = `${(item.price * item.quantity).toLocaleString()} ₽`;

            // Обновляем общую сумму
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            updateTotalSums(subtotal);
        }
    }

    // Функция настройки элементов управления корзиной
    function setupCartControls() {
        // Обработчики для кнопок изменения количества
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const isPlus = e.target.classList.contains('plus');
                
                if (isPlus) {
                    cart[index].quantity++;
                } else if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartItem(index);
                updateCartCount();
            });
        });

        // Обработчики для кнопок удаления
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-item').dataset.index);
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay(); // При удалении обновляем всю корзину
                updateCartCount();
            });
        });
    }

    // Функция обновления счетчика корзины
    function updateCartCount() {
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    // Инициализация корзины
    updateCartDisplay();
    updateCartCount();

    // Обработчик отправки формы заказа
    const orderForm = document.getElementById('checkout-form');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Получаем данные формы
            const formData = new FormData(orderForm);
            const orderData = {
                items: cart,
                customer: Object.fromEntries(formData.entries())
            };

            // Анимация кнопки при отправке
            const submitButton = orderForm.querySelector('.submit-order');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Оформление заказа...';

            try {
                // Имитация отправки заказа
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Очищаем корзину
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
                updateCartCount();

                // Показываем сообщение об успехе
                alert('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');

                // Перенаправляем на главную страницу
                window.location.href = 'index.html';
            } catch (error) {
                alert('Произошла ошибка при оформлении заказа. Попробуйте позже.');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Оформить заказ';
            }
        });
    }
});

// Маска для телефона
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '')
            .match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,4})/);
        
        e.target.value = !x[2] ? x[1] : 
            `+7 (${x[2]}${x[3] ? `) ${x[3]}` : ''}${x[4] ? `-${x[4]}` : ''}`;
    });
} 