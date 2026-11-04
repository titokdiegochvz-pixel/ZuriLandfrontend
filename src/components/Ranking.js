import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './Ranking.css';

const FALLBACK_TOWNS = [
    { name: 'Atlantis', residents: ['Amaro', 'Zurixgod', 'Yisu', 'Iatomicmk'], kills: [] },
    { name: 'Thalassia', residents: ['Yisuautu', 'Iatomicmk'], kills: [] },
];

const Ranking = ({ onBack }) => {
    const [towns, setTowns] = useState([]);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [usingRosterFallback, setUsingRosterFallback] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        const loadTowns = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(`${API_URL}/api/towny/kills`, {
                    signal: controller.signal,
                });

                if (response.status === 404) {
                    setTowns(FALLBACK_TOWNS);
                    setUpdatedAt(null);
                    setUsingRosterFallback(true);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                if (!Array.isArray(data.towns)) {
                    throw new Error('Invalid Towny response');
                }

                setTowns(data.towns);
                setUpdatedAt(data.updated_at || null);
                setUsingRosterFallback(false);
            } catch (requestError) {
                if (requestError.name !== 'AbortError') {
                    setError('No se pudieron cargar las ciudades. Inténtalo de nuevo.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadTowns();
        return () => controller.abort();
    }, [refreshKey]);

    const killCount = towns.reduce((total, town) => total + town.kills.length, 0);

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

                <p>Habitantes de cada ciudad y las últimas 18 bajas registradas.</p>
            </div>

            {usingRosterFallback && !loading && (
                <p className="ranking-message" role="status">
                    Se muestran las ciudades y habitantes indicados. Las bajas reales aparecerán cuando la API de Towny esté disponible.
                </p>
            )}

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
                    Cargando ciudades…
                </p>
            )}

            {!error && !loading && towns.length === 0 && (
                <p className="ranking-message" role="status">
                    Aún no se reciben ciudades de Towny. Confirma que el plugin esté instalado y activo.
                </p>
            )}

            {!error && !loading && (
                <div className="ranking-table-wrap">
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>CIUDAD</th>
                                <th>HABITANTES</th>
                                <th>KILLS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {towns.length === 0 ? (
                                <tr>
                                    <td className="ranking-empty" colSpan="3">
                                        Esperando la primera sincronización de Towny.
                                    </td>
                                </tr>
                            ) : (
                                towns.map((town) => (
                                    <tr key={town.name}>
                                        <td className="rank-nation">
                                            {town.name}
                                        </td>

                                        <td className="ranking-names">
                                            {town.residents.length > 0
                                                ? town.residents.join(', ')
                                                : 'Sin habitantes'}
                                        </td>

                                        <td className="rank-kills ranking-kills-list">
                                            {town.kills.length > 0 ? (
                                                <ul>
                                                    {town.kills.map((kill, index) => (
                                                        <li key={`${kill.occurred_at}-${kill.killer_name}-${index}`}>
                                                            <span>{kill.killer_name}</span>
                                                            {' → '}
                                                            <span>{kill.victim_name}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <footer className="ranking-footer">
                <span>
                    {towns.length} {towns.length === 1 ? 'ciudad' : 'ciudades'} · {killCount} {killCount === 1 ? 'baja reciente' : 'bajas recientes'} (máx. 18)
                </span>
                <span>
                    {updatedAt
                        ? `Actualizado: ${new Date(updatedAt).toLocaleString('es-MX')}`
                        : usingRosterFallback
                            ? 'Sin sincronización de bajas'
                            : 'Esperando la primera sincronización'}
                </span>
            </footer>
        </section>
    );
};

export default Ranking;
