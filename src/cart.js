const CART_STORAGE_KEY = 'zuriland_carrito';
export const CART_CHANGE_EVENT = 'zuriland-cart-change';

export function getCartItems() {
    const storedItems = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!storedItems) {
        return [];
    }

    try {
        const items = JSON.parse(storedItems);
        if (!Array.isArray(items)) {
            throw new Error('El carrito guardado no tiene un formato válido.');
        }
        return items;
    } catch (error) {
        console.error('No se pudo leer el carrito:', error);
        sessionStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
}

export function getCartCount() {
    return getCartItems().reduce((count, item) => {
        const quantity = Number.isInteger(item?.quantity) && item.quantity > 0 ? item.quantity : 0;
        return count + quantity;
    }, 0);
}

export function addToCart(product) {
    if (
        typeof product?.title !== 'string'
        || !product.title.trim()
        || !Number.isFinite(product.price)
        || product.price < 0
    ) {
        throw new Error('El producto no tiene datos válidos para agregar al carrito.');
    }

    const items = getCartItems();
    const existingItem = items.find((item) => item.title === product.title);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        items.push({
            title: product.title,
            price: product.price,
            quantity: 1,
        });
    }

    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}
