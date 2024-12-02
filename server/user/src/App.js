import { useContext, useEffect, useState, useRef } from "react";
import {  createBrowserRouter, RouterProvider, Route, Outlet, Navigate} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import io from "socket.io-client";

import config from "./config";
import Login from "./Pages/Login/Login";
import Home from "./Pages/Home/Home";
import Register from "./Pages/Register/Register";
import Profile from "./Pages/Profile/Profile";
import Messenger from "./Pages/Messenger/Messenger";
import Followers from "./Pages/Followers/Followers";
import Following from "./Pages/Following/Following";
import Navbar from "./Components/Navbar/Navbar";
import RightBar from "./Components/RightBar/RightBar";
import LeftBar from "./Components/LeftBar/LeftBar";
import { DarkModeContext } from "./Context/DarkMode";
import { AuthContext } from "./Context/AuthContext";
import './App.scss';

function App() 
{
  const { darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  const queryClient = new QueryClient();

  const socket = useRef();

  useEffect(() =>
  {
    socket.current = io(`${config.wsBaseUrl}` , {
      transports: ["websocket", "polling"]
    });

    socket.current.on("connect", () => {
      console.log("Socket connected:", socket.current.id);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => 
  {
    if (currentUser && socket.current) 
    {
      console.log("socket.current", socket.current);
      socket.current.emit("addUser", currentUser.id);
    }
  }, [currentUser]);

  const Layout = () => 
  {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar socket={socket}/>
          <div style={{ display: "flex" }}>
            <LeftBar />
            <div style={{ flex: 6 }}>
              <Outlet />
            </div>
            <RightBar />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const LayoutTwo = () => 
  {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar socket={socket}/>
            <div>
              <Outlet />
            </div>
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => 
  {
    if (!currentUser)
    {
      return <Navigate to="/login" />;
    }

    return children;
  };


  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home socket={socket}/>,
        },
        {
          path: "/profile/:id",
          element: <Profile socket={socket}/>,
        },
        {
          path: "/profile/:id/followers",
          element: <Followers />,
        },
        {
          path: "/profile/:id/following",
          element: <Following />,
        }
      ]
    },
    {
      path: "/convo",
      element: (
        <ProtectedRoute>
          <LayoutTwo />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/convo/chat",
          element: <Messenger />,
        }
      ]
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    }
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;