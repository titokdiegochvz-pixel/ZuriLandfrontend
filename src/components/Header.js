import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AUTH_CHANGE_EVENT, clearCurrentUser, getCurrentUser } from '../auth';
import { CART_CHANGE_EVENT, getCartCount } from '../cart';
import './Header.css';

const Header = () => {
    const [usuario, setUsuario] = useState(getCurrentUser);
    const [cartCount, setCartCount] = useState(getCartCount);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);

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

    useEffect(() => {
        if (!profileMenuOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!profileMenuRef.current?.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setProfileMenuOpen(false);
                profileButtonRef.current?.focus();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [profileMenuOpen]);

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
                        <div className="navbar-user" ref={profileMenuRef}>
                            <button
                                ref={profileButtonRef}
                                type="button"
                                className="profile-button"
                                aria-expanded={profileMenuOpen}
                                aria-controls="profile-menu"
                                aria-label="Perfil"
                                onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
                            >
                                <span className="navbar-avatar" aria-hidden="true">
                                    {usuario.nombre.trim().charAt(0).toUpperCase()}
                                </span>
                                <span>Perfil</span>
                                <svg aria-hidden="true" viewBox="0 0 16 16" className="profile-chevron">
                                    <path d="m4 6 4 4 4-4" />
                                </svg>
                            </button>
                            {profileMenuOpen && (
                                <div className="profile-menu" id="profile-menu">
                                    <div className="profile-menu-heading">Perfil</div>
                                    <div className="profile-menu-user" title={usuario.nombre}>
                                        {usuario.nombre}
                                    </div>
                                    {usuario.email && (
                                        <div className="profile-menu-email" title={usuario.email}>
                                            {usuario.email}
                                        </div>
                                    )}
                                    <div className="profile-menu-divider" />
                                    <Link
                                        to="/cart"
                                        className="profile-menu-link"
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        Mi carrito
                                    </Link>
                                    <button
                                        type="button"
                                        className="profile-menu-logout"
                                        onClick={() => {
                                            setProfileMenuOpen(false);
                                            clearCurrentUser();
                                        }}
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
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
                        to="/cart"
                        className="cart-button"
                        title="Ver carrito"
                        aria-label={`Carrito con ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}
                    >
                        🛒
                        <span className="cart-label">Carrito</span>
                        <span className="cart-count">{cartCount}</span>
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;
