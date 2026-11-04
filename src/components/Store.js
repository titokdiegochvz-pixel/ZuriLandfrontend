import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../config/api';
import './Store.css';

const categories = [
    { id: 'rangos', label: 'Rangos', icon: 'crown' },
    { id: 'cosmeticos', label: 'Cosméticos', icon: 'shirt' },
    { id: 'comandos', label: 'Comandos', icon: 'command' },
];

const dataTienda = {
    rangos: [
        { titulo: 'Elite', precio: 49, desc: 'Kit hierro' },
        { titulo: 'Dios', precio: 99, desc: 'Kit diamante' },
        { titulo: 'Leyenda', precio: 199, desc: 'Kit Netherite' },
    ],
    cosmeticos: [],
    comandos: [
        { titulo: 'Pack Utilidad', precio: 49, desc: '/feed (10m), /heal (15m), /fix (uso único), /enderchest' },
        { titulo: 'Pack Maestro', precio: 149, desc: '/heal ilimitado, /feed ilimitado, /fix ilimitado, /nick, 10 slots /sethome' },
    ],
};

function CategoryIcon({ name }) {
    if (name === 'crown') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m3 8 4.5 3L12 4l4.5 7L21 8l-2 11H5L3 8Z" />
                <path d="M5 16h14" />
            </svg>
        );
    }

    if (name === 'shirt') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 4-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-.7 1.3-2 2-4 2s-3.3-.7-4-2Z" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <path d="m9 10 2 2-2 2m4 0h3" />
        </svg>
    );
}

function ProductMark({ title }) {
    if (title === 'Elite') {
        return (
            <svg className="store-product-mark store-product-mark-elite" viewBox="0 0 64 68" aria-hidden="true">
                <path d="M32 3 57 13v19c0 15-10 25-25 33C17 57 7 47 7 32V13L32 3Z" />
                <path d="m32 12 16 6v14c0 10-6 17-16 23-10-6-16-13-16-23V18l16-6Z" />
                <path d="m22 34 8-10 14 7-8 11-14-8Z" />
            </svg>
        );
    }

    if (title === 'Dios') {
        return (
            <svg className="store-product-mark store-product-mark-dios" viewBox="0 0 64 68" aria-hidden="true">
                <path d="M32 3 57 13v19c0 15-10 25-25 33C17 57 7 47 7 32V13L32 3Z" />
                <path d="m32 12 16 6v14c0 10-6 17-16 23-10-6-16-13-16-23V18l16-6Z" />
                <path d="m32 20 13 13-13 16-13-16 13-13Z" />
                <path d="m19 33 13-5 13 5M25 40l7-12 7 12" />
            </svg>
        );
    }

    if (title === 'Leyenda') {
        return (
            <svg className="store-product-mark store-product-mark-leyenda" viewBox="0 0 64 68" aria-hidden="true">
                <path d="M32 3 57 13v19c0 15-10 25-25 33C17 57 7 47 7 32V13L32 3Z" />
                <path d="m32 12 16 6v14c0 10-6 17-16 23-10-6-16-13-16-23V18l16-6Z" />
                <path d="m18 27 9 5 5-12 5 12 9-5-4 14H22l-4-14Z" />
                <path d="M25 45h14" />
            </svg>
        );
    }

    return (
        <svg className="store-product-mark store-product-mark-pack" viewBox="0 0 64 68" aria-hidden="true">
            <path d="M32 4 55 17v29L32 60 9 46V17L32 4Z" />
            <path d="m20 27 12-7 12 7v14l-12 7-12-7V27Z" />
            <path d="M20 27 32 34l12-7M32 34v14" />
        </svg>
    );
}

