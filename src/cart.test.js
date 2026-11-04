import {
    addToCart,
    clearCart,
    getCartCount,
    getCartItems,
    setCartItems,
    CART_CHANGE_EVENT,
} from './cart';

describe('shopping cart', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    test('adds products, increments duplicates, and notifies the header', () => {
        const handleCartChange = jest.fn();
        window.addEventListener(CART_CHANGE_EVENT, handleCartChange);

        addToCart({ title: 'Elite', price: 49 });
        addToCart({ title: 'Elite', price: 49 });
        addToCart({ title: 'Pack Utilidad', price: 49 });

        expect(getCartItems()).toEqual([
            { title: 'Elite', price: 49, quantity: 2 },
            { title: 'Pack Utilidad', price: 49, quantity: 1 },
        ]);
        expect(getCartCount()).toBe(3);
        expect(handleCartChange).toHaveBeenCalledTimes(3);

        window.removeEventListener(CART_CHANGE_EVENT, handleCartChange);
    });

    test('rejects products with invalid data', () => {
        expect(() => addToCart({ title: '', price: 49 })).toThrow();
        expect(() => addToCart({ title: 'Elite', price: -1 })).toThrow();
        expect(getCartCount()).toBe(0);
    });

    test('replaces and clears cart items while notifying the header', () => {
        const handleCartChange = jest.fn();
        window.addEventListener(CART_CHANGE_EVENT, handleCartChange);

        setCartItems([{ title: 'Dios', price: 99, quantity: 2 }]);
        expect(getCartItems()).toEqual([{ title: 'Dios', price: 99, quantity: 2 }]);
        expect(getCartCount()).toBe(2);

        clearCart();
        expect(getCartItems()).toEqual([]);
        expect(getCartCount()).toBe(0);
        expect(handleCartChange).toHaveBeenCalledTimes(2);

        window.removeEventListener(CART_CHANGE_EVENT, handleCartChange);
    });
});
