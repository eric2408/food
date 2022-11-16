import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import React from "react";
import { useState, useContext } from "react";
import "./Login.scss";
import { AuthContext } from "../../Context/AuthContext";

const Login = () => {
  const [inputs, setInputs] = useState({
    "email": "",
    "password": "",
  });

  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
      setTimeout(1000);
      navigate("/");
    } catch (err) {
      setErr(err.response.data);
    }
  };


  return (
    <div className="login">
      <div className="card">
        <div className="left">
        </div>
        <div className="right">
          <h1>Foodieland</h1>
          <h2>Login</h2>
          <form>
          <input
              type="text"
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
            {err && err}
            <button onClick={handleLogin}>Login</button>
          </form>
          <div>
            <span>Don't have an account?</span>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;