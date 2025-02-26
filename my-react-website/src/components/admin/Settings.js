import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import '../../styles/admin/Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    agencyName: '',
    email: '',
    phone: '',
    address: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    },
    notifications: {
      emailNotifications: true,
      applicationAlerts: true,
      bookingAlerts: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'agency'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await updateDoc(doc(db, 'settings', 'agency'), settings);
      setMessage('Settings saved successfully');
    } catch (error) {
      setMessage('Error saving settings: ' + error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser;
      await updatePassword(user, passwordForm.newPassword);
      setMessage('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage('Error updating password: ' + error.message);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="settings-tabs">
        <button 
          className={activeTab === 'general' ? 'active' : ''} 
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={activeTab === 'notifications' ? 'active' : ''} 
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={activeTab === 'security' ? 'active' : ''} 
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="general-settings">
            <div className="form-group">
              <label>Agency Name</label>
              <input
                type="text"
                value={settings.agencyName}
                onChange={(e) => handleSettingChange('general', 'agencyName', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingChange('general', 'email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleSettingChange('general', 'phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
              />
            </div>

            <h3>Social Media</h3>
            <div className="form-group">
              <label>Instagram</label>
              <input
                type="text"
                value={settings.socialMedia.instagram}
                onChange={(e) => handleSettingChange('socialMedia', 'instagram', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Facebook</label>
              <input
                type="text"
                value={settings.socialMedia.facebook}
                onChange={(e) => handleSettingChange('socialMedia', 'facebook', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Twitter</label>
              <input
                type="text"
                value={settings.socialMedia.twitter}
                onChange={(e) => handleSettingChange('socialMedia', 'twitter', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notification-settings">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                />
                Email Notifications
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.applicationAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'applicationAlerts', e.target.checked)}
                />
                New Application Alerts
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.bookingAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'bookingAlerts', e.target.checked)}
                />
                Booking Alerts
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-settings">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                />
              </div>

              <button type="submit">Update Password</button>
            </form>
          </div>
        )}

        <div className="settings-actions">
          <button onClick={handleSaveSettings} className="save-btn">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings; 