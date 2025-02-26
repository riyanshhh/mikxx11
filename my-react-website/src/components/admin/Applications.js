import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import '../../styles/admin/Applications.css';

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', appId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (appId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteDoc(doc(db, 'applications', appId));
        loadApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="applications-management">
      <div className="applications-header">
        <h2>Model Applications</h2>
        <div className="status-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter(app => app.status === 'pending').length})
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''} 
            onClick={() => setFilter('approved')}
          >
            Approved ({applications.filter(app => app.status === 'approved').length})
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''} 
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applications.filter(app => app.status === 'rejected').length})
          </button>
        </div>
      </div>

      <div className="applications-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Height</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map(app => (
              <tr key={app.id}>
                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                <td>{app.name}</td>
                <td>{app.email}</td>
                <td>{app.age}</td>
                <td>{app.height}</td>
                <td>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    style={{ color: getStatusColor(app.status) }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="view-btn"
                    onClick={() => setSelectedApp(app)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(app.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <div className="application-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Application Details</h3>
              <button onClick={() => setSelectedApp(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Name:</label>
                <span>{selectedApp.name}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedApp.email}</span>
              </div>
              <div className="detail-row">
                <label>Phone:</label>
                <span>{selectedApp.phone}</span>
              </div>
              <div className="detail-row">
                <label>Age:</label>
                <span>{selectedApp.age}</span>
              </div>
              <div className="detail-row">
                <label>Height:</label>
                <span>{selectedApp.height}</span>
              </div>
              <div className="detail-row">
                <label>Experience:</label>
                <span>{selectedApp.experience}</span>
              </div>
              <div className="detail-row">
                <label>Message:</label>
                <p>{selectedApp.message}</p>
              </div>
              {selectedApp.photoUrl && (
                <div className="photos-section">
                  <label>Photos:</label>
                  <img src={selectedApp.photoUrl} alt="Applicant" />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <select
                value={selectedApp.status}
                onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button onClick={() => setSelectedApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Applications; 