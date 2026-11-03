import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './Ranking.css';

const categories = {
    residents: { label: 'Habitantes', icon: '👥' },
    towns: { label: 'Pueblos', icon: '🏘️' },
    land: { label: 'Territorio', icon: '🗺️' },
};

const numberFormat = new Intl.NumberFormat('es-MX');

const Ranking = ({ onBack }) => {
    const [category, setCategory] = useState('residents');
    const [nations, setNations] = useState([]);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        const loadRanking = async () => {
            setLoading(true);
            setError('');

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
                setUpdatedAt(data.updated_at || null);
            } catch (requestError) {
                if (requestError.name !== 'AbortError') {
                    setError('No se pudo cargar la clasificación. Inténtalo de nuevo.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadRanking();
        return () => controller.abort();
    }, [refreshKey]);

    const sortedNations = [...nations].sort(
        (first, second) => second[category] - first[category]
    );

    return (
        <section className="ranking-section">
            <div className="ranking-heading">
                <button className="ranking-back" onClick={onBack}>
                    ← Volver a comunidad
                </button>

                <span className="ranking-eyebrow">
                    COMPETICIÓN GLOBAL
                </span>

                <h2>Tabla de clasificación</h2>

                <p>Clasificación actualizada desde las naciones de Towny.</p>
            </div>

            <div className="ranking-tabs">
                {Object.entries(categories).map(([key, item]) => (
                    <button
                        key={key}
                        className={`ranking-tab ${
                            category === key ? 'active' : ''
                        }`}
                        onClick={() => setCategory(key)}
                    >
                        {item.icon} {item.label}
                    </button>
                ))}
                <button
                    className="ranking-tab"
                    onClick={() => setRefreshKey((key) => key + 1)}
                    disabled={loading}
                >
                    Actualizar
                </button>
            </div>

            {error && (
                <p className="ranking-message ranking-error" role="alert">
                    {error}
                </p>
            )}

            {!error && loading && (
                <p className="ranking-message" role="status">
                    Cargando clasificación…
                </p>
            )}

            {!error && !loading && nations.length === 0 && (
                <p className="ranking-message" role="status">
                    El servidor todavía no ha enviado datos de Towny.
                </p>
            )}

            {!error && !loading && nations.length > 0 && (
                <div className="ranking-table-wrap">
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>POS.</th>
                                <th>NACIÓN</th>
                                <th>PUEBLOS</th>
                                <th>HABITANTES</th>
                                <th>TERRITORIO (PARCELAS)</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedNations.map((nation, index) => (
                                <tr key={nation.name}>
                                    <td className="rank-position">
                                        {index === 0
                                            ? '🥇'
                                            : index === 1
                                            ? '🥈'
                                            : index === 2
                                            ? '🥉'
                                            : index + 1}
                                    </td>

                                    <td>
                                        <strong className="rank-nation">
                                            {nation.name}
                                        </strong>
                                    </td>

                                    <td>{numberFormat.format(nation.towns)}</td>
                                    <td>{numberFormat.format(nation.residents)}</td>
                                    <td>{numberFormat.format(nation.land)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <footer className="ranking-footer">
                <span>🌍 {nations.length} naciones</span>
                <span>
                    {updatedAt
                        ? `Actualizado: ${new Date(updatedAt).toLocaleString('es-MX')}`
                        : 'Esperando la primera sincronización'}
                </span>
            </footer>
        </section>
    );
};

export default Ranking;
