import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../context/authContext";
import { login as loginApi }
    from "../../services/authService";

import "./Login.css";


function Login() {

    const navigate = useNavigate();

    const {
        login: authLogin
    } = useAuth();


    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });


    const [loading, setLoading] =
        useState(false);


    const handleChange = (e) => {

        setFormData({
            ...formData,

            [e.target.name]:
                e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();


        if (
            !formData.email.trim() ||
            !formData.password
        ) {

            toast.warning(
                "Please enter email and password."
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await loginApi(formData);


            // =================================
            // BACKEND RETURNS FLAT OBJECT
            // =================================

            localStorage.setItem(
                "token",
                response.token
            );


            authLogin({

                id: response.id,

                name: response.name,

                email: response.email,

                roles:
                    response.roles ?? [],

                permissions:
                    response.permissions ?? []

            });


            toast.success(
                "Login successful."
            );


            navigate(
                "/dashboard",
                { replace: true }
            );


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            toast.error(
                error?.message ??
                "Invalid email or password."
            );

        } finally {

            setLoading(false);

        }
    };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="overlay">
          <h1>ERP Management System</h1>
          <p>
            Manage Employees, Projects, Tasks, Roles and Reports from one
            secure dashboard.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

          <h2>Welcome Back</h2>
          <p className="subtitle">
            Sign in to continue
          </p>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Login"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}

export default Login;