import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import Login from './Login';

jest.mock('axios', () => ({
    post: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    Link: ({ children }) => children,
    useNavigate: () => jest.fn(),
}));

describe('Login rate limit handling', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('explains how long to wait when the API responds with HTTP 429', async () => {
        axios.post.mockRejectedValue({
            response: {
                status: 429,
                headers: { 'retry-after': '42' },
            },
        });

        render(<Login />);

        fireEvent.change(screen.getByLabelText('Usuario o correo electrónico'), {
            target: { value: 'player@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Contraseña'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Se alcanzó el límite de intentos de inicio de sesión. Espera 42 segundos y vuelve a intentarlo.'
        );
    });
});
