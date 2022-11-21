import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "https://foodieland1234.herokuapp.com/"
});