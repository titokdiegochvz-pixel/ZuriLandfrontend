import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './Ranking.css';

const REFRESH_INTERVAL_MS = 30000;

const Ranking = ({ onBack }) => {
    const [towns, setTowns] = useState([]);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                    setError('La API todavía no publica la clasificación de ciudades. El backend debe actualizarse.');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                if (!Array.isArray(data.towns)) {
                    throw new Error('Invalid Towny response');
                }

                setTowns(data.towns.map((town) => {
                    const players = Array.isArray(town.players)
                        ? town.players
                        : Array.isArray(town.residents)
                            ? town.residents
                            : [];

                    return {
                        ...town,
                        players: players.map((player) => (
                            typeof player === 'string'
                                ? { name: player, kills: 0 }
                                : { name: player.name, kills: Number(player.kills) || 0 }
                        )),
                    };
                }));
                setUpdatedAt(data.updated_at || null);
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

    useEffect(() => {
        const intervalId = window.setInterval(
            () => setRefreshKey((key) => key + 1),
            REFRESH_INTERVAL_MS
        );
        return () => window.clearInterval(intervalId);
    }, []);

    const onlinePlayerCount = towns.reduce((total, town) => total + town.players.length, 0);

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

                <p>Jugadores conectados y sus kills, agrupados por ciudad.</p>
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
                    Cargando ciudades…
                </p>
            )}

            {!error && !loading && towns.length === 0 && (
                <p className="ranking-message" role="status">
                    Aún no hay ciudades de Towny sincronizadas.
                </p>
            )}

            {!error && !loading && (
                <>
                    <div className="ranking-table-wrap">
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th>CIUDAD</th>
                                    <th>JUGADORES ONLINE</th>
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
                                            <td className="rank-nation">{town.name}</td>
                                            <td className="ranking-names">
                                                {town.players.length > 0 ? (
                                                    <ul className="ranking-online-list">
                                                        {town.players.map((player) => (
                                                            <li className="ranking-online-player" key={player.name}>
                                                                <span className="ranking-online-dot" aria-hidden="true" />
                                                                <span>{player.name}</span>
                                                                <span className="ranking-online-label">En línea</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    'Ningún jugador conectado'
                                                )}
                                            </td>
                                            <td className="rank-kills ranking-player-kills">
                                                {town.players.length > 0 ? (
                                                    <ul className="ranking-online-list">
                                                        {town.players.map((player) => (
                                                            <li className="ranking-kill-count" key={player.name}>
                                                                {player.kills} {player.kills === 1 ? 'kill' : 'kills'}
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

                </>
            )}

            <footer className="ranking-footer">
                <span>
                    {towns.length} {towns.length === 1 ? 'ciudad' : 'ciudades'} · {onlinePlayerCount} {onlinePlayerCount === 1 ? 'jugador conectado' : 'jugadores conectados'}
                </span>
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