const Store = () => {
    const [categoria, setCategoria] = useState('rangos');
    const [paypalMensaje, setPaypalMensaje] = useState('');
    const [paypalProcesando, setPaypalProcesando] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const captureStarted = useRef(false);

    const comprar = async (titulo, precio) => {
        try {
            const response = await fetch(`${API_URL}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    title: titulo,
                    price: precio,
                }),
            });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.message || data.error || 'Error al crear la sesión de pago.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo conectar con el servidor de pagos.');
        }
    };

    const pagarConPayPal = async (titulo) => {
        setPaypalProcesando(true);
        setPaypalMensaje('');

        try {
            const response = await fetch(`${API_URL}/api/paypal/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ title: titulo }),
            });
            const data = await response.json();

            if (!response.ok || !data.approval_url) {
                throw new Error(data.message || 'No se pudo iniciar el pago con PayPal.');
            }

            window.location.assign(data.approval_url);
        } catch (error) {
            console.error('Error al iniciar el pago con PayPal:', error);
            setPaypalMensaje(error.message || 'No se pudo conectar con PayPal.');
            setPaypalProcesando(false);
        }
    };

    useEffect(() => {
        const paypalStatus = searchParams.get('paypal');
        const orderId = searchParams.get('token');

        if (paypalStatus === 'cancelled') {
            setPaypalMensaje('El pago con PayPal fue cancelado.');
            setSearchParams({}, { replace: true });
            return;
        }

        if (paypalStatus !== 'success' || !orderId || captureStarted.current) {
            return;
        }

        captureStarted.current = true;
        setPaypalProcesando(true);

        fetch(`${API_URL}/api/paypal/orders/${encodeURIComponent(orderId)}/capture`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok || data.status !== 'COMPLETED') {
                    throw new Error(data.message || 'PayPal no confirmó el pago.');
                }
                setPaypalMensaje(`Pago confirmado para ${data.title}.`);
                setSearchParams({}, { replace: true });
            })
            .catch((error) => {
                console.error('Error al confirmar el pago de PayPal:', error);
                setPaypalMensaje(error.message || 'No se pudo confirmar el pago.');
            })
            .finally(() => setPaypalProcesando(false));
    }, [searchParams, setSearchParams]);

    const productos = dataTienda[categoria];

    return (
        <section className="store-page" aria-labelledby="store-title">
            <header className="store-heading">
                <div className="store-heading-icon" aria-hidden="true">
                    <svg viewBox="0 0 40 40">
                        <path d="M5 7h4l4 20h19l4-14H11" />
                        <circle cx="16" cy="33" r="2" />
                        <circle cx="29" cy="33" r="2" />
                        <path d="m18 17 4 4 7-8" />
                    </svg>
                </div>
                <h1 id="store-title">TIENDA <span>ZURILAND</span></h1>
                <p>Mejora tu experiencia en el servidor con rangos, kits y beneficios exclusivos.</p>
            </header>

            <div className="store-category-nav" role="tablist" aria-label="Categorías de la tienda">
                {categories.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        id={`store-tab-${item.id}`}
                        aria-selected={categoria === item.id}
                        aria-controls="store-products"
                        className={categoria === item.id ? 'active' : ''}
                        onClick={() => setCategoria(item.id)}
                    >
                        <CategoryIcon name={item.icon} />
                        {item.label}
                    </button>
                ))}
            </div>

            {paypalMensaje && (
                <p className="store-payment-message" role="status">
                    {paypalMensaje}
                </p>
            )}
            {paypalProcesando && (
                <p className="store-payment-message" role="status">
                    Procesando pago con PayPal...
                </p>
            )}

            <div
                className={`store-products ${categoria === 'rangos' ? 'store-products-ranks' : ''}`}
                id="store-products"
                role="tabpanel"
                aria-labelledby={`store-tab-${categoria}`}
            >
                {productos.length > 0 ? productos.map((item) => (
                    <article
                        className={`store-product-card store-product-${item.titulo.toLowerCase().replace(/\s+/g, '-')}`}
                        key={item.titulo}
                    >
                        <ProductMark title={item.titulo} />
                        <h2>{item.titulo}</h2>
                        <p className="store-product-description">{item.desc}</p>
                        <div className="store-product-divider" />
                        <p className="store-product-price">
                            <span>${item.precio}</span>
                            <small>MXN</small>
                        </p>
                        <div className="store-product-actions">
                            <button
                                type="button"
                                className="store-buy-button"
                                onClick={() => comprar(item.titulo, item.precio)}
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M3 4h2l2.2 11h11.5l2-8H6" />
                                    <circle cx="9" cy="19" r="1.5" />
                                    <circle cx="17" cy="19" r="1.5" />
                                </svg>
                                Comprar con tarjeta
                            </button>
                            <button
                                type="button"
                                className="store-paypal-button"
                                onClick={() => pagarConPayPal(item.titulo)}
                                disabled={paypalProcesando}
                            >
                                Pagar con PayPal
                            </button>
                        </div>
                    </article>
                )) : (
                    <p className="store-empty-state">
                        No hay productos disponibles en esta categoría.
                    </p>
                )}
            </div>

            <div className="store-secure-payment">
                <span />
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18m-13 5h4" />
                </svg>
                <p>Pagos con tarjeta y PayPal</p>
                <span />
            </div>
        </section>
    );
};

export default Store;
