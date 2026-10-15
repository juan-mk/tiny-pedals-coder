// INITIALIZATION, DATA LOADING, RENDERING AND EVENTS

const PRODUCTS_URL = "./data/products.json";

const productList = document.querySelector("#productList");
const loadingMessage = document.querySelector("#loadingMessage");
const catalogError = document.querySelector("#catalogError");
const cartItemsList = document.querySelector("#cartItems");
const cartEmptyMessage = document.querySelector("#cartEmptyMessage");
const cartTotal = document.querySelector("#cartTotal");
const cartCount = document.querySelector("#cartCount");
const clearCartButton = document.querySelector("#clearCartButton");
const checkoutButton = document.querySelector("#checkoutButton");

let products = [];

const priceFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// SweetAlert2 with the Tiny Pedals look (black background, white buttons)
const tinyAlert = Swal.mixin({
    background: "#111",
    color: "#fff",
    buttonsStyling: false,
    customClass: {
        confirmButton: "btnPrimary",
        cancelButton: "btnSecondary"
    }
});

function formatPrice(amount) {
    return priceFormatter.format(amount);
}


// PRODUCTS

async function loadProducts() {
    try {
        const response = await fetch(PRODUCTS_URL);

        if (!response.ok) {
            throw new Error(`Could not load products (HTTP ${response.status})`);
        }

        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error(error);
        catalogError.hidden = false;
    } finally {
        loadingMessage.hidden = true;
    }
}

function renderProducts() {
    productList.innerHTML = "";

    products.forEach(({ id, name, price, image }) => {
        const productCard = document.createElement("article");
        productCard.className = "productCard";
        productCard.innerHTML = `
            <img src="${image}" alt="${name}">
            <h3 class="productName">${name}</h3>
            <p class="productPrice">${formatPrice(price)}</p>
            <button class="btnSiri" data-product-id="${id}"><span>Add to cart</span></button>
        `;
        productList.append(productCard);
    });
}


// CART

function createCartItem({ id, name, price, image, quantity }) {
    const cartItem = document.createElement("li");
    cartItem.className = "cartItem";
    cartItem.innerHTML = `
        <img src="${image}" alt="${name}">
        <div class="cartItemInfo">
            <p class="cartItemName">${name}</p>
            <p class="cartItemPrice">${formatPrice(price)} each</p>
        </div>
        <div class="cartItemQuantity">
            <button class="quantityButton" data-action="decrease" data-product-id="${id}"
                aria-label="Decrease quantity" ${quantity === 1 ? "disabled" : ""}>-</button>
            <span>${quantity}</span>
            <button class="quantityButton" data-action="increase" data-product-id="${id}"
                aria-label="Increase quantity">+</button>
        </div>
        <p class="cartItemSubtotal">${formatPrice(price * quantity)}</p>
        <button class="removeButton" data-action="remove" data-product-id="${id}" aria-label="Remove ${name}">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    return cartItem;
}

function renderCart() {
    cartItemsList.innerHTML = "";
    cart.forEach((item) => cartItemsList.append(createCartItem(item)));

    const isCartEmpty = cart.length === 0;
    cartEmptyMessage.hidden = !isCartEmpty;
    clearCartButton.disabled = isCartEmpty;
    checkoutButton.disabled = isCartEmpty;

    cartTotal.textContent = formatPrice(getCartTotal());
    cartCount.textContent = getCartCount();
}


// EVENTS

productList.addEventListener("click", (event) => {
    const addButton = event.target.closest("button[data-product-id]");
    if (!addButton) return;

    const selectedProduct = products.find((product) => product.id === Number(addButton.dataset.productId));
    addToCart(selectedProduct);
    renderCart();

    tinyAlert.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${selectedProduct.name} added to cart`,
        showConfirmButton: false,
        timer: 1500
    });
});

cartItemsList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) return;

    const { action, productId } = actionButton.dataset;
    const id = Number(productId);

    if (action === "increase") changeQuantity(id, 1);
    if (action === "decrease") changeQuantity(id, -1);
    if (action === "remove") removeFromCart(id);

    renderCart();
});

clearCartButton.addEventListener("click", async () => {
    const { isConfirmed } = await tinyAlert.fire({
        icon: "warning",
        title: "Empty your cart?",
        text: "All the pedals in your cart will be removed.",
        showCancelButton: true,
        confirmButtonText: "Empty cart",
        cancelButtonText: "Cancel"
    });

    if (isConfirmed) {
        clearCart();
        renderCart();
    }
});

checkoutButton.addEventListener("click", async () => {
    const pedalCount = getCartCount();

    // Checkout form: buyer data
    const { value: buyer } = await tinyAlert.fire({
        title: "Confirm your purchase",
        html: `
            <p>${pedalCount} ${pedalCount === 1 ? "pedal" : "pedals"} for a total of ${formatPrice(getCartTotal())}.</p>
            <input id="buyerName" class="swal2-input" placeholder="Enter your name">
            <input id="buyerEmail" class="swal2-input" type="email" placeholder="Enter your email">
            <input id="buyerAddress" class="swal2-input" placeholder="Enter your address">
        `,
        customClass: {
            popup: "checkoutPopup",
            confirmButton: "btnPrimary",
            cancelButton: "btnSecondary"
        },
        showCancelButton: true,
        confirmButtonText: "Confirm purchase",
        cancelButtonText: "Keep shopping",
        preConfirm: () => {
            const name = document.querySelector("#buyerName").value.trim();
            const email = document.querySelector("#buyerEmail").value.trim();
            const address = document.querySelector("#buyerAddress").value.trim();

            if (!name || !email.includes("@") || !address) {
                Swal.showValidationMessage("Please enter your name, a valid email and your address.");
                return false;
            }

            return { name, email, address };
        }
    });

    if (!buyer) return;

    clearCart();
    renderCart();

    tinyAlert.fire({
        icon: "success",
        title: `Thank you, ${buyer.name}!`,
        text: `Your pedals will be shipped to ${buyer.address}. We sent the receipt to ${buyer.email}.`,
        confirmButtonText: "Close",
        customClass: {
            popup: "checkoutPopup",
            confirmButton: "btnPrimary"
        }
    });
});


// INIT

renderCart();
loadProducts();
