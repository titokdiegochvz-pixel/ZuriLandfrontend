import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
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
                    <Link to="/login" className="account-link">
                        <span>♙</span> Iniciar sesión
                    </Link>

                    <Link to="/register" className="register-button">
                        Registrarse
                    </Link>

                    <Link to="/store" className="cart-button" title="Ir a la tienda">
                        🛒
                        <span className="cart-count">0</span>
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;
