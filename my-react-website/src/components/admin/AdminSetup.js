import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminUser } from '../../utils/adminSetup';

function AdminSetup() {
  const [email, setEmail] = useState('ahlawatgod@gmail.com');
  const [password, setPassword] = useState('vinni2611');
  const [displayName, setDisplayName] = useState('riyansh123');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-create admin on component mount
    handleSubmit();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage('Creating admin account...');

    try {
      const result = await createAdminUser(email, password, displayName);
      setMessage(result.message);
      
      if (result.success) {
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
    } catch (error) {
      setMessage('Error creating admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '80px auto' }}>
      <h2>Creating Admin User</h2>
      {message && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem',
          backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: message.includes('successfully') ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
      <div style={{ marginBottom: '1rem' }}>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Display Name:</strong> {displayName}</p>
        <p><strong>Status:</strong> {loading ? 'Creating...' : 'Ready'}</p>
      </div>
      {!loading && !message.includes('successfully') && (
        <button 
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry Creation
        </button>
      )}
    </div>
  );
}

export default AdminSetup; 