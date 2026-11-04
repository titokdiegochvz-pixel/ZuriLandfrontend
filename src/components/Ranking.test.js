import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Ranking from './Ranking';

describe('Ranking kills leaderboard', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete global.fetch;
    });

    test('shows nations ordered by kills without the Towny count columns', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                nations: [
                    { name: 'Nación Sur', residents: 7, towns: 2, land: 12, kills: 4 },
                    { name: 'Nación Norte', residents: 18, towns: 5, land: 32, kills: 27 },
                    { name: 'Nación Este', residents: 11, towns: 3, land: 20, kills: 12 },
                ],
                updated_at: null,
            }),
        });

        const { container } = render(<Ranking onBack={jest.fn()} />);

        await waitFor(() => expect(screen.getByRole('columnheader', { name: 'KILLS' })).toBeInTheDocument());

        expect(screen.queryByRole('columnheader', { name: /PUEBLOS|HABITANTES|TERRITORIO/ })).not.toBeInTheDocument();
        const rows = Array.from(container.querySelectorAll('.ranking-table tbody tr'));
        expect(rows.map((row) => row.cells[1].textContent)).toEqual([
            'Nación Norte',
            'Nación Este',
            'Nación Sur',
        ]);
        expect(rows.map((row) => row.cells[2].textContent)).toEqual(['27', '12', '4']);
        expect(screen.queryByRole('button', { name: /Habitantes|Pueblos|Territorio/ })).not.toBeInTheDocument();
    });

    test('shows zero kills when the ranking snapshot predates kill tracking', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                nations: [{ name: 'Nación Antigua', residents: 5, towns: 2, land: 12 }],
                updated_at: null,
            }),
        });

        render(<Ranking onBack={jest.fn()} />);

        await waitFor(() => expect(screen.getByRole('columnheader', { name: 'KILLS' })).toBeInTheDocument());
        expect(screen.getByRole('cell', { name: '0' })).toBeInTheDocument();
    });

    test('retains the manual refresh control', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ nations: [], updated_at: null }),
        });

        render(<Ranking onBack={jest.fn()} />);

        const refreshButton = screen.getByRole('button', { name: 'Actualizar' });
        await waitFor(() => expect(refreshButton).not.toBeDisabled());
        fireEvent.click(refreshButton);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    });
});
