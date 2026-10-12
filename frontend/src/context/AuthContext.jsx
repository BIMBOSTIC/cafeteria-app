import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';
import { registerFCMToken } from '../services/notifications';
import { toast } from 'react-toastify';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
    }

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('firebaseToken', token);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Student Registration
  const registerStudent = async (studentData) => {
    try {
      setLoading(true);

      // Register in backend
      const response = await api.post('/auth/student/register', studentData);

      if (response.data.success) {
        const { user: userData, token } = response.data;

        // Store user data and token
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);

        setUser(userData);
        setIsAdmin(false);

        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Student Login
  const loginStudent = async (studentId, password) => {
    try {
      setLoading(true);

      const response = await api.post('/auth/student/login', { studentId, password });

      if (response.data.success) {
        const { user: userData, token } = response.data;

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);

        setUser(userData);
        setIsAdmin(false);

        // Register FCM token for push notifications (non-blocking)
        registerFCMToken();

        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Admin Login
  const loginAdmin = async (username, password) => {
    try {
      setLoading(true);

      const response = await api.post('/auth/admin/login', { username, password });

      if (response.data.success) {
        const { admin: userData, token } = response.data;

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);

        setUser(userData);
        setIsAdmin(true);

        toast.success('Admin login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Sign out from Firebase if signed in
      if (auth.currentUser) {
        await signOut(auth);
      }

      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('firebaseToken');

      setUser(null);
      setIsAdmin(false);

      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    registerStudent,
    loginStudent,
    loginAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
