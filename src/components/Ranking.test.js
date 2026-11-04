import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Ranking from './Ranking';

const response = (data) => ({
    ok: true,
    json: async () => data,
});

describe('Towny online players and kills by city', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete global.fetch;
    });

    test('shows each online player beside their kill count in the town row', async () => {
        global.fetch.mockResolvedValue(response({
            towns: [
                {
                    name: 'Atlantis',
                    players: [
                        { name: 'Amaro', kills: 12 },
                        { name: 'Zurixgod', kills: 5 },
                    ],
                },
                {
                    name: 'Thalassia',
                    players: [
                        { name: 'Yisuautu', kills: 9 },
                        { name: 'Iatomicmk', kills: 2 },
                    ],
                },
            ],
            updated_at: '2026-11-04T11:30:27Z',
        }));

        const { container } = render(<Ranking onBack={jest.fn()} />);

        expect(await screen.findByRole('columnheader', { name: 'KILLS' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'JUGADORES ONLINE' })).toBeInTheDocument();
        expect(screen.queryByText('Top 10 Kills')).not.toBeInTheDocument();

        const rows = Array.from(container.querySelector('.ranking-table tbody').rows);
        expect(rows.map((row) => row.cells[0].textContent)).toEqual(['Atlantis', 'Thalassia']);
        expect(Array.from(rows[0].cells[1].querySelectorAll('.ranking-online-player span:nth-child(2)'), (player) => player.textContent))
            .toEqual(['Amaro', 'Zurixgod']);
        expect(Array.from(rows[0].cells[2].querySelectorAll('.ranking-kill-count'), (kills) => kills.textContent))
            .toEqual(['12 kills', '5 kills']);
        expect(Array.from(rows[1].cells[1].querySelectorAll('.ranking-online-player span:nth-child(2)'), (player) => player.textContent))
            .toEqual(['Yisuautu', 'Iatomicmk']);
        expect(Array.from(rows[1].cells[2].querySelectorAll('.ranking-kill-count'), (kills) => kills.textContent))
            .toEqual(['9 kills', '2 kills']);
        expect(screen.getByText('2 ciudades · 4 jugadores conectados')).toBeInTheDocument();
    });

    test('supports old API snapshots that only contain player names', async () => {
        global.fetch.mockResolvedValue(response({
            towns: [{ name: 'Thalassia', players: ['Yisuautu', 'Iatomicmk'] }],
            updated_at: null,
        }));

        const { container } = render(<Ranking onBack={jest.fn()} />);

        await screen.findByRole('columnheader', { name: 'KILLS' });
        const row = container.querySelector('.ranking-table tbody tr');
        expect(Array.from(row.cells[2].querySelectorAll('.ranking-kill-count'), (kills) => kills.textContent))
            .toEqual(['0 kills', '0 kills']);
    });

    test('shows an empty state while waiting for the Towny sync', async () => {
        global.fetch.mockResolvedValue(response({
            towns: [],
            updated_at: null,
        }));

        render(<Ranking onBack={jest.fn()} />);

        expect(await screen.findByText('Aún no hay ciudades de Towny sincronizadas.')).toBeInTheDocument();
        expect(screen.getByText('Esperando la primera sincronización de Towny.')).toBeInTheDocument();
    });

    test('explains that the backend route must be deployed instead of displaying invented players', async () => {
        global.fetch.mockResolvedValue({ ok: false, status: 404 });

        render(<Ranking onBack={jest.fn()} />);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'La API todavía no publica la clasificación de ciudades. El backend debe actualizarse.'
        );
        expect(screen.queryByText('Yisuautu')).not.toBeInTheDocument();
    });

    test('refreshes the online roster when requested', async () => {
        global.fetch
            .mockResolvedValueOnce(response({
                towns: [{ name: 'Thalassia', players: [{ name: 'Yisuautu', kills: 1 }] }],
            }))
            .mockResolvedValueOnce(response({
                towns: [{ name: 'Thalassia', players: [
                    { name: 'Yisuautu', kills: 1 },
                    { name: 'Iatomicmk', kills: 2 },
                ] }],
            }));

        render(<Ranking onBack={jest.fn()} />);

        await screen.findByText('Yisuautu');
        fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
        await waitFor(() => expect(screen.getByText('Iatomicmk')).toBeInTheDocument());
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });
});
