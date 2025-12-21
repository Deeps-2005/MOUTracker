import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, auth } from '../utils/api';
import '../styles/AuthForm.css';

function Login() {
  const [data, setData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if already logged in
    if (auth.isAuthenticated()) {
      navigate('/home');
    }
  }, [navigate]);

  const handleChange = e => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(data);
      // Store token and user info
      auth.setToken(response.token);
      auth.setUser(response.user);
      navigate('/home');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Invalid credentials');
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
        <h2>Login</h2>
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
          placeholder="Password" 
          value={data.password}
          onChange={handleChange} 
          required 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </form>
    </div>
  );
}

export default Login;
