import { clearCurrentUser, getCurrentUser, setCurrentUser, AUTH_CHANGE_EVENT } from './auth';

describe('user session', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    test('stores only the public account details and notifies the header', () => {
        const handleAuthChange = jest.fn();
        window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

        setCurrentUser({
            nombre: 'Aventurero Zuri',
            email: 'zuri@example.test',
            password: 'password-hash',
        });

        expect(JSON.parse(sessionStorage.getItem('zuriland_usuario'))).toEqual({
            nombre: 'Aventurero Zuri',
            email: 'zuri@example.test',
        });
        expect(handleAuthChange).toHaveBeenCalledTimes(1);
        window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    });

    test('removes private fields from an existing session', () => {
        sessionStorage.setItem('zuriland_usuario', JSON.stringify({
            nombre: 'Aventurero Zuri',
            email: 'zuri@example.test',
            password: 'password-hash',
        }));

        expect(getCurrentUser()).toEqual({
            nombre: 'Aventurero Zuri',
            email: 'zuri@example.test',
        });
        expect(sessionStorage.getItem('zuriland_usuario')).not.toContain('password-hash');
    });

    test('clears the session and notifies the header on logout', () => {
        const handleAuthChange = jest.fn();
        sessionStorage.setItem('zuriland_usuario', JSON.stringify({ nombre: 'Aventurero Zuri' }));
        window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

        clearCurrentUser();

        expect(sessionStorage.getItem('zuriland_usuario')).toBeNull();
        expect(handleAuthChange).toHaveBeenCalledTimes(1);
        window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    });
});
