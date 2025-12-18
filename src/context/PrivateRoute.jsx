import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, type = "user" }) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken =
      type === "admin"
        ? localStorage.getItem("adminToken")
        : localStorage.getItem("userToken");

    setToken(storedToken);
    setLoading(false);
  }, [type]);

  if (loading) return <div>Loading...</div>;

  if (!token)
    return (
      <Navigate to={type === "admin" ? "/admin/login" : "/login"} replace />
    );

  return children;
};

export default PrivateRoute;
