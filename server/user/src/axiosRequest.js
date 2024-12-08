import axios from "axios";
import config from "./config";

export const makeRequest = axios.create({
  baseURL: `${config.apiBaseUrl}`
});