import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    try {
      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role === "employee") {
        navigate("/employee-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Invalid token", err);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
}
