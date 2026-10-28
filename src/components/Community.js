
import React from 'react';
import './Community.css';

const Community = ({ onOpenRanking, onOpenRules }) => {
    return (
        <section className="community-section">
            <div className="community-card">
                <div className="community-icon">🌐</div>

                <span className="community-eyebrow">
                    COMPETICIÓN GLOBAL
                </span>

                <h2>Comunidad</h2>

                <p>
                    Explora las naciones, consulta las clasificaciones
                    y descubre las reglas de nuestro servidor.
                </p>

                <div className="community-actions">
                    <button
                        className="community-button ranking-button"
                        onClick={onOpenRanking}
                    >
                        <span>🏆</span>
                        Tabla de clasificación
                        <span className="button-arrow">→</span>
                    </button>

                    <button
                        className="community-button rules-button"
                        onClick={onOpenRules}
                    >
                        <span>📜</span>
                        Reglas
                        <span className="button-arrow">→</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Community;
