import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // v6
import Header from "../../user/components/header";
import API_BASE_URL from "../../API";

const LoginAdmin = () => {
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("darkMode", dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.username, // assuming backend uses email for login
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid credentials");
      } else {
        // Save JWT in localStorage
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminInfo", JSON.stringify(data.admin));

        // Navigate to dashboard or home page
        navigate("/assets/add");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen ifle flex flex-col">
      <Header />
      <div className=" flex flex-1 items-center justify-center  bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
        <div className="w-full max-w-md rounded-xl bg-white/50 p-8 shadow-2xl backdrop-blur-sm dark:bg-background-dark/50">
          <div className="mb-8 text-center">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              PrimeTrack
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Securely log in to your admin account.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                name="username"
                type="text"
                placeholder="Email or Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary"
              />
            </div>

            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>

            {message && (
              <p className="text-center text-sm mt-2 text-red-500 dark:text-red-400">
                {message}
              </p>
            )}
          </form>
          <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/admin/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
