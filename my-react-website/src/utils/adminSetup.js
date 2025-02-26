import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const createAdminUser = async (email, password, displayName) => {
  try {
    // Create the user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add the user to the admins collection in Firestore
    const adminData = {
      email: email,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'admins', user.uid), adminData);
    
    return {
      success: true,
      message: 'Admin user created successfully'
    };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return {
      success: false,
      message: error.message
    };
  }
}; 