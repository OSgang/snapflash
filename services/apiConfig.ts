import axios from "axios";
import * as SecureStore from "expo-secure-store";

import Constants from "expo-constants";

const getLocalApiUrl = () => {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        const ip = hostUri.split(":")[0];
        return `http://${ip}:8080`;
    }
    return "http://localhost:8080";
};

const LOCAL_URL = getLocalApiUrl();

const PROD_URL = "https://api.snapflash.app";

console.log(LOCAL_URL);

const BASE_URL = __DEV__ ? LOCAL_URL : PROD_URL;

// eslint-disable-next-line import/no-named-as-default-member
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync("jwtToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            await SecureStore.deleteItemAsync("jwtToken");
        }
        return Promise.reject(error);
    },
);

export default apiClient;
