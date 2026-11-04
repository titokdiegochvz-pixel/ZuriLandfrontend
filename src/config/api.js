const configuredApiUrl = process.env.REACT_APP_API_URL
    || (process.env.NODE_ENV === 'development' ? 'https://zuriland-api-ajeu.onrender.com' : '');

export const API_URL = configuredApiUrl.replace(/\/+$/, '');
