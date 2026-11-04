import { fireEvent, render, screen } from '@testing-library/react';
import Cart from './Cart';
import { addToCart, clearCart, getCartCount } from '../cart';
import { useSearchParams } from 'react-router-dom';

jest.mock('react-router-dom', () => {
    const React = require('react');
    return {
        Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
        useSearchParams: jest.fn(),
    };
});

beforeEach(() => {
    clearCart();
    useSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);
});

test('shows cart actions and updates quantity and total', () => {
    addToCart({ title: 'Elite', price: 49 });
    render(<Cart />);

    expect(screen.getByRole('button', { name: 'Pagar con PayPal' })).toBeInTheDocument();
    expect(screen.getAllByText('$49 MXN', { exact: true })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad de Elite' }));
    expect(getCartCount()).toBe(2);
    expect(screen.getAllByText('$98 MXN', { exact: true })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Elite' }));
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a la tienda' })).toHaveAttribute('href', '/store');
});
