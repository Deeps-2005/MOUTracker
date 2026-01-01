import React, { useState } from 'react';
import { mouAPI } from '../utils/api';
import * as XLSX from 'xlsx';
import Navbar from './Navbar';
import '../styles/FilterDownload.css';

function FilterDownload() {
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await mouAPI.getAll(page, 50, filters);
      setResults(data.mous || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 });
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Failed to search MOUs');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    // Map MySQL field names to readable headers
    const exportData = results.map(mou => ({
      'MOU ID': mou.mou_id,
      'Institute': mou.institute,
      'Contact Person': mou.contact_person,
      'Email': mou.email,
      'Phone': mou.phone,
      'Faculty': mou.faculty,
      'Department': mou.department,
      'Academic Year': mou.academic_year,
      'Start Date': new Date(mou.start_date).toLocaleDateString(),
      'Duration (Years)': mou.duration,
      'Expiry Date': new Date(mou.expiry_date).toLocaleDateString(),
      'Purpose': mou.purpose,
      'Expected Outcome': mou.expected_outcome,
      'Status': mou.status,
      'Signed Document': mou.signed_document || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MOU Results");

    XLSX.writeFile(workbook, "Filtered_MOU_Results.xlsx");
  };

  const handleEdit = (id) => {
    window.location.href = `/edit/${id}`;
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this MOU record?')) {
      setLoading(true);
      setError('');
      try {
        await mouAPI.delete(id);
        alert('MOU deleted successfully!');
        // Refresh the list
        handleSearch(pagination.page);
      } catch (error) {
        if (error.response && error.response.data) {
          setError(error.response.data.error || 'Failed to delete record');
        } else {
          setError('Network error. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div>
      <Navbar />
      <div className="filter-container">
        <h3>Filter, Edit, Manage & Export MOU Data</h3>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <div className="filter-inputs">
          <input name="academicYear" placeholder="Academic Year" onChange={handleChange} disabled={loading} />
          <input name="faculty" placeholder="Faculty" onChange={handleChange} disabled={loading} />
          <input name="status" placeholder="Status (active/expired)" onChange={handleChange} disabled={loading} />
          <input name="search" placeholder="Search (Institute/Contact/MOU ID)" onChange={handleChange} disabled={loading} />
          <button onClick={() => handleSearch(1)} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          {results.length > 0 && (
            <button onClick={handleExportExcel} className="excel-button">Export to Excel</button>
          )}
        </div>

        {pagination.total > 0 && (
          <div style={{ margin: '10px 0', textAlign: 'center' }}>
            <p>Showing {results.length} of {pagination.total} MOUs (Page {pagination.page} of {pagination.totalPages})</p>
            <div>
              <button 
                onClick={() => handleSearch(pagination.page - 1)} 
                disabled={pagination.page === 1 || loading}
              >
                Previous
              </button>
              <span style={{ margin: '0 10px' }}>Page {pagination.page}</span>
              <button 
                onClick={() => handleSearch(pagination.page + 1)} 
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="table-container">
          {results.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>MOU ID</th>
                  <th>Institute</th>
                  <th>Contact Person</th>
                  <th>Faculty</th>
                  <th>Academic Year</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.id} className="result-row">
                    <td>{row.mou_id}</td>
                    <td>{row.institute}</td>
                    <td>{row.contact_person}</td>
                    <td>{row.faculty}</td>
                    <td>{row.academic_year}</td>
                    <td>{formatDate(row.start_date)}</td>
                    <td>{formatDate(row.expiry_date)}</td>
                    <td>{row.duration} years</td>
                    <td>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '3px', 
                        backgroundColor: row.status === 'active' ? '#4CAF50' : '#f44336',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => handleEdit(row.id)} className="edit-btn" disabled={loading} title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(row.id)} className="delete-btn" disabled={loading} title="Delete">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No results found. {!loading && 'Click "Search" to load MOUs.'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterDownload;
