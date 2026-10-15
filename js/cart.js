const CART_STORAGE_KEY = "tinyPedalsCart";

let cart = loadCart();

function loadCart() {
    try {
        
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function findCartItem(productId) {
    return cart.find((item) => item.id === productId);
}

function addToCart(product) {
    const { id, name, price, image } = product;
    const cartItem = findCartItem(id);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }

    saveCart();
}

function changeQuantity(productId, amount) {
    const cartItem = findCartItem(productId);

    cartItem.quantity = Math.max(1, cartItem.quantity + amount);
    saveCart();
}

function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
}

function clearCart() {
    cart = [];
    localStorage.removeItem(CART_STORAGE_KEY);
}

function getCartTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}
