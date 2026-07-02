// import { apiClient } from "../api-client";
// import { AxiosError } from "axios";
// import {
//   AxiosRequestConfigWithRetry,
//   refreshSession,
//   shouldRetryResponseError,
// } from "./refresh-token";

// export const attachResponseInterceptor = () => {
//   apiClient.interceptors.response.use(
//     (response) => response,
//     async (error: AxiosError) => {
//       if (!shouldRetryResponseError(error)) {
//         return Promise.reject(error);
//       }
      
//       const originalRequest = error.config as AxiosRequestConfigWithRetry;
//       originalRequest._retry = true;

//       try {
//         await refreshSession();
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         return Promise.reject(refreshError);
//       }
//     },
//   );
// };
