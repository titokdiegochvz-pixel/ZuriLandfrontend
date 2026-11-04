import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AUTH_CHANGE_EVENT, clearCurrentUser, getCurrentUser } from '../auth';
import { CART_CHANGE_EVENT, getCartCount } from '../cart';
import './Header.css';

const Header = () => {
    const [usuario, setUsuario] = useState(getCurrentUser);
    const [cartCount, setCartCount] = useState(getCartCount);

    useEffect(() => {
        const handleAuthChange = () => setUsuario(getCurrentUser());
        window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
        return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    }, []);

    useEffect(() => {
        const handleCartChange = () => setCartCount(getCartCount());
        window.addEventListener(CART_CHANGE_EVENT, handleCartChange);
        return () => window.removeEventListener(CART_CHANGE_EVENT, handleCartChange);
    }, []);

    const navItems = [
        { id: 'home', label: 'Inicio', path: '/' },
        { id: 'store', label: 'Tienda', path: '/store' },
        { id: 'community', label: 'Comunidad', path: '/community' },
    ];

    return (
        <header className="main-navbar">
            <nav className="navbar-inner">
                <div className="navbar-links">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className="nav-link"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="navbar-account">
                    {usuario ? (
                        <div className="navbar-user">
                            <span className="navbar-avatar" aria-hidden="true">
                                {usuario.nombre.trim().charAt(0).toUpperCase()}
                            </span>
                            <span className="navbar-user-name" title={usuario.nombre}>
                                {usuario.nombre}
                            </span>
                            <button type="button" className="logout-button" onClick={clearCurrentUser}>
                                Cerrar sesión
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="account-link">
                                <span aria-hidden="true">♙</span> Iniciar sesión
                            </Link>

                            <Link to="/register" className="register-button">
                                Registrarse
                            </Link>
                        </>
                    )}

                    <Link
                        to="/store"
                        className="cart-button"
                        title="Ir a la tienda"
                        aria-label={`Carrito con ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}
                    >
                        🛒
                        <span className="cart-count">{cartCount}</span>
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;
