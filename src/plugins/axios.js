import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000, // 10 seconds
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export { api };

export default axiosPlugin;