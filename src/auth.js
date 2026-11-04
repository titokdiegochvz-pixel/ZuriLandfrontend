const USER_STORAGE_KEY = 'zuriland_usuario';
export const AUTH_CHANGE_EVENT = 'zuriland-auth-change';

export function getCurrentUser() {
    const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) {
        return null;
    }

    try {
        const usuario = JSON.parse(storedUser);
        if (typeof usuario?.nombre === 'string' && usuario.nombre.trim()) {
            const safeUser = {
                nombre: usuario.nombre,
                email: typeof usuario.email === 'string' ? usuario.email : '',
            };
            const serializedUser = JSON.stringify(safeUser);
            if (storedUser !== serializedUser) {
                sessionStorage.setItem(USER_STORAGE_KEY, serializedUser);
            }
            return safeUser;
        }
    } catch (error) {
        console.error('No se pudo leer la sesión del usuario:', error);
    }

    sessionStorage.removeItem(USER_STORAGE_KEY);
    return null;
}

export function setCurrentUser(usuario) {
    if (typeof usuario?.nombre !== 'string' || !usuario.nombre.trim()) {
        throw new Error('El servidor no devolvió un nombre de usuario válido.');
    }

    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
        nombre: usuario.nombre,
        email: typeof usuario.email === 'string' ? usuario.email : '',
    }));
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearCurrentUser() {
    sessionStorage.removeItem(USER_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
