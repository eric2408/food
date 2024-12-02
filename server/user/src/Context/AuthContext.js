import { createContext, useEffect, useState } from "react";
import axios from "axios";
import config from "../config";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => 
{
  const [currentUser, setCurrentUser] = useState(  
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => 
  {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  const login = async (inputs) => 
  {
    const res = await axios.post(`${config.apiBaseUrl}login`, inputs).then((response)=> 
    {
      setCurrentUser(response.data)
    });
  };

  const logout = () => 
  {
    setCurrentUser(null)
  }
  
  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};