const configuredApiUrl = process.env.REACT_APP_API_URL
    || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');

export const API_URL = configuredApiUrl.replace(/\/+$/, '');
