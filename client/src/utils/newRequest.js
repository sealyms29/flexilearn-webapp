import axios from "axios";

const newRequest = axios.create({
    // Automatically switches between localhost and your Render backend
    baseURL: import.meta.env.MODE === "development" 
        ? "http://localhost:8800/api/" 
        : "https://flexilearn-webapp-tcbn.onrender.com/api/", 
    withCredentials: true,
});

// Add token from localStorage as fallback if cookie doesn't work
newRequest.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default newRequest;