import "./Register.scss";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import React from "react";
import { useState } from "react";
import config from "../../config";

const Register = () => 
{
  const [inputs, setInputs] = useState({
    "username": "",
    "email": "",
    "password": ""
  });

  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => 
  {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => 
  {
    e.preventDefault();

    try {
      await axios.post(`${config.apiBaseUrl}register`, inputs);
      navigate("/login");
    } catch (err) {
      if(err.response.status = 401)
      {
        setErr(err.response.data.error.message);
      } else {
        setErr(err.response.data.error.message);
      }
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Foodieland</h1>
          <h2>
            Connect with other Foodies!
          </h2>
          <span>Have an account?</span>
          <Link to="/login">
          <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form>
            <input
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password confirmation"
              name="password confirmation"
              onChange={handleChange}
            />
            {err && <p style={{ color: "red", fontSize: "12px"}}>{err}</p>}
            <button onClick={handleClick}>Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;