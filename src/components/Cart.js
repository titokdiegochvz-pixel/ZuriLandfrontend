import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config/api';
import { clearCart, getCartItems, setCartItems, CART_CHANGE_EVENT } from '../cart';
import './Cart.css';

function CartIcon({ name }) {
    if (name === 'remove') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 4h2l2.2 11h11.5l2-8H6" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="17" cy="19" r="1.5" />
        </svg>
    );
}

const Cart = () => {
    const [items, setItems] = useState(getCartItems);
    const [checkoutMessage, setCheckoutMessage] = useState('');
    const [checkoutPending, setCheckoutPending] = useState(false);
    const [checkoutMethod, setCheckoutMethod] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const captureStarted = useRef(false);

    useEffect(() => {
        const syncItems = () => setItems(getCartItems());
        window.addEventListener(CART_CHANGE_EVENT, syncItems);
        return () => window.removeEventListener(CART_CHANGE_EVENT, syncItems);
    }, []);

    useEffect(() => {
        const paypalStatus = searchParams.get('paypal');
        const orderId = searchParams.get('token');

        if (paypalStatus === 'cancelled') {
            setCheckoutMessage('El pago fue cancelado. Tus productos siguen en el carrito.');
            setSearchParams({}, { replace: true });
            return;
        }

        if (paypalStatus !== 'success' || !orderId || captureStarted.current) {
            return;
        }

        captureStarted.current = true;
        setCheckoutPending(true);
        fetch(`${API_URL}/api/paypal/orders/${encodeURIComponent(orderId)}/capture`, {
            method: 'POST',
            headers: { Accept: 'application/json' },
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok || data.status !== 'COMPLETED') {
                    throw new Error(data.message || 'PayPal no confirmó el pago.');
                }

                clearCart();
                setItems([]);
                setCheckoutMessage(`Pago confirmado para ${data.title}.`);
                setSearchParams({}, { replace: true });
            })
            .catch((error) => {
                console.error('Error al confirmar el pago de PayPal:', error);
                setCheckoutMessage(error.message || 'No se pudo confirmar el pago.');
            })
            .finally(() => setCheckoutPending(false));
    }, [searchParams, setSearchParams]);

    const updateQuantity = (title, difference) => {
        const nextItems = items
            .map((item) => item.title === title
                ? { ...item, quantity: item.quantity + difference }
                : item)
            .filter((item) => item.quantity > 0);
        setCartItems(nextItems);
        setItems(nextItems);
    };

    const removeItem = (title) => {
        const nextItems = items.filter((item) => item.title !== title);
        setCartItems(nextItems);
        setItems(nextItems);
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const startCheckout = async ({ method, endpoint, payload, responseUrl, errorMessage }) => {
        setCheckoutMessage('');
        setCheckoutPending(true);
        setCheckoutMethod(method);

        try {
            if (!API_URL) {
                throw new Error('La tienda no está conectada al servidor de pagos. Inténtalo más tarde.');
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok || !data[responseUrl]) {
                throw new Error(data.message || errorMessage);
            }

            window.location.assign(data[responseUrl]);
        } catch (error) {
            console.error(`Error al iniciar el pago ${method} del carrito:`, error);
            setCheckoutMessage(error.message || errorMessage);
            setCheckoutPending(false);
            setCheckoutMethod('');
        }
    };

    const checkoutWithPayPal = () => startCheckout({
        method: 'con PayPal',
        endpoint: '/api/paypal/orders',
        payload: { items: items.map(({ title, quantity }) => ({ title, quantity })) },
        responseUrl: 'approval_url',
        errorMessage: 'No se pudo iniciar el pago con PayPal. Inténtalo de nuevo.',
    });

    const checkoutWithCard = () => startCheckout({
        method: 'con tarjeta',
        endpoint: '/api/create-checkout-session',
        payload: { items: items.map(({ title, quantity }) => ({ title, quantity })) },
        responseUrl: 'url',
        errorMessage: 'No se pudo iniciar el pago con tarjeta. Inténtalo de nuevo.',
    });

    return (
        <section className="cart-page" aria-labelledby="cart-title">
            <header className="cart-heading">
                <div className="cart-heading-icon" aria-hidden="true">
                    <CartIcon />
                </div>
                <h1 id="cart-title">Tu carrito</h1>
                <p>Revisa tus productos antes de continuar con el pago.</p>
            </header>

            {checkoutMessage && (
                <p className="cart-message" role="status">{checkoutMessage}</p>
            )}

            {items.length === 0 ? (
                <div className="cart-empty">
                    <p>Tu carrito está vacío.</p>
                    <Link to="/store" className="cart-primary-button">Ir a la tienda</Link>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-list">
                        {items.map((item) => (
                            <article className="cart-item" key={item.title}>
                                <div className="cart-item-details">
                                    <h2>{item.title}</h2>
                                    <p>${item.price} MXN por unidad</p>
                                </div>
                                <div className="cart-item-quantity" aria-label={`Cantidad de ${item.title}`}>
                                    <button
                                        type="button"
                                        aria-label={`Disminuir cantidad de ${item.title}`}
                                        onClick={() => updateQuantity(item.title, -1)}
                                    >
                                        −
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        type="button"
                                        aria-label={`Aumentar cantidad de ${item.title}`}
                                        onClick={() => updateQuantity(item.title, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <strong className="cart-item-subtotal">
                                    ${(item.price * item.quantity).toLocaleString('es-MX')} MXN
                                </strong>
                                <button
                                    type="button"
                                    className="cart-remove-button"
                                    aria-label={`Quitar ${item.title}`}
                                    onClick={() => removeItem(item.title)}
                                >
                                    <CartIcon name="remove" />
                                </button>
                            </article>
                        ))}
                    </div>

                    <aside className="cart-summary" aria-label="Resumen de compra">
                        <div className="cart-summary-total">
                            <span>Total</span>
                            <strong>${total.toLocaleString('es-MX')} MXN</strong>
                        </div>
                        <button
                            type="button"
                            className="cart-primary-button cart-checkout-button"
                            onClick={checkoutWithPayPal}
                            disabled={checkoutPending}
                        >
                            {checkoutPending && checkoutMethod === 'con PayPal' ? 'Conectando con PayPal…' : 'Pagar con PayPal'}
                        </button>
                        <button
                            type="button"
                            className="cart-card-button"
                            onClick={checkoutWithCard}
                            disabled={checkoutPending}
                        >
                            {checkoutPending && checkoutMethod === 'con tarjeta' ? (
                                'Conectando con el pago…'
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                        <path d="M3 10h18m-14 5h4" />
                                    </svg>
                                    Pagar con tarjeta
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="cart-clear-button"
                            onClick={() => {
                                clearCart();
                                setItems([]);
                            }}
                            disabled={checkoutPending}
                        >
                            Vaciar carrito
                        </button>
                        <Link to="/store" className="cart-continue-link">Seguir comprando</Link>
                    </aside>
                </div>
            )}
        </section>
    );
};

export default Cart;
