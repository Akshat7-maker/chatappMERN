import React, { useState } from "react";
import useLoder from "../../customHooks/loader";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_BASE_URL from "../../configApi/ApiBaseUrl";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
  });
  const [coverPic, setCoverPic] = useState(null);
  const [loding, error, withLoder] = useLoder();

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCoverPic(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("profilePic", coverPic);

    withLoder(async () => {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/user/register`,
        formDataToSend
      );

      if (data.statusCode === 201) {
        toast.success(data.message);
        navigate("/login");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Create an Account 🚀
        </h2>
        <p className="text-center text-gray-500">Sign up to get started</p>

        {error && (
          <p className="text-red-500 bg-red-100 p-2 mt-3 rounded-md text-center">
            {error}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Gender</label>
            <select
              name="gender"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">
              Profile Picture (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              onChange={handleFileChange}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            disabled={!formData.name || !formData.email || !formData.password || !formData.gender}
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 font-semibold">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
