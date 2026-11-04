import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Ranking from './Ranking';

const response = (data) => ({
    ok: true,
    json: async () => data,
});

describe('Towny online players and kills leaderboard', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete global.fetch;
    });

    test('shows online players by city and the top 10 kill leaders', async () => {
        global.fetch.mockResolvedValue(response({
            towns: [
                { name: 'Atlantis', players: ['Amaro', 'Zurixgod'] },
                { name: 'Thalassia', players: ['Yisuautu', 'Iatomicmk'] },
            ],
            kill_leaderboard: [
                { player: 'Amaro', kills: 12 },
                { player: 'Yisuautu', kills: 9 },
            ],
            updated_at: '2026-11-04T11:30:27Z',
        }));

        const { container } = render(<Ranking onBack={jest.fn()} />);

        expect(await screen.findByRole('columnheader', { name: 'JUGADORES ONLINE' })).toBeInTheDocument();
        expect(screen.getAllByText('En línea')).toHaveLength(4);
        expect(screen.getByText('Thalassia')).toBeInTheDocument();
        expect(screen.getAllByText('Yisuautu')).toHaveLength(2);

        const townRows = Array.from(container.querySelector('.ranking-table-wrap tbody').rows);
        expect(townRows.map((row) => row.cells[0].textContent)).toEqual(['Atlantis', 'Thalassia']);

        const killRows = Array.from(container.querySelectorAll('.ranking-leaderboard tbody tr'));
        expect(killRows.map((row) => Array.from(row.cells, (cell) => cell.textContent))).toEqual([
            ['1', 'Amaro', '12'],
            ['2', 'Yisuautu', '9'],
        ]);
        expect(screen.getByText('2 ciudades · 4 jugadores conectados · Top 2/10 kills')).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/towny/kills'),
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });

    test('limits the displayed kills leaderboard to ten players', async () => {
        global.fetch.mockResolvedValue(response({
            towns: [],
            kill_leaderboard: Array.from({ length: 12 }, (_, index) => ({
                player: `Player${index + 1}`,
                kills: 12 - index,
            })),
        }));

        const { container } = render(<Ranking onBack={jest.fn()} />);

        await screen.findByRole('columnheader', { name: 'KILLS' });
        expect(container.querySelectorAll('.ranking-leaderboard tbody tr')).toHaveLength(10);
        expect(screen.getByText('0 ciudades · 0 jugadores conectados · Top 10/10 kills')).toBeInTheDocument();
    });

    test('shows empty states when the server has no online towns or kills yet', async () => {
        global.fetch.mockResolvedValue(response({
            towns: [],
            kill_leaderboard: [],
            updated_at: null,
        }));

        render(<Ranking onBack={jest.fn()} />);

        expect(await screen.findByText('Aún no hay ciudades de Towny sincronizadas.')).toBeInTheDocument();
        expect(screen.getByText('Aún no hay kills PvP registradas.')).toBeInTheDocument();
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

    test('refreshes online players when requested', async () => {
        global.fetch
            .mockResolvedValueOnce(response({
                towns: [{ name: 'Thalassia', players: ['Yisuautu'] }],
                kill_leaderboard: [],
            }))
            .mockResolvedValueOnce(response({
                towns: [{ name: 'Thalassia', players: ['Yisuautu', 'Iatomicmk'] }],
                kill_leaderboard: [],
            }));

        render(<Ranking onBack={jest.fn()} />);

        await screen.findByText('Yisuautu');
        fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
        await waitFor(() => expect(screen.getByText('Iatomicmk')).toBeInTheDocument());
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });
});
