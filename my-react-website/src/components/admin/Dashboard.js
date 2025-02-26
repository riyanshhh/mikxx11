import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/Dashboard.css';

function Dashboard() {
  const [models, setModels] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('models');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalModels: 0,
    activeModels: 0,
    pendingApplications: 0,
    upcomingBookings: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [websiteContent, setWebsiteContent] = useState({
    heroSection: {
      title: 'MIKXX MODELING AGENCY',
      subtitle: 'Discover the Next Face of Fashion',
      backgroundImage: ''
    },
    featuredModels: [],
    services: [
      {
        title: 'Model Management',
        description: 'Professional representation and career guidance',
        icon: 'fas fa-camera'
      },
      {
        title: 'Talent Scouting',
        description: 'Discovering and developing new modeling talent',
        icon: 'fas fa-users'
      },
      {
        title: 'Booking Services',
        description: 'Connecting models with top brands and events',
        icon: 'fas fa-star'
      }
    ]
  });
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const userDoc = await getDocs(doc(db, 'admins', user.uid));
      if (!userDoc.exists()) {
        navigate('/');
        return;
      }
    };

    checkAdmin();
    loadData();
    loadDashboardData();
    loadWebsiteContent();
  }, [navigate]);

  const loadData = async () => {
    try {
      // Load models
      const modelsSnapshot = await getDocs(collection(db, 'models'));
      const modelsData = modelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setModels(modelsData);

      // Load applications
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Get models stats
      const modelsSnapshot = await getDocs(collection(db, 'models'));
      const models = modelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get recent applications
      const applicationsQuery = query(
        collection(db, 'applications'),
        orderBy('createdAt', 'desc'),
        where('status', '==', 'pending')
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applications = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get upcoming bookings
      const today = new Date();
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('date', '>=', today.toISOString()),
        orderBy('date', 'asc')
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStats({
        totalModels: models.length,
        activeModels: models.filter(model => model.status === 'active').length,
        pendingApplications: applications.length,
        upcomingBookings: bookings.length
      });

      setRecentApplications(applications.slice(0, 5));
      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadWebsiteContent = async () => {
    try {
      const websiteDocRef = doc(db, 'website', 'content');
      const websiteDocSnap = await getDoc(websiteDocRef);
      
      if (websiteDocSnap.exists()) {
        setWebsiteContent(websiteDocSnap.data());
      } else {
        await setDoc(websiteDocRef, websiteContent);
      }
    } catch (error) {
      console.error('Error loading website content:', error);
    }
  };

  const handleStatusUpdate = async (id, collection, newStatus) => {
    try {
      await updateDoc(doc(db, collection, id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id, collection) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collection, id));
        loadData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleContentChange = (section, field, value) => {
    setWebsiteContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...websiteContent.services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    setWebsiteContent(prev => ({
      ...prev,
      services: updatedServices
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      const storageRef = ref(storage, `website/hero-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      handleContentChange('heroSection', 'backgroundImage', url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const saveWebsiteContent = async () => {
    setSaving(true);
    try {
      const websiteDocRef = doc(db, 'website', 'content');
      await setDoc(websiteDocRef, websiteContent);
      setEditingSection(null);
      console.log('Content saved successfully');
    } catch (error) {
      console.error('Error saving website content:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-users"></i>
          <div className="stat-content">
            <h3>Total Models</h3>
            <p>{stats.totalModels}</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-user-check"></i>
          <div className="stat-content">
            <h3>Active Models</h3>
            <p>{stats.activeModels}</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-file-alt"></i>
          <div className="stat-content">
            <h3>Pending Applications</h3>
            <p>{stats.pendingApplications}</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-calendar-check"></i>
          <div className="stat-content">
            <h3>Upcoming Bookings</h3>
            <p>{stats.upcomingBookings}</p>
          </div>
        </div>
      </div>

      <div className="website-editor">
        <h2>Website Content Editor</h2>
        
        <div className="editor-section">
          <div className="section-header">
            <h3>Hero Section</h3>
            <button onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}>
              {editingSection === 'hero' ? 'Close' : 'Edit'}
            </button>
          </div>
          
          {editingSection === 'hero' && (
            <div className="section-editor">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={websiteContent.heroSection.title}
                  onChange={(e) => handleContentChange('heroSection', 'title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={websiteContent.heroSection.subtitle}
                  onChange={(e) => handleContentChange('heroSection', 'subtitle', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Background Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
                {websiteContent.heroSection.backgroundImage && (
                  <img 
                    src={websiteContent.heroSection.backgroundImage} 
                    alt="Hero Background" 
                    className="preview-image"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="editor-section">
          <div className="section-header">
            <h3>Services</h3>
            <button onClick={() => setEditingSection(editingSection === 'services' ? null : 'services')}>
              {editingSection === 'services' ? 'Close' : 'Edit'}
            </button>
          </div>
          
          {editingSection === 'services' && (
            <div className="section-editor">
              {websiteContent.services.map((service, index) => (
                <div key={index} className="service-editor">
                  <h4>Service {index + 1}</h4>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon (FontAwesome class)</label>
                    <input
                      type="text"
                      value={service.icon}
                      onChange={(e) => handleServiceChange(index, 'icon', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(editingSection === 'hero' || editingSection === 'services') && (
          <div className="editor-actions">
            <button 
              onClick={saveWebsiteContent}
              disabled={saving}
              className="save-button"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recent Applications</h3>
          {recentApplications.length > 0 ? (
            <div className="list">
              {recentApplications.map(app => (
                <div key={app.id} className="list-item">
                  <div>
                    <h4>{app.name}</h4>
                    <p>{app.email}</p>
                  </div>
                  <span className="status pending">{app.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No pending applications</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Upcoming Bookings</h3>
          {recentBookings.length > 0 ? (
            <div className="list">
              {recentBookings.map(booking => (
                <div key={booking.id} className="list-item">
                  <div>
                    <h4>{booking.modelName}</h4>
                    <p>{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`status ${booking.status}`}>{booking.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No upcoming bookings</p>
          )}
        </div>
      </div>

      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'models' ? 'active' : ''} 
            onClick={() => setActiveTab('models')}
          >
            Models
          </button>
          <button 
            className={activeTab === 'applications' ? 'active' : ''} 
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
        </div>

        {activeTab === 'models' && (
          <div className="models-table">
            <h2>Models List</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map(model => (
                  <tr key={model.id}>
                    <td>{model.displayName}</td>
                    <td>{model.category}</td>
                    <td>
                      <select
                        value={model.status}
                        onChange={(e) => handleStatusUpdate(model.id, 'models', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => navigate(`/admin/models/${model.id}`)}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(model.id, 'models')}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-table">
            <h2>Model Applications</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(application => (
                  <tr key={application.id}>
                    <td>{application.name}</td>
                    <td>{application.email}</td>
                    <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusUpdate(application.id, 'applications', e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => navigate(`/admin/applications/${application.id}`)}>
                        View
                      </button>
                      <button onClick={() => handleDelete(application.id, 'applications')}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 