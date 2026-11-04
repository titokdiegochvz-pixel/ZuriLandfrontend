import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Community from './Community';

describe('Community page', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete global.fetch;
        jest.restoreAllMocks();
    });

    test('shows the leading nations from the live ranking', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                nations: [
                    { name: 'Nación Sur', residents: 7, towns: 2, land: 12 },
                    { name: 'Nación Norte', residents: 18, towns: 5, land: 32 },
                    { name: 'Nación Este', residents: 11, towns: 3, land: 20 },
                    { name: 'Nación Oeste', residents: 2, towns: 1, land: 4 },
                ],
            }),
        });

        const { container } = render(<Community onOpenRanking={jest.fn()} onOpenRules={jest.fn()} />);

        expect(screen.getByRole('heading', { name: 'Comunidad' })).toBeTruthy();
        await waitFor(() => expect(container.querySelectorAll('.community-nation-card')).toHaveLength(3));
        await waitFor(() => expect(screen.queryByText('Cargando naciones…')).toBeNull());

        const nationNames = Array.from(container.querySelectorAll('.community-nation-details strong'))
            .map((nation) => nation.textContent);
        expect(nationNames).toEqual(['Nación Norte', 'Nación Este', 'Nación Sur']);
        expect(container.querySelector('.community-nation-details > span').textContent).toBe('5 pueblos');
    });

    test('keeps the ranking and rules buttons connected', async () => {
        const onOpenRanking = jest.fn();
        const onOpenRules = jest.fn();
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ nations: [] }),
        });

        render(<Community onOpenRanking={onOpenRanking} onOpenRules={onOpenRules} />);

        fireEvent.click(screen.getByRole('button', { name: /Tabla de clasificación/ }));
        fireEvent.click(screen.getByRole('button', { name: /^Reglas/ }));

        expect(onOpenRanking).toHaveBeenCalledTimes(1);
        expect(onOpenRules).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(screen.queryByText('Cargando naciones…')).toBeNull());
    });

    test('shows an honest unavailable state when ranking cannot be loaded', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch.mockResolvedValue({ ok: false, status: 404 });

        render(<Community onOpenRanking={jest.fn()} onOpenRules={jest.fn()} />);

        expect(await screen.findByText(/Las naciones destacadas aparecerán cuando la clasificación esté disponible/)).toBeTruthy();
        await waitFor(() => expect(screen.queryByText('Cargando naciones…')).toBeNull());
    });
});
