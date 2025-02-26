import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/BlogPost.css';

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'blog', id));
        if (postDoc.exists()) {
          setPost({
            id: postDoc.id,
            ...postDoc.data(),
            createdAt: postDoc.data().createdAt?.toDate()
          });
        }
      } catch (error) {
        console.error('Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!post) return <div className="error">Post not found</div>;

  return (
    <div className="blog-post">
      <div className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span className="category">{post.category}</span>
          <span className="date">
            {post.createdAt?.toLocaleDateString()}
          </span>
        </div>
      </div>
      {post.image && (
        <div className="post-image">
          <img src={post.image} alt={post.title} />
        </div>
      )}
      <div className="post-content">
        <p>{post.content}</p>
      </div>
    </div>
  );
}

export default BlogPost; 