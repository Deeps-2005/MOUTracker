import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/AuthForm.css';

function Register() {
  const [data, setData] = useState({ email: '', password: '' });

  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', data);
      alert('Registered! Now login');
    } catch {
      alert('User already exists');
    }
  };


return (
  <div className="auth-container">
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Register</h2>
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Register</button>
      <p>Already have an account? <Link to="/">Login here</Link></p>
    </form>
  </div>
);

}

export default Register;
