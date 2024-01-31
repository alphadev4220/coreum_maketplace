import { config } from "app/config";
import axios from "axios";

export interface UserResponse {
  code?: number;
  data?: any; // Replace 'any' with a more specific type
  message?: string;
}

const apiService = {
  post: async (endpoint, data, headers?) => {
    try {
      const response = await axios.post(`${config.API_URL}${endpoint}`, data, {
        headers: {
          "x-access-token": localStorage.getItem("jwtToken"),
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  put: async (endpoint, data, headers?) => {
    try {
      const response = await axios.put(`${config.API_URL}${endpoint}`, data, {
        headers: {
          "x-access-token": localStorage.getItem("jwtToken"),
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

export default apiService;
