import axios from "axios";

const newRequest = axios.create({
    baseURL: "http://localhost:8800/api/",
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