import React, { useState, useEffect } from 'react';
import { auth, storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    location: '',
    phone: '',
    experience: '',
    height: '',
    measurements: '',
    instagram: ''
  });
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        setPhotoURL(user.photoURL || '/default-avatar.png');
        await loadUserProfile(user.uid);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(prev => ({
          ...prev,
          ...data,
          displayName: auth.currentUser.displayName || data.displayName
        }));
      } else {
        setProfileData(prev => ({
          ...prev,
          displayName: auth.currentUser.displayName || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB
        setError('Photo must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload new photo if selected
      if (photoFile) {
        const photoRef = ref(storage, `profile-photos/${user.uid}`);
        await uploadBytes(photoRef, photoFile);
        const photoURL = await getDownloadURL(photoRef);
        await updateProfile(auth.currentUser, { photoURL });
      }

      // Update display name in Firebase Auth
      if (profileData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName
        });
      }

      // Save profile data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        updatedAt: new Date().toISOString()
      });

      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {error && <div className="error-message">{error}</div>}
        
        <div className="profile-header">
          <div className="profile-photo-container">
            <img 
              src={photoURL} 
              alt="Profile" 
              className="profile-photo" 
            />
            {editing && (
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
              />
            )}
          </div>
          
          {!editing ? (
            <button 
              onClick={() => setEditing(true)} 
              className="edit-button"
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-buttons">
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="save-button"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => setEditing(false)} 
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="displayName"
                value={profileData.displayName}
                onChange={handleInputChange}
                disabled={!editing}
                required
              />
            </div>

            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label>Height:</label>
              <input
                type="text"
                name="height"
                value={profileData.height}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="e.g., 5'10"
              />
            </div>

            <div className="form-group">
              <label>Measurements:</label>
              <input
                type="text"
                name="measurements"
                value={profileData.measurements}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="e.g., 32-24-34"
              />
            </div>

            <div className="form-group">
              <label>Instagram:</label>
              <input
                type="text"
                name="instagram"
                value={profileData.instagram}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Experience:</label>
            <textarea
              name="experience"
              value={profileData.experience}
              onChange={handleInputChange}
              disabled={!editing}
              rows="4"
            />
          </div>

          <div className="form-group full-width">
            <label>Bio:</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              disabled={!editing}
              rows="4"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile; 