import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";


function PublicRoute({ children }) {

  const user = localStorage.getItem("user");

  // If already logged in, don't allow access
  // to login/register/reset pages.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =========================
            DEFAULT
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =========================
            LOGIN
        ========================= */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />


        {/* =========================
            REGISTER
        ========================= */}

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />


        {/* =========================
            FORGOT PASSWORD
        ========================= */}

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />


        {/* =========================
            OTP VERIFICATION
        ========================= */}

        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />


        {/* =========================
            CHANGE PASSWORD
        ========================= */}

        <Route
          path="/change-password"
          element={
            <PublicRoute>
              <ChangePassword />
            </PublicRoute>
          }
        />


        {/* =========================
            DASHBOARD
            PROTECTED
        ========================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================
            UNKNOWN ROUTE
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;