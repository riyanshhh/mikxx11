import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Profile from './components/Profile';
import Register from './components/Register';
import { auth } from './firebase';
import Dashboard from './components/admin/Dashboard';
import AdminRoute from './components/admin/AdminRoute';
import AdminSetup from './components/admin/AdminSetup';
import AdminLayout from './components/admin/AdminLayout';
import Models from './components/admin/Models';
import Applications from './components/admin/Applications';
import Bookings from './components/admin/Bookings';
import Settings from './components/admin/Settings';
import Home from './components/Home';
import BlogPosts from './components/admin/BlogPosts';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';

function App() {
  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="nav-menu">
            <div className="nav-left">
              <Link to="/" className="logo">MIKXX AGENCY</Link>
              <div className="nav-links">
                <Link to="/models">Models</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/services">Services</Link>
                <Link to="/become-a-model">Become a Model</Link>
                <Link to="/about">About Us</Link>
              </div>
            </div>
            <div className="nav-right">
              <div className="search-bar">
                <input type="text" placeholder="Search..." />
                <button className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
              {user ? (
                <>
                  <Link to="/profile" className="nav-icon" title="Profile">
                    <i className="fas fa-user"></i>
                  </Link>
                  <Link to="/admin" className="nav-icon" title="Admin Dashboard">
                    <i className="fas fa-cog"></i>
                  </Link>
                  <button onClick={handleLogout} className="nav-icon" title="Logout">
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-icon">
                    <i className="fas fa-user"></i>
                  </Link>
                  <Link to="/register" className="nav-icon">
                    <i className="fas fa-user-plus"></i>
                  </Link>
                </>
              )}
              <button 
                className="nav-icon cart-icon" 
                onClick={() => setCartOpen(!cartOpen)}
              >
                <i className="fas fa-shopping-cart"></i>
                <span className="cart-count">0</span>
              </button>
            </div>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="models" element={<Models />} />
                    <Route path="applications" element={<Applications />} />
                    <Route path="bookings" element={<Bookings />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="blog" element={<BlogPosts />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
          </Routes>
        </main>

        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h3>MIKXX AGENCY</h3>
              <p>Discovering and developing modeling talent since 2020.</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/models">Our Models</Link></li>
                <li><Link to="/become-a-model">Join Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Connect With Us</h3>
              <div className="social-links">
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 MIKXX AGENCY. All rights reserved.</p>
          </div>
        </footer>

        {cartOpen && (
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3>Your Cart</h3>
              <button onClick={() => setCartOpen(false)}>×</button>
            </div>
            <div className="cart-items">
              {/* Cart items will go here */}
              <p className="empty-cart">Your cart is empty</p>
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span>$0.00</span>
              </div>
              <button className="checkout-button">Checkout</button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
