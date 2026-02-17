import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getMe } from "../services/authService";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        localStorage.setItem("token", token);

        // 🔥 FETCH USER FROM BACKEND
        const res = await getMe();
        localStorage.setItem("user", JSON.stringify(res.data.user));

        localStorage.setItem("loginTime", new Date().toISOString());

        const decoded = jwtDecode(token);

        if (decoded.role === "employee") {
          navigate("/employee-dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("OAuth login failed", err);
        localStorage.clear();
        navigate("/", { replace: true });
      }
    };

    run();
  }, [navigate]);

  return <p>Logging you in...</p>;
}
