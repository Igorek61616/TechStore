// Получаем сохранённую корзину.
// Если корзины ещё нет, используем пустой массив.
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// Находим элементы на текущей странице.
// На некоторых страницах этих элементов может не быть.
const cartCount = document.getElementById("cart-count");
const cartList = document.getElementById("cart-list");
const totalPrice = document.getElementById("total-price");

const checkoutButton = document.getElementById("checkout");
const orderForm = document.getElementById("order-form");
const confirmOrderButton = document.getElementById("confirm-order");
const clearCartButton = document.getElementById("clear-cart");

const profileOrder = document.getElementById("profile-order");


// Находим все кнопки добавления товара в корзину.
const addToCartButtons =
    document.querySelectorAll(".card .add-to-cart");

function showToast(message, type = "success") {

    const container =
        document.getElementById("toast-container");

    if (!container) {
        return;
    }

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    toast.innerHTML = `
        <span class="toast-icon">
            ${type === "error" ? "!" : "✓"}
        </span>

        <div class="toast-content">
            <strong>Готово</strong>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.add("show");
    });

    setTimeout(function () {

        toast.classList.remove("show");

        setTimeout(function () {
            toast.remove();
        }, 300);

    }, 2300);

}

addToCartButtons.forEach(function (button) {

    const card = button.closest(".card");

    const productId = card.dataset.id;

    const initialStock = Number(card.dataset.stock);

    const stockCount = card.querySelector(".stock-count");


    // Получаем сохранённый остаток товара.
    // Если его ещё нет, используем число из HTML.
    let currentStock = localStorage.getItem(
        `stock-${productId}`
    );


    if (currentStock === null) {

        currentStock = initialStock;

    } else {

        currentStock = Number(currentStock);

    }


    updateStockDisplay(
        button,
        stockCount,
        currentStock
    );


    button.addEventListener("click", function () {

        let availableStock = Number(
            localStorage.getItem(`stock-${productId}`)
        );


        // Если остаток ещё не сохранялся,
        // берём начальное количество из карточки.
        if (
            localStorage.getItem(`stock-${productId}`) === null
        ) {

            availableStock = initialStock;

        }


        if (availableStock <= 0) {

    showToast(
        `Товар «${card.querySelector("h3").textContent}» закончился`,
        "error"
    );

    return;
}

        const productName =
            card.querySelector("h3").textContent;

        const productPrice = Number(
            card
                .querySelector(".product-price")
                .textContent
                .replace(/\D/g, "")
        );


        const productImage = card
    .querySelector(".product-image img")
    .getAttribute("src");

const existingProduct = cart.find(
    item =>
        item.id === productId ||
        item.name === productName
);

if (existingProduct) {

    existingProduct.quantity++;

    existingProduct.id = productId;

    // Добавляем изображение старому товару,
    // если раньше оно не сохранялось.
    existingProduct.image = productImage;

} else {

    cart.push({

        id: productId,

        name: productName,

        price: productPrice,

        image: productImage,

        quantity: 1

    });

}

availableStock--;


        localStorage.setItem(
            `stock-${productId}`,
            availableStock
        );


        updateStockDisplay(
            button,
            stockCount,
            availableStock
        );


        saveCart();
        renderCart();

        showToast(
    `«${productName}» добавлен в корзину`
);

        updateStockDisplay(
    button,
    stockCount,
    availableStock
);

button.classList.add("button-clicked");

setTimeout(function () {

    button.classList.remove("button-clicked");

}, 250);

    });

});

function updateStockDisplay(
    button,
    stockCount,
    availableStock
) {

    const card = button.closest(".card");

    stockCount.textContent = availableStock;

    if (availableStock <= 0) {

        button.textContent = "Товар закончился";
        button.classList.add("sold-out");
        button.disabled = true;

        if (card) {
            card.classList.add("out-of-stock");
        }

    } else {

        button.textContent = "Добавить в корзину";
        button.classList.remove("sold-out");
        button.disabled = false;

        if (card) {
            card.classList.remove("out-of-stock");
        }

    }

}


// Сохраняет корзину в браузере.
function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// Обновляет счётчик возле корзины.
function updateCartCount() {

    if (!cartCount) {
        return;
    }


    let totalCount = 0;


    cart.forEach(item => {
        totalCount += item.quantity;
    });


    cartCount.textContent = totalCount;

}


// Отображает товары на странице корзины.
function renderCart() {

    updateCartCount();


    // Если мы не на странице корзины,
    // дальше выполнять функцию не нужно.
    if (!cartList || !totalPrice) {
        return;
    }


    cartList.innerHTML = "";


    let total = 0;


    if (cart.length === 0) {

    cartList.innerHTML = `
        <li class="empty-cart">

            <div class="empty-cart-content">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h3>
                    Корзина пуста
                </h3>

                <p>
                    Добавьте товары из каталога,
                    чтобы оформить заказ
                </p>

                <a
                    href="index.html#catalog"
                    class="empty-cart-button"
                >
                    Перейти к покупкам
                </a>

            </div>

        </li>
    `;

    totalPrice.textContent = "0";

    return;
}


    cart.forEach(function (item, index) {

        total += item.price * item.quantity;


        const li = document.createElement("li");

        li.innerHTML = `
    <div class="cart-product">

        <div class="cart-product-image">
            <img
                src="${item.image || "favicon.png"}"
                alt="${item.name}"
            >
        </div>

        <div class="cart-product-info">
            <strong>${item.name}</strong>

            <span>
                ${item.price.toLocaleString("ru-RU")} ₽
            </span>
        </div>

    </div>

    <div class="cart-product-controls">

        <button onclick="minus(${index})">
            −
        </button>

        <span>${item.quantity}</span>

        <button onclick="plus(${index})">
            +
        </button>

        <button
            class="remove-button"
            onclick="removeItem(${index})"
        >
            Удалить
        </button>

    </div>
`;


        cartList.appendChild(li);

    });


    totalPrice.textContent = total.toLocaleString("ru-RU");

}

function returnProductToStock(item, quantity) {

    let productId = item.id;


    // Поддержка старых товаров,
    // которые были сохранены без id.
    if (!productId) {

        if (item.name === "ASUS TUF Gaming") {
            productId = "asus-tuf";
        }

        if (item.name === "Lenovo Legion") {
            productId = "lenovo-legion";
        }

        if (item.name === "MacBook Air M4") {
            productId = "macbook-air-m4";
        }

    }


    if (!productId) {
        return;
    }


    const stockKey = `stock-${productId}`;

    let currentStock = Number(
        localStorage.getItem(stockKey)
    );


    if (localStorage.getItem(stockKey) === null) {
        currentStock = 0;
    }


    currentStock += quantity;


    localStorage.setItem(
        stockKey,
        currentStock
    );

}

// Увеличивает количество товара.
function plus(index) {

    const item = cart[index];

    let productId = item.id;

    if (!productId) {

        if (item.name === "ASUS TUF Gaming") {
            productId = "asus-tuf";
        }

        if (item.name === "Lenovo Legion") {
            productId = "lenovo-legion";
        }

        if (item.name === "MacBook Air M4") {
            productId = "macbook-air-m4";
        }

    }

    if (!productId) {
        return;
    }

    const stockKey = `stock-${productId}`;

    let currentStock = Number(
        localStorage.getItem(stockKey)
    );

    if (localStorage.getItem(stockKey) === null) {
        currentStock = 0;
    }

    if (currentStock <= 0) {

        alert("Больше товара на складе нет");

        return;

    }

    item.quantity++;

    localStorage.setItem(
        stockKey,
        currentStock - 1
    );

    saveCart();
    renderCart();

}


// Уменьшает количество товара.
function minus(index) {

    const item = cart[index];


    // Возвращаем одну штуку обратно на склад.
    returnProductToStock(item, 1);


    if (item.quantity > 1) {

        item.quantity--;

    } else {

        cart.splice(index, 1);

    }


    saveCart();
    renderCart();

}

// Полностью удаляет товар.
function removeItem(index) {

    const item = cart[index];


    // При полном удалении возвращаем на склад
    // всё количество этого товара из корзины.
    returnProductToStock(
        item,
        item.quantity
    );


    cart.splice(index, 1);


    saveCart();
    renderCart();

}

// Кнопка «Очистить корзину».
if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
        if (cart.length === 0) {
            alert("Корзина уже пустая");
            return;
        }

        const shouldClear = confirm(
            "Вы точно хотите очистить корзину?"
        );

        if (!shouldClear) {
            return;
        }

        cart.forEach(function (item) {
            returnProductToStock(item, item.quantity);
        });

        cart = [];

        saveCart();
        renderCart();
    });
}

// Кнопка «Оформить заказ».
if (checkoutButton && orderForm) {

    checkoutButton.addEventListener("click", function () {

        if (cart.length === 0) {

            alert("Корзина пустая");

            return;

        }


        orderForm.style.display = "block";

        orderForm.scrollIntoView({
            behavior: "smooth"
        });

    });

}


// Кнопка подтверждения заказа.
if (confirmOrderButton) {

    confirmOrderButton.addEventListener("click", function () {

        const nameInput = document.getElementById("name");
        const phoneInput = document.getElementById("phone");
        const addressInput = document.getElementById("address");


        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = addressInput.value.trim();


        if (!name || !phone || !address) {

            alert("Заполните все поля");

            return;

        }


        let total = 0;


        cart.forEach(item => {

            total += item.price * item.quantity;

        });


        const orderNumber =
            Math.floor(Math.random() * 9000) + 1000;


        const order = {

            id: orderNumber,

            name: name,

            phone: phone,

            address: address,

            total: total,

            status: "Ожидает обработки",

            date: new Date().toLocaleDateString("ru-RU")

        };

            let orders = JSON.parse(
                localStorage.getItem("orders")
                    ) || [];

            orders.push(order);

            localStorage.setItem(
            "orders",
            JSON.stringify(orders)
        );

        alert(
            `Заказ №${orderNumber} оформлен!\n` +
            `Сумма: ${total.toLocaleString("ru-RU")} ₽`
        );


        cart = [];

        saveCart();
        renderCart();


        orderForm.style.display = "none";

        nameInput.value = "";
        phoneInput.value = "";
        addressInput.value = "";

    });

}


// Показывает последний заказ в профиле.
if (profileOrder) {
    const orders = JSON.parse(
        localStorage.getItem("orders")
    ) || [];

    if (orders.length === 0) {
        profileOrder.innerHTML = `
            <p>У вас пока нет заказов.</p>
        `;
    } else {
        profileOrder.innerHTML = "";

        const reversedOrders = [...orders].reverse();

        reversedOrders.forEach(function (order) {
            const orderCard = document.createElement("div");

            orderCard.classList.add("profile-order-card");

            orderCard.innerHTML = `
                <p>
                    <strong>Заказ №${order.id}</strong>
                </p>

                <p>
                    Дата: ${order.date}
                </p>

                <p>
                    Сумма:
                    ${order.total.toLocaleString("ru-RU")} ₽
                </p>

                <p>
                    Статус: ${order.status}
                </p>
            `;

            profileOrder.appendChild(orderCard);
        });
    }
}


// Запускаем отображение корзины после загрузки страницы.
renderCart();

const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document
            .getElementById("register-name")
            .value
            .trim();

        const email = document
            .getElementById("register-email")
            .value
            .trim();

        const password = document
            .getElementById("register-password")
            .value;

        const passwordRepeat = document
            .getElementById("register-password-repeat")
            .value;

        const error = document.getElementById("register-error");

        error.textContent = "";

        if (password !== passwordRepeat) {
            error.textContent = "Пароли не совпадают";
            return;
        }

        const user = {
            name: name,
            email: email,
            password: password
        };

        localStorage.setItem("techstore-user", JSON.stringify(user));
        localStorage.setItem("techstore-auth", "true");

        window.location.href = "index.html";
    });
}

const profileLink = document.getElementById("profile-link");
const profileText = document.getElementById("profile-text");

const isAuthorized = localStorage.getItem("techstore-auth") === "true";

if (profileLink && profileText) {
    if (isAuthorized) {
        profileLink.href = "profile.html";
        profileText.textContent = "Профиль";
    } else {
        profileLink.href = "login.html";
        profileText.textContent = "Войти";
    }
}

const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const logoutButton = document.getElementById("logout-button");

if (profileName && profileEmail) {
    const savedUser = JSON.parse(
        localStorage.getItem("techstore-user")
    );

    const isAuthorized =
        localStorage.getItem("techstore-auth") === "true";

    if (!savedUser || !isAuthorized) {
        window.location.href = "login.html";
    } else {
        profileName.textContent = savedUser.name;
        profileEmail.textContent = savedUser.email;
    }
}

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.setItem("techstore-auth", "false");

        window.location.href = "index.html";
    });
}

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document
            .getElementById("login-email")
            .value
            .trim();

        const password = document
            .getElementById("login-password")
            .value;

        const error = document.getElementById("login-error");

        const savedUser = JSON.parse(
            localStorage.getItem("techstore-user")
        );

        error.textContent = "";

        if (!savedUser) {
            error.textContent = "Пользователь не найден";
            return;
        }

        if (
            email !== savedUser.email ||
            password !== savedUser.password
        ) {
            error.textContent = "Неверная почта или пароль";
            return;
        }

        localStorage.setItem("techstore-auth", "true");

        window.location.href = "index.html";
    });
}

const searchForm = document.getElementById("header-search");
const searchInput = document.getElementById("header-search-input");
const productCards = document.querySelectorAll(".card");

if (searchForm && searchInput && productCards.length > 0) {

    function filterProducts() {

        const searchText = searchInput.value
            .trim()
            .toLowerCase();

        let visibleProducts = 0;

        productCards.forEach(function (card) {

            const productName = card
                .querySelector("h3")
                .textContent
                .toLowerCase();

            if (productName.includes(searchText)) {

                card.style.display = "flex";
                visibleProducts++;

            } else {

                card.style.display = "none";

            }

        });

        updateSearchMessage(visibleProducts, searchText);
    }

    searchInput.addEventListener("input", filterProducts);

    searchForm.addEventListener("submit", function (event) {

        event.preventDefault();

        filterProducts();

        const catalog = document.getElementById("catalog");

        if (catalog) {

            catalog.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}

function updateSearchMessage(visibleProducts, searchText) {

    const productsSection = document.getElementById("catalog");

    if (!productsSection) {
        return;
    }

    let message = document.getElementById("search-empty-message");

    if (!message) {

        message = document.createElement("div");

        message.id = "search-empty-message";

        productsSection.insertAdjacentElement(
            "afterend",
            message
        );

    }

    if (visibleProducts === 0 && searchText !== "") {

        message.innerHTML = `
            <div class="search-empty">
                <div class="search-empty-icon">🔎</div>

                <h3>Ничего не найдено</h3>

                <p>
                    Попробуйте изменить поисковый запрос
                </p>
            </div>
        `;

        message.style.display = "block";

    } else {

        message.style.display = "none";

    }

}

const sortProductsSelect =
    document.getElementById("sort-products");

const onlyInStockCheckbox =
    document.getElementById("only-in-stock");

const productsContainer =
    document.getElementById("catalog");

    const categoryButtons =
    document.querySelectorAll(".category");

let activeCategory = "all";

if (
    sortProductsSelect &&
    onlyInStockCheckbox &&
    productsContainer
) {

    function updateCatalog() {

        const cards = Array.from(
            productsContainer.querySelectorAll(".card")
        );

        const searchText = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const onlyInStock = onlyInStockCheckbox.checked;

        cards.forEach(function (card) {

            const productName = card
                .querySelector("h3")
                .textContent
                .toLowerCase();

            const productId = card.dataset.id;

            let stock = localStorage.getItem(
                `stock-${productId}`
            );

            if (stock === null) {
                stock = Number(card.dataset.stock);
            } else {
                stock = Number(stock);
            }

            const productCategory =
    card.dataset.category;

const matchesSearch =
    productName.includes(searchText);

const matchesStock =
    !onlyInStock || stock > 0;

const matchesCategory =
    activeCategory === "all" ||
    productCategory === activeCategory;

if (
    matchesSearch &&
    matchesStock &&
    matchesCategory
) {
    card.style.display = "flex";
} else {
    card.style.display = "none";
}

        });

        sortCatalogCards(cards);
        updateCatalogMessage(cards);

    }

    function sortCatalogCards(cards) {

        const sortValue = sortProductsSelect.value;

        cards.sort(function (cardA, cardB) {

            const nameA = cardA
                .querySelector("h3")
                .textContent
                .trim();

            const nameB = cardB
                .querySelector("h3")
                .textContent
                .trim();

            const priceA = Number(
                cardA
                    .querySelector(".product-price")
                    .textContent
                    .replace(/\D/g, "")
            );

            const priceB = Number(
                cardB
                    .querySelector(".product-price")
                    .textContent
                    .replace(/\D/g, "")
            );

            if (sortValue === "price-asc") {
                return priceA - priceB;
            }

            if (sortValue === "price-desc") {
                return priceB - priceA;
            }

            if (sortValue === "name-asc") {
                return nameA.localeCompare(
                    nameB,
                    "ru"
                );
            }

            return 0;

        });

        cards.forEach(function (card) {
            productsContainer.appendChild(card);
        });

    }

    function updateCatalogMessage(cards) {

        let visibleCards = 0;

        cards.forEach(function (card) {

            if (card.style.display !== "none") {
                visibleCards++;
            }

        });

        const searchText = searchInput
            ? searchInput.value.trim()
            : "";

        updateSearchMessage(
            visibleCards,
            searchText
        );

    }

    sortProductsSelect.addEventListener(
        "change",
        updateCatalog
    );

    onlyInStockCheckbox.addEventListener(
        "change",
        updateCatalog
    );

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            updateCatalog
        );
    }

    categoryButtons.forEach(function (categoryButton) {

    categoryButton.addEventListener(
        "click",
        function () {

            const selectedCategory =
                categoryButton.dataset.category;

            if (activeCategory === selectedCategory) {

                activeCategory = "all";

                categoryButton.classList.remove(
                    "active"
                );

            } else {

                activeCategory = selectedCategory;

                categoryButtons.forEach(
                    function (button) {

                        button.classList.remove(
                            "active"
                        );

                    }
                );

                categoryButton.classList.add(
                    "active"
                );

            }

            updateCatalog();

            const catalog =
                document.getElementById("catalog");

            if (catalog) {

                catalog.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

});

}

const productCardsForLinks =
    document.querySelectorAll(".card");

productCardsForLinks.forEach(function (card) {

    const image = card.querySelector(".product-image");
    const title = card.querySelector("h3");

    function openProductPage() {

        const productData = {
            id: card.dataset.id,
            category: card.dataset.category,
            stock: card.dataset.stock,
            name: title.textContent.trim(),
            price: card
                .querySelector(".product-price")
                .textContent
                .replace(/\D/g, ""),
            image: card
                .querySelector(".product-image img")
                .getAttribute("src")
        };

        localStorage.setItem(
            "selected-product",
            JSON.stringify(productData)
        );

        window.location.href = "product.html";
    }

    if (image) {
        image.style.cursor = "pointer";
        image.addEventListener("click", openProductPage);
    }

    if (title) {
        title.style.cursor = "pointer";
        title.addEventListener("click", openProductPage);
    }

});

const productPageName =
    document.getElementById("product-page-name");

const productPagePrice =
    document.getElementById("product-page-price");

const productPageImage =
    document.getElementById("product-page-image");

const productPageCategory =
    document.getElementById("product-page-category");

const productPageStock =
    document.getElementById("product-page-stock");

const productPageCartButton =
    document.getElementById("product-page-cart-button");


if (
    productPageName &&
    productPagePrice &&
    productPageImage &&
    productPageCategory &&
    productPageStock &&
    productPageCartButton
) {

    const selectedProduct = JSON.parse(
        localStorage.getItem("selected-product")
    );

    if (!selectedProduct) {

        window.location.href = "index.html";

    } else {

        const stockKey =
            `stock-${selectedProduct.id}`;

        let actualStock =
            localStorage.getItem(stockKey);

        if (actualStock === null) {
            actualStock = Number(
                selectedProduct.stock
            );
        } else {
            actualStock = Number(actualStock);
        }

        const categoryNames = {
            laptops: "Ноутбуки",
            monitors: "Мониторы",
            keyboards: "Клавиатуры",
            mice: "Мыши",
            headphones: "Наушники",
            games: "Игры"
        };

        productPageName.textContent =
            selectedProduct.name;

        productPagePrice.textContent =
            Number(selectedProduct.price)
                .toLocaleString("ru-RU") + " ₽";

        productPageImage.src =
            selectedProduct.image;

        productPageImage.alt =
            selectedProduct.name;

        productPageCategory.textContent =
            categoryNames[selectedProduct.category]
            || "Товар";

        productPageStock.textContent =
            actualStock;

        if (actualStock <= 0) {

            productPageCartButton.textContent =
                "Товар закончился";

            productPageCartButton.disabled = true;

            productPageCartButton.classList.add(
                "sold-out"
            );

        }

        productPageCartButton.addEventListener(
            "click",
            function () {

                let currentStock = Number(
                    localStorage.getItem(stockKey)
                );

                if (
                    localStorage.getItem(stockKey)
                    === null
                ) {
                    currentStock = Number(
                        selectedProduct.stock
                    );
                }

                if (currentStock <= 0) {
                    return;
                }

                const existingProduct = cart.find(
                    item =>
                        item.id === selectedProduct.id
                );

                if (existingProduct) {

                    existingProduct.quantity++;

                } else {

                    cart.push({
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        price: Number(
                            selectedProduct.price
                        ),
                        image: selectedProduct.image,
                        quantity: 1
                    });

                }

                currentStock--;

                localStorage.setItem(
                    stockKey,
                    currentStock
                );

                saveCart();
                updateCartCount();

                productPageStock.textContent =
                    currentStock;

                showToast(
                    `«${selectedProduct.name}» добавлен в корзину`
                );

                if (currentStock <= 0) {

                    productPageCartButton.textContent =
                        "Товар закончился";

                    productPageCartButton.disabled = true;

                    productPageCartButton.classList.add(
                        "sold-out"
                    );

                }

            }
        );

    }

}

/* =========================================================
   ИЗБРАННОЕ
========================================================= */

const favoriteButtons =
    document.querySelectorAll(".favorite-button");

let favorites = JSON.parse(
    localStorage.getItem("favorites")
) || [];

favoriteButtons.forEach((button) => {

    const card = button.closest(".card");

    if (!card) return;

    const productId = card.dataset.id;

    if (favorites.includes(productId)) {

        button.classList.add("active");
        button.textContent = "❤️";

    }

    button.addEventListener("click", (event) => {

        event.stopPropagation();

        if (favorites.includes(productId)) {

            favorites = favorites.filter(
                id => id !== productId
            );

            button.classList.remove("active");
            button.textContent = "🤍";

        } else {

            favorites.push(productId);

            button.classList.add("active");
            button.textContent = "❤️";

        }

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

    });

});