import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import '../../styles/admin/Models.css';

function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    age: '',
    height: '',
    measurements: '',
    experience: '',
    category: 'fashion',
    status: 'active',
    photos: []
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'models'));
      const modelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (files) => {
    const uploadedUrls = [];
    for (const file of files) {
      const storageRef = ref(storage, `models/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const photoUrls = await handlePhotoUpload(newModel.photos);
      
      const modelData = {
        ...newModel,
        photos: photoUrls,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'models'), modelData);
      setShowAddModal(false);
      setNewModel({
        name: '',
        age: '',
        height: '',
        measurements: '',
        experience: '',
        category: 'fashion',
        status: 'active',
        photos: []
      });
      loadModels();
    } catch (error) {
      console.error('Error adding model:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModel = async (modelId, updates) => {
    try {
      await updateDoc(doc(db, 'models', modelId), updates);
      loadModels();
    } catch (error) {
      console.error('Error updating model:', error);
    }
  };

  const handleDeleteModel = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        const modelDoc = models.find(m => m.id === modelId);
        
        // Delete photos from storage
        for (const photoUrl of modelDoc.photos) {
          const photoRef = ref(storage, photoUrl);
          await deleteObject(photoRef);
        }
        
        // Delete model document
        await deleteDoc(doc(db, 'models', modelId));
        loadModels();
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const filteredModels = models.filter(model => {
    if (filter === 'all') return true;
    return model.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading models...</span>
      </div>
    );
  }

  return (
    <div className="models-management">
      <div className="models-header">
        <h2>Models Management</h2>
        <button className="add-model-btn" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i> Add New Model
        </button>
      </div>

      <div className="models-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Models
        </button>
        <button 
          className={filter === 'active' ? 'active' : ''} 
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={filter === 'inactive' ? 'active' : ''} 
          onClick={() => setFilter('inactive')}
        >
          Inactive
        </button>
      </div>

      <div className="models-grid">
        {filteredModels.map(model => (
          <div key={model.id} className="model-card">
            <img src={model.photos[0]} alt={model.name} />
            <div className="model-info">
              <h3>{model.name}</h3>
              <div className="model-stats">
                <span>{model.age} years</span>
                <span>{model.height}</span>
                <span>{model.category}</span>
              </div>
              <select
                value={model.status}
                onChange={(e) => handleUpdateModel(model.id, { status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="model-actions">
                <button onClick={() => setSelectedModel(model)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteModel(model.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Model</h3>
              <button onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddModel}>
              {/* Form fields */}
            </form>
          </div>
        </div>
      )}

      {selectedModel && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Model</h3>
              <button onClick={() => setSelectedModel(null)}>×</button>
            </div>
            {/* Edit form */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Models; 