import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const SERVER_ADDRESS = 'pgsql-stained.tun.ply.gg';

const Home = () => {
    const [copyMessage, setCopyMessage] = useState('');

    const copyServerAddress = async () => {
        try {
            await navigator.clipboard.writeText(SERVER_ADDRESS);
            setCopyMessage('IP copiada');
        } catch {
            setCopyMessage('No se pudo copiar. Selecciona la IP y cópiala manualmente.');
        }

        window.setTimeout(() => setCopyMessage(''), 3000);
    };

    return (
        <div className="home-page">
            <section className="home-hero" aria-labelledby="home-title">
                <h1 id="home-title">
                    Bienvenido a <span>ZURILAND</span>
                </h1>
                <div className="home-divider" aria-hidden="true">
                    <span />
                    <i>✦</i>
                    <span />
                </div>
                <p>Explora, construye y forma parte de una gran comunidad Survival.</p>
                <a className="home-play-button" href="#server-connect">
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M5 3.5v9l7-4.5-7-4.5Z" fill="currentColor" />
                    </svg>
                    Juega ahora
                </a>
            </section>

            <section
                className="home-server-panel"
                id="server-connect"
                aria-label="Conéctate al servidor"
            >
                <div className="home-server-intro">
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                        <rect x="5" y="6" width="30" height="11" rx="3" />
                        <rect x="5" y="23" width="30" height="11" rx="3" />
                        <path d="M11 11.5h.1M16 11.5h.1M11 28.5h.1M16 28.5h.1" />
                    </svg>
                    <div>
                        <h2>Conéctate al servidor</h2>
                        <p>Minecraft Java Edition <span>·</span> Survival</p>
                    </div>
                </div>

                <div className="home-server-address">
                    <code>{SERVER_ADDRESS}</code>
                    <button
                        type="button"
                        onClick={copyServerAddress}
                        aria-label="Copiar dirección del servidor"
                        title="Copiar dirección"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="8" y="4" width="12" height="15" rx="2" />
                            <path d="M5 8v12a2 2 0 0 0 2 2h10" />
                        </svg>
                    </button>
                </div>
                <span className="home-copy-feedback" role="status" aria-live="polite">
                    {copyMessage}
                </span>
            </section>

            <nav className="home-feature-links" aria-label="Explora ZuriLand">
                <Link to="/community" className="home-feature-link">
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                        <circle cx="20" cy="12" r="5" />
                        <circle cx="8" cy="16" r="3.5" />
                        <circle cx="32" cy="16" r="3.5" />
                        <path d="M10 31v-3a10 10 0 0 1 20 0v3H10ZM2 30v-2a6 6 0 0 1 7-5.9M38 30v-2a6 6 0 0 0-7-5.9" />
                    </svg>
                    <span>
                        <strong>Comunidad</strong>
                        <small>Conoce a otros jugadores y forma alianzas.</small>
                    </span>
                </Link>

                <Link to="/store" className="home-feature-link">
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                        <path d="M5 7h4l4 20h18l4-14H11" />
                        <circle cx="16" cy="33" r="2" />
                        <circle cx="29" cy="33" r="2" />
                    </svg>
                    <span>
                        <strong>Tienda</strong>
                        <small>Adquiere rangos, mejoras y beneficios exclusivos.</small>
                    </span>
                </Link>

                <Link to="/rules" className="home-feature-link">
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                        <path d="M20 10c-4-4-10-4-15-2v23c5-2 11-2 15 2m0-23c4-4 10-4 15-2v23c-5-2-11-2-15 2m0-23v23" />
                    </svg>
                    <span>
                        <strong>Reglas</strong>
                        <small>Consulta las normas y ayuda a mantener una buena experiencia.</small>
                    </span>
                </Link>
            </nav>

            <footer className="home-footer">
                <Link to="/" className="home-footer-brand" aria-label="ZuriLand, inicio">
                    <span className="home-footer-logo">Z</span>
                    <span>
                        <strong>Zuriland</strong>
                        <small>Servidor Minecraft Survival</small>
                    </span>
                </Link>

                <nav aria-label="Navegación del pie de página">
                    <Link to="/">Inicio</Link>
                    <Link to="/store">Tienda</Link>
                    <Link to="/community">Comunidad</Link>
                    <Link to="/rules">Reglas</Link>
                </nav>

                <a
                    className="home-footer-discord"
                    href="https://discord.gg/e7SN74u7S"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Únete al Discord de ZuriLand"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19.5 5.5a18 18 0 0 0-4.4-1.4l-.6 1.2a16 16 0 0 0-5 0l-.6-1.2a18 18 0 0 0-4.4 1.4C1.7 9.5 1 13.4 1.4 17.2a18 18 0 0 0 5.4 2.7l1.2-2a11 11 0 0 1-1.9-.9l.5-.4a12 12 0 0 0 11 0l.5.4a11 11 0 0 1-1.9.9l1.2 2a18 18 0 0 0 5.4-2.7c.5-4.4-.8-8.3-3.3-11.7ZM8.8 14.8c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
                    </svg>
                </a>

                <p>© 2026 Zuriland. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Home;
