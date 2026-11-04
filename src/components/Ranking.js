import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './Ranking.css';

const REFRESH_INTERVAL_MS = 30000;

const Ranking = ({ onBack }) => {
    const [towns, setTowns] = useState([]);
    const [killLeaderboard, setKillLeaderboard] = useState([]);
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

                setTowns(data.towns.map((town) => ({
                    ...town,
                    players: Array.isArray(town.players)
                        ? town.players
                        : Array.isArray(town.residents)
                            ? town.residents
                            : [],
                })));
                setKillLeaderboard(
                    Array.isArray(data.kill_leaderboard)
                        ? data.kill_leaderboard.slice(0, 10)
                        : []
                );
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

                <p>Jugadores conectados por ciudad y los 10 jugadores con más bajas PvP registradas.</p>
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
                                </tr>
                            </thead>

                            <tbody>
                                {towns.length === 0 ? (
                                    <tr>
                                        <td className="ranking-empty" colSpan="2">
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
                                                            <li className="ranking-online-player" key={player}>
                                                                <span className="ranking-online-dot" aria-hidden="true" />
                                                                <span>{player}</span>
                                                                <span className="ranking-online-label">En línea</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    'Ningún jugador conectado'
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <section className="ranking-leaderboard" aria-labelledby="kills-title">
                        <div className="ranking-leaderboard-heading">
                            <h3 id="kills-title">Top 10 Kills</h3>
                            <p>Bajas PvP registradas desde que se instaló la sincronización.</p>
                        </div>
                        <div className="ranking-table-wrap">
                            <table className="ranking-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>JUGADOR</th>
                                        <th>KILLS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {killLeaderboard.length === 0 ? (
                                        <tr>
                                            <td className="ranking-empty" colSpan="3">
                                                Aún no hay kills PvP registradas.
                                            </td>
                                        </tr>
                                    ) : (
                                        killLeaderboard.map((player, index) => (
                                            <tr key={player.player}>
                                                <td className="rank-position">{index + 1}</td>
                                                <td className="rank-nation">{player.player}</td>
                                                <td className="rank-kills">{player.kills}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            <footer className="ranking-footer">
                <span>
                    {towns.length} {towns.length === 1 ? 'ciudad' : 'ciudades'} · {onlinePlayerCount} {onlinePlayerCount === 1 ? 'jugador conectado' : 'jugadores conectados'} · Top {killLeaderboard.length}/10 kills
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
