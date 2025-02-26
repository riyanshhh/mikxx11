import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../../styles/admin/BlogPosts.css';

function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: '',
    category: 'fashion',
    status: 'draft'
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const postsSnapshot = await getDocs(collection(db, 'blog'));
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const storageRef = ref(storage, `blog/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = newPost.image;
      if (e.target.image.files[0]) {
        imageUrl = await handleImageUpload(e.target.image.files[0]);
      }

      const postData = {
        ...newPost,
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Saving post data:', postData);

      if (editingPost) {
        await updateDoc(doc(db, 'blog', editingPost.id), postData);
      } else {
        await addDoc(collection(db, 'blog'), postData);
      }

      setShowAddModal(false);
      setEditingPost(null);
      setNewPost({
        title: '',
        content: '',
        image: '',
        category: 'fashion',
        status: 'draft'
      });
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'blog', postId));
        loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  return (
    <div className="blog-management">
      <div className="blog-header">
        <h2>Blog Posts</h2>
        <button onClick={() => setShowAddModal(true)} className="add-post-btn">
          <i className="fas fa-plus"></i> New Post
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-image">
                <img src={post.image || 'https://via.placeholder.com/300x200'} alt={post.title} />
              </div>
              <div className="post-content">
                <h3>{post.title}</h3>
                <p>{post.content.substring(0, 100)}...</p>
                <div className="post-meta">
                  <span className={`status ${post.status}`}>{post.status}</span>
                  <span className="category">{post.category}</span>
                </div>
                <div className="post-actions">
                  <button onClick={() => {
                    setEditingPost(post);
                    setNewPost(post);
                    setShowAddModal(true);
                  }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(post.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingPost ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => {
                setShowAddModal(false);
                setEditingPost(null);
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  required
                  rows="10"
                />
              </div>

              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                >
                  <option value="fashion">Fashion</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="industry">Industry</option>
                  <option value="events">Events</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={newPost.status}
                  onChange={(e) => setNewPost({...newPost, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogPosts; 