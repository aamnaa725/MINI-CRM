import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Shared by every protected page: reads the logged-in user out of
// localStorage, verifies their session token with the backend, and bounces
// to /login if either is missing/invalid.
export function useAuthUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);

    const verify = async () => {
      const response = await checkCurrentToken(storedUser?.sessions[0]);
      if (response.status !== 200) {
        navigate("/login");
      }
    };
    verify();
  }, []);

  const checkCurrentToken = async (token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-token`,
        { token }
      );
      return response.data;
    } catch (e) {
      return e;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return { user, logout };
}
