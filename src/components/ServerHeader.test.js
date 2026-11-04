import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ServerHeader from './ServerHeader';

const originalFetch = global.fetch;

describe('ServerHeader player status', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    test.each([
        [1, '1 JUGADOR EN LÍNEA'],
        [4, '4 JUGADORES EN LÍNEA'],
    ])('shows the actual count when %i players are online', async (count, label) => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ online: true, players: { online: count, max: 20 } }),
        });

        render(<ServerHeader />);

        await waitFor(() => expect(screen.getByText(label)).toBeInTheDocument());
    });

    test('shows a disconnected state when the Minecraft server is offline', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ online: false, players: { online: 0, max: 0 } }),
        });

        render(<ServerHeader />);

        await waitFor(() => expect(screen.getByText('SERVIDOR DESCONECTADO')).toBeInTheDocument());
    });

    test('shows an unavailable state when the status endpoint fails', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));

        render(<ServerHeader />);

        await waitFor(() => expect(screen.getByText('ESTADO NO DISPONIBLE')).toBeInTheDocument());
    });
});
