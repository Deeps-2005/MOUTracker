import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import '../styles/AuthForm.css';

function Register() {
  const [data, setData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authAPI.register(data);
      alert('Registered successfully! Please login.');
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          // Display validation errors
          const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(error.response.data.message || 'Registration failed');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="auth-container">
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Register</h2>
      {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <input 
        name="email" 
        type="email" 
        placeholder="Email" 
        value={data.email}
        onChange={handleChange} 
        required 
        disabled={loading}
      />
      <input 
        name="password" 
        type="password" 
        placeholder="Password (min 6 chars, uppercase, lowercase, number)" 
        value={data.password}
        onChange={handleChange} 
        required 
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      <p>Already have an account? <Link to="/">Login here</Link></p>
    </form>
  </div>
);

}

export default Register;
