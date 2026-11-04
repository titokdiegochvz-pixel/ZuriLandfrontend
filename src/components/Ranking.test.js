import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Ranking from './Ranking';

describe('Towny player kill feed', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete global.fetch;
    });

    test('groups residents and recent killer-to-victim events by Towny city', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                towns: [
                    {
                        name: 'Atlantis',
                        residents: ['Amaro', 'Zurixgod', 'Yisu', 'Iatomicmk'],
                        kills: [
                            { killer_name: 'Amaro', victim_name: 'Steve', occurred_at: '2026-11-04T11:30:27Z' },
                        ],
                    },
                    {
                        name: 'Thalassia',
                        residents: ['Yisuautu', 'Iatomicmk'],
                        kills: [
                            { killer_name: 'Yisuautu', victim_name: 'Notch', occurred_at: '2026-11-04T11:29:27Z' },
                        ],
                    },
                ],
                updated_at: '2026-11-04T11:30:27Z',
            }),
        });

        const { container } = render(<Ranking onBack={jest.fn()} />);

        await waitFor(() => expect(screen.getByRole('columnheader', { name: 'KILLS' })).toBeInTheDocument());

        expect(screen.getByRole('columnheader', { name: 'CIUDAD' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'HABITANTES' })).toBeInTheDocument();
        const rows = Array.from(container.querySelectorAll('.ranking-table tbody tr'));
        expect(rows.map((row) => Array.from(row.cells, (cell) => cell.textContent))).toEqual([
            ['Atlantis', 'Amaro, Zurixgod, Yisu, Iatomicmk', 'Amaro → Steve'],
            ['Thalassia', 'Yisuautu, Iatomicmk', 'Yisuautu → Notch'],
        ]);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/towny/kills'),
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
        expect(screen.getByText('2 ciudades · 2 bajas recientes (máx. 18)')).toBeInTheDocument();
    });

    test('shows an empty state before the first Towny city sync', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ towns: [], updated_at: null }),
        });

        render(<Ranking onBack={jest.fn()} />);

        expect(await screen.findByRole('columnheader', { name: 'KILLS' })).toBeInTheDocument();
        expect(screen.getByText('Aún no se reciben ciudades de Towny. Confirma que el plugin esté instalado y activo.')).toBeInTheDocument();
        expect(screen.getByText('Esperando la primera sincronización de Towny.')).toBeInTheDocument();
    });

    test('retains the manual refresh control', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ towns: [], updated_at: null }),
        });

        render(<Ranking onBack={jest.fn()} />);

        const refreshButton = screen.getByRole('button', { name: 'Actualizar' });
        await waitFor(() => expect(refreshButton).not.toBeDisabled());
        fireEvent.click(refreshButton);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    });
});
