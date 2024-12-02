
import { render } from "@testing-library/react";
import App from "./App";
import { DarkModeContextProvider } from './Context/DarkMode';
import { AuthContextProvider } from "./Context/AuthContext";

describe('App component', () => 
{
  test("renders without crashing", () => 
  {
    render(
      <DarkModeContextProvider>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </DarkModeContextProvider>
    );
  });
 })