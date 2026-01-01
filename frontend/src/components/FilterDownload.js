import React, { useState } from 'react';
import { mouAPI } from '../utils/api';
import * as XLSX from 'xlsx';
import Navbar from './Navbar';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastContainer';
import '../styles/FilterDownload.css';

function FilterDownload() {
  const { showToast } = useToast();
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const data = await mouAPI.getAll(page, 50, filters);
      setResults(data.mous || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 });
      if (data.mous && data.mous.length > 0) {
        showToast(`Found ${data.mous.length} MOU(s)`, 'success', 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        showToast(error.response.data.error || 'Failed to search MOUs', 'error');
      } else {
        showToast('Network error. Please try again.', 'error');
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
    showToast('Excel file exported successfully!', 'success');
  };

  const handleEdit = (id) => {
    window.location.href = `/edit/${id}`;
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this MOU record?')) {
      setLoading(true);
      try {
        await mouAPI.delete(id);
        showToast('MOU deleted successfully!', 'success');
        // Refresh the list
        handleSearch(pagination.page);
      } catch (error) {
        if (error.response && error.response.data) {
          showToast(error.response.data.error || 'Failed to delete record', 'error');
        } else {
          showToast('Network error. Please try again.', 'error');
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
        <div className="filter-inputs">
          <input name="academicYear" placeholder="Academic Year" onChange={handleChange} disabled={loading} />
          <input name="faculty" placeholder="Faculty" onChange={handleChange} disabled={loading} />
          <select name="status" onChange={handleChange} disabled={loading} defaultValue="">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
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

        {loading && <LoadingSpinner size="medium" message="Loading MOUs..." />}

        <div className="table-container">
          {!loading && results.length > 0 ? (
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
                    <td data-label="MOU ID">{row.mou_id}</td>
                    <td data-label="Institute">{row.institute}</td>
                    <td data-label="Contact Person">{row.contact_person}</td>
                    <td data-label="Faculty">{row.faculty}</td>
                    <td data-label="Academic Year">{row.academic_year}</td>
                    <td data-label="Start Date">{formatDate(row.start_date)}</td>
                    <td data-label="Expiry Date">{formatDate(row.expiry_date)}</td>
                    <td data-label="Duration">{row.duration} years</td>
                    <td data-label="Status">
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
                    <td data-label="Actions" className="action-buttons">
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
          ) : !loading && (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No results found. Click "Search" to load MOUs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterDownload;
