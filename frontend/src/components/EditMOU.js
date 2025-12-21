import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mouAPI } from '../utils/api';
import Navbar from './Navbar';

function EditMOU() {
  const { index } = useParams();
  const navigate = useNavigate();
  const [mou, setMou] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('editData');
    if (data) {
      setMou(JSON.parse(data));
    }
  }, []);

  const handleChange = e => {
    setMou({ ...mou, [e.target.name]: e.target.value });
    setError('');
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const all = await mouAPI.filter({});
      all[index] = mou;
      await mouAPI.overwrite(all);
      alert('MOU updated successfully!');
      navigate('/search');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Failed to update MOU');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h2>Edit MOU</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form className="mou-form" onSubmit={handleUpdate}>
          {Object.keys(mou).map(key => (
            <input
              key={key}
              name={key}
              placeholder={key}
              value={mou[key]}
              onChange={handleChange}
              required
              disabled={loading}
            />
          ))}
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditMOU;
