import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user found');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Query admins collection
        const adminsRef = collection(db, 'admins');
        const adminQuery = query(adminsRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(adminQuery);
        
        console.log('Checking admin status for:', user.email);
        console.log('Admin exists:', !querySnapshot.empty);
        console.log('User ID:', user.uid);

        setIsAdmin(!querySnapshot.empty);
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        marginTop: '64px' 
      }}>
        <div>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
          Checking admin access...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('Not an admin, redirecting to login');
    return <Navigate to="/login" />;
  }

  return children;
}

export default AdminRoute; 