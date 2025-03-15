import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../../context/chatContext";
import { useSocketContext } from "../../context/socketContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { loginUser, setLoginUser } = useChatContext();
  const socket = useSocketContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/user/login",
        { email, password }
      );

      const { data: loginUser } = data;

      if (loginUser) {
        setLoginUser(loginUser);
        sessionStorage.setItem("user", JSON.stringify(loginUser));
        toast.success("Login successful");
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500">Log in to your account</p>

        {error && (
          <p className="text-red-500 bg-red-100 p-2 mt-3 rounded-md text-center">
            {error}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-9 right-4 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            disabled={!email || !password}
          >
            Log in
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
