import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './Community.css';

const numberFormat = new Intl.NumberFormat('es-MX');

function CommunityIcon({ name }) {
    if (name === 'trophy') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 21h8m-4-4v4m-5-17h10v5a5 5 0 0 1-10 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4" />
            </svg>
        );
    }

    if (name === 'rules') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3h9l4 4v14H6zM14 3v5h5m-9 4h6m-6 4h6" />
            </svg>
        );
    }

    if (name === 'flag') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 21V4m1 1c5-4 8 4 13 0v10c-5 4-8-4-13 0" />
            </svg>
        );
    }

    if (name === 'calendar') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M7 3v4m10-4v4M3 10h18m-13 4h2m4 0h2m-8 3h2m4 0h2" />
            </svg>
        );
    }

    if (name === 'swords') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m4 4 12 12m-9-13 4 4-6 6-4-4zm13 11 4 4-6 2-2-2zm-9-9 3-3m-6 12 4-4m6-6 3-3" />
                <path d="m5 19 4-4m-3 6-2-2" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 48 52" aria-hidden="true">
            <path d="M24 2 44 10v15c0 12-8 19-20 25C12 44 4 37 4 25V10L24 2Z" />
            <path d="M24 14v20m-8-10h16" />
        </svg>
    );
}

function NationEmblem({ position }) {
    return (
        <span className={`community-nation-emblem community-nation-emblem-${position}`} aria-hidden="true">
            <CommunityIcon name="shield" />
        </span>
    );
}

const Community = ({ onOpenRanking, onOpenRules }) => {
    const [nations, setNations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const loadNations = async () => {
            try {
                const response = await fetch(`${API_URL}/api/towny/ranking`, {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                if (!Array.isArray(data.nations)) {
                    throw new Error('Invalid ranking response');
                }

                setNations(data.nations);
            } catch (requestError) {
                if (requestError.name !== 'AbortError') {
                    console.error('Error al cargar las naciones destacadas:', requestError);
                    setError(true);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadNations();
        return () => controller.abort();
    }, []);

    const featuredNations = [...nations]
        .sort((first, second) => second.residents - first.residents)
        .slice(0, 3);

    return (
        <section className="community-page" aria-labelledby="community-title">
            <div className="community-hero">
                <div className="community-hero-icon" aria-hidden="true">
                    <svg viewBox="0 0 48 48">
                        <circle cx="24" cy="16" r="6" />
                        <circle cx="11" cy="20" r="4" />
                        <circle cx="37" cy="20" r="4" />
                        <path d="M12 37v-3c0-6 5-10 12-10s12 4 12 10v3H12Zm-8-1v-3c0-4 3-7 8-8m32 11v-3c0-4-3-7-8-8" />
                    </svg>
                </div>

                <div className="community-eyebrow">
                    <span />
                    COMUNIDAD ZURILAND
                    <span />
                </div>

                <h1 id="community-title">Comunidad</h1>
                <p>
                    Explora las naciones, consulta las clasificaciones y mantente al día
                    con las reglas, eventos y guerras del servidor.
                </p>

                <div className="community-actions">
                    <button className="community-button ranking-button" onClick={onOpenRanking}>
                        <CommunityIcon name="trophy" />
                        Tabla de clasificación
                        <span className="community-button-arrow" aria-hidden="true">→</span>
                    </button>
                    <button className="community-button rules-button" onClick={onOpenRules}>
                        <CommunityIcon name="rules" />
                        Reglas
                        <span className="community-button-arrow" aria-hidden="true">→</span>
                    </button>
                </div>
            </div>

            <div className="community-topics" aria-label="Secciones de la comunidad">
                <article className="community-topic">
                    <span className="community-topic-icon"><CommunityIcon name="flag" /></span>
                    <span>
                        <strong>Naciones</strong>
                        <span>Conoce las naciones y sus territorios.</span>
                    </span>
                </article>
                <article className="community-topic">
                    <span className="community-topic-icon"><CommunityIcon name="calendar" /></span>
                    <span>
                        <strong>Eventos</strong>
                        <span>Participa en eventos especiales.</span>
                    </span>
                </article>
                <article className="community-topic">
                    <span className="community-topic-icon"><CommunityIcon name="swords" /></span>
                    <span>
                        <strong>Guerras</strong>
                        <span>Sigue las guerras entre naciones.</span>
                    </span>
                </article>
            </div>

            <div className="community-featured-heading">
                <span />
                <h2>Naciones destacadas</h2>
                <span />
            </div>

            {loading && (
                <p className="community-ranking-message" role="status">
                    Cargando naciones…
                </p>
            )}

            {!loading && error && (
                <p className="community-ranking-message" role="status">
                    Las naciones destacadas aparecerán cuando la clasificación esté disponible.
                </p>
            )}

            {!loading && !error && featuredNations.length === 0 && (
                <p className="community-ranking-message" role="status">
                    Aún no hay naciones sincronizadas desde el servidor.
                </p>
            )}

            {!loading && !error && featuredNations.length > 0 && (
                <div className="community-featured-nations">
                    {featuredNations.map((nation, index) => (
                        <article className={`community-nation-card community-nation-${index + 1}`} key={nation.name}>
                            <span className="community-nation-rank" aria-label={`Puesto ${index + 1}`}>
                                {index + 1}
                            </span>
                            <NationEmblem position={index + 1} />
                            <span className="community-nation-details">
                                <strong>{nation.name}</strong>
                                <span>{numberFormat.format(nation.towns)} pueblos</span>
                            </span>
                            <span className="community-nation-count">
                                <strong>{numberFormat.format(nation.residents)}</strong>
                                <span>habitantes</span>
                            </span>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Community;
