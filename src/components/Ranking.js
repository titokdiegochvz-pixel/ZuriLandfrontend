import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './Ranking.css';

const numberFormat = new Intl.NumberFormat('es-MX');

const Ranking = ({ onBack }) => {
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
        (first, second) => (second.kills ?? 0) - (first.kills ?? 0)
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

                <p>Clasificación de naciones por kills de sus habitantes.</p>
            </div>

            <div className="ranking-tabs">
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
                    Aún no se reciben datos de Towny. Confirma que el plugin de sincronización esté instalado y activo en el servidor.
                </p>
            )}

            {!error && !loading && (
                <div className="ranking-table-wrap">
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>HABITANTES</th>
                                <th>CIUDADES</th>
                                <th>KILLS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedNations.length === 0 ? (
                                <tr>
                                    <td className="ranking-empty" colSpan="3">
                                        Aún no hay datos sincronizados.
                                    </td>
                                </tr>
                            ) : (
                                sortedNations.map((nation) => (
                                    <tr key={nation.name}>
                                        <td>
                                            {numberFormat.format(nation.residents ?? 0)}
                                        </td>

                                        <td className="rank-nation">
                                            {numberFormat.format(nation.towns ?? 0)}
                                        </td>

                                        <td className="rank-kills">
                                            {numberFormat.format(nation.kills ?? 0)}
                                        </td>
                                    </tr>
                                ))
                            )}
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
