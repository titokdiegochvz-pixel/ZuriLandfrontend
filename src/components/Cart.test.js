import { fireEvent, render, screen } from '@testing-library/react';
import Cart from './Cart';
import { addToCart, clearCart, getCartCount } from '../cart';
import { useSearchParams } from 'react-router-dom';

jest.mock('../config/api', () => ({ API_URL: 'https://api.example' }));

jest.mock('react-router-dom', () => {
    const React = require('react');
    return {
        Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
        useSearchParams: jest.fn(),
    };
});

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
});

beforeEach(() => {
    clearCart();
    useSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);
});

test('shows cart actions and updates quantity and total', () => {
    addToCart({ title: 'Elite', price: 49 });
    render(<Cart />);

    expect(screen.getByRole('button', { name: 'Pagar con PayPal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pagar con tarjeta' })).toBeInTheDocument();
    expect(screen.getAllByText('$49 MXN', { exact: true })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad de Elite' }));
    expect(getCartCount()).toBe(2);
    expect(screen.getAllByText('$98 MXN', { exact: true })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Elite' }));
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a la tienda' })).toHaveAttribute('href', '/store');
});

test('submits cart items to card checkout and displays server errors', async () => {
    addToCart({ title: 'Elite', price: 49 });
    const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Los pagos con tarjeta no están configurados todavía.' }),
    });
    global.fetch = fetchMock;
    render(<Cart />);

    fireEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
        'Los pagos con tarjeta no están configurados todavía.'
    );
    expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/create-checkout-session'),
        expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ items: [{ title: 'Elite', quantity: 1 }] }),
        })
    );
});
