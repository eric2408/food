import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Navbar from "./Components/Navbar/Navbar";
import RightBar from "./Components/RightBar/RightBar";
import LeftBar from "./Components/LeftBar/LeftBar";
import Home from "./Pages/Home/Home";
import { useContext } from "react";
import { DarkModeContext } from "./Context/DarkMode";
import Profile from "./Pages/Profile/Profile";
import { AuthContext } from "./Context/AuthContext";

import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import './App.scss';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Messenger from "./Pages/Messenger/Messenger";

function App() {

  const { darkMode } = useContext(DarkModeContext);

  const { currentUser } = useContext(AuthContext);

  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar />
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

  const LayoutTwo = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar />
            <div>
              <Outlet />
            </div>
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
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
          element: <Home />,
        },
        {
          path: "/profile/:id",
          element: <Profile />,
        },
      ],
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
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },

  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
