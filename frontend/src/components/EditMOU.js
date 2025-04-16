import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

function EditMOU() {
  const { index } = useParams();
  const navigate = useNavigate();
  const [mou, setMou] = useState({});

  useEffect(() => {
    const data = localStorage.getItem('editData');
    if (data) {
      setMou(JSON.parse(data));
    }
  }, []);

  const handleChange = e => setMou({ ...mou, [e.target.name]: e.target.value });

  const handleUpdate = async e => {
    e.preventDefault();
    const all = await axios.get('http://localhost:5000/api/mou/filter');
    all.data[index] = mou;
    await axios.post('http://localhost:5000/api/mou/overwrite', all.data);
    alert('MOU updated!');
    navigate('/search');
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h2>Edit MOU</h2>
        <form className="mou-form" onSubmit={handleUpdate}>
          {Object.keys(mou).map(key => (
            <input
              key={key}
              name={key}
              placeholder={key}
              value={mou[key]}
              onChange={handleChange}
              required
            />
          ))}
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
}

export default EditMOU;
