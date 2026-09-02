// src/pages/Register.jsx

import { registerUser } from "../api";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  


  const handleSubmit = async (e) => {
  e.preventDefault();
  

  
  setLoading(true);
  
  if(formData.password.length<4){
  alert("Password must be atleast 4 letters");
  setLoading(false);
  return;
  }
  
  

  if (formData.username.length > 10) {
  alert("Enter a valid username !! ");
  setLoading(false);
  return;
  
  }
  
  if (formData.password !== formData.confirmPassword) {
    alert('Passwords do not match ');
    setLoading(false);
    return;
  }

  if (!formData.username || !formData.password || !formData.email) {
    alert("Fill required fields ");
    setLoading(false);
    return;
  }
  



  try {
      const res = await registerUser(
        formData.username,
        formData.password,
        formData.email
      );

      // ✅ backend response check
      if (res.message) {
        alert("User registered successfully ");
        navigate('/login');
      } else if (res.error) {
        alert(res.error);
      } else {
        alert("Registration failed ");
      }

    } catch (err) {
      console.error(err);
      alert("Server error ");
    }
    
    setLoading(false);
  };
  
  return (
    
      

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-7">
            <div className="card shadow border-0">
              <div className="card-body p-5">
                <h2 className="text-center mb-4">Create Account</h2>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        className="form-control"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
   
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <button
  type="submit"
  className="btn btn-primary w-100"
  disabled={loading}
>
  {loading ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      Registering...
    </>
  ) : (
    "Register"
  )}
</button>
                </form>

                <p className="text-center mt-4 mb-0">
                  Already have an account?{' '}
                  <Link to="/login">Login Here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    
  );
}

export default Register;
