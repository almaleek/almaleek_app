import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.120.63.142:5000/api"; // adjust if needed

let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function addSubscriber(callback: (token: string) => void) {
  subscribers.push(callback);
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach access token from AsyncStorage
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.error;

    if (
      status === 401 &&
      message === "Token expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        const newAccessToken = data.accessToken;

        await AsyncStorage.setItem("accessToken", newAccessToken);

        // Notify all subscribers waiting for the new token
        onRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err: any) {
        console.error(
          "Token refresh failed:",
          err.message || err.response?.data?.error
        );
        await AsyncStorage.clear();
        // ⚠️ Dispatch logout action from your thunk, not here
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other 401 cases
    if (status === 401 && message === "Logged in on another device") {
      await AsyncStorage.clear();
      // ⚠️ Dispatch logout action from your thunk, not here
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
