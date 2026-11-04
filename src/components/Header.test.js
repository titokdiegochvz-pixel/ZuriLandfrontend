import { fireEvent, render, screen } from '@testing-library/react';
import Header from './Header';
import { clearCurrentUser, setCurrentUser } from '../auth';

jest.mock('react-router-dom', () => {
    const React = require('react');
    return {
        Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
    };
});

beforeEach(() => {
    clearCurrentUser();
});

test('opens the profile menu and signs out the current user', () => {
    setCurrentUser({ nombre: 'Alex', email: 'alex@example.com' });
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));

    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mi carrito' })).toHaveAttribute('href', '/cart');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(screen.getByRole('link', { name: /Iniciar sesión/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Perfil' })).not.toBeInTheDocument();
});
