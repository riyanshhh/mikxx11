import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../styles/Blog.css';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      let postsQuery;
      if (selectedCategory === 'all') {
        postsQuery = query(
          collection(db, 'blog'),
          where('status', '==', 'published')
        );
      } else {
        postsQuery = query(
          collection(db, 'blog'),
          where('status', '==', 'published'),
          where('category', '==', selectedCategory)
        );
      }

      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Post data:', data); // Debug log
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate()
        };
      });
      
      console.log('Loaded posts:', postsData); // Debug log
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'fashion', 'lifestyle', 'industry', 'events'];

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>Our Blog</h1>
        <p>Latest news and insights from the fashion industry</p>
      </div>

      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : (
        <div className="blog-grid">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="blog-card">
                <div className="blog-image">
                  <img src={post.image || 'https://via.placeholder.com/400x250'} alt={post.title} />
                </div>
                <div className="blog-content">
                  <span className="category-tag">{post.category}</span>
                  <h2>{post.title}</h2>
                  <p>{post.content.substring(0, 150)}...</p>
                  <div className="blog-meta">
                    <span className="date">
                      {post.createdAt?.toLocaleDateString() || 'No date'}
                    </span>
                    <Link to={`/blog/${post.id}`} className="read-more">
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts">
              <h3>No posts found</h3>
              <p>Check back later for new content!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Blog; 