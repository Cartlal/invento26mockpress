const isProduction = import.meta.env.PROD;

export const socketUrl = isProduction ? "/" : "http://localhost:5000";
export const serverUrl = isProduction ? "" : "http://localhost:5000";
export const apiUrl = isProduction ? "/api" : "http://localhost:5000/api";
