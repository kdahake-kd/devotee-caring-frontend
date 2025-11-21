import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FloatingMessages } from './SpiritualAnimations';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="home-container">
      <FloatingMessages />
      
      {/* Top Navigation Bar */}
      <div className="home-navbar">
        {!user && (
          <>
            <Link to="/login" className="nav-btn nav-login">Login</Link>
            <Link to="/register" className="nav-btn nav-register">Register</Link>
          </>
        )}
        {!user && (
          <Link to="/admin/login" className="nav-btn nav-admin">Admin</Link>
        )}
        {user && (
          <Link 
            to={user.is_staff || user.is_superuser ? "/admin/dashboard" : "/dashboard"} 
            className="nav-btn nav-dashboard"
          >
            Dashboard
          </Link>
        )}
      </div>
      
      {/* Animated Background */}
      <div className="home-background">
        <div className="colorful-circle circle-1"></div>
        <div className="colorful-circle circle-2"></div>
        <div className="colorful-circle circle-3"></div>
        <div className="colorful-circle circle-4"></div>
        <div className="colorful-circle circle-5"></div>
      </div>

      {/* Main Content */}
      <div className="home-content">
        <div className="home-header">
          <div className="krishna-icon">
            <img src="/images/iskcon-logo.png" alt="ISKCON Logo" className="iskcon-logo" />
          </div>
          <h1 className="home-title">
            <span className="title-line-1">Hare Krishna</span>
            <span className="title-line-2">Devotee Caring System</span>
          </h1>
          <p className="home-subtitle">
            Track Your Spiritual Journey with Love and Devotion
          </p>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards">
          <div 
            className="feature-card card-1" 
            onClick={() => {
              if (user) {
                navigate(user.is_staff || user.is_superuser ? '/admin/dashboard' : '/dashboard');
              } else {
                navigate('/login');
              }
            }}
          >
            <div className="card-icon">📿</div>
            <h3>Daily Activities</h3>
            <p>Track your daily hearing, reading, and chanting</p>
            <div className="card-glow"></div>
          </div>

          <div 
            className="feature-card card-2" 
            onClick={() => {
              if (user) {
                navigate(user.is_staff || user.is_superuser ? '/admin/dashboard' : '/dashboard');
              } else {
                navigate('/login');
              }
            }}
          >
            <div className="card-icon">📅</div>
            <h3>Weekly Progress</h3>
            <p>Monitor your weekly spiritual activities</p>
            <div className="card-glow"></div>
          </div>

          <div 
            className="feature-card card-3" 
            onClick={() => {
              if (user) {
                navigate(user.is_staff || user.is_superuser ? '/admin/dashboard' : '/dashboard');
              } else {
                navigate('/login');
              }
            }}
          >
            <div className="card-icon">📊</div>
            <h3>Monthly Reports</h3>
            <p>View comprehensive monthly summaries</p>
            <div className="card-glow"></div>
          </div>

          <div 
            className="feature-card card-4" 
            onClick={() => {
              if (user) {
                navigate(user.is_staff || user.is_superuser ? '/admin/dashboard' : '/dashboard');
              } else {
                navigate('/login');
              }
            }}
          >
            <div className="card-icon">🎯</div>
            <h3>Track Goals</h3>
            <p>Set and achieve your spiritual goals</p>
            <div className="card-glow"></div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-elements">
          <div className="floating-symbol symbol-1">
            <img src="/images/iskcon-logo.png" alt="ISKCON Logo" className="floating-logo" />
          </div>
          <div className="floating-symbol symbol-2">
            <img src="/images/iskcon-logo.png" alt="ISKCON Logo" className="floating-logo" />
          </div>
          <div className="floating-symbol symbol-3">
            <img src="/images/iskcon-logo.png" alt="ISKCON Logo" className="floating-logo" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="home-footer">
        <p>May Lord Krishna Bless Your Spiritual Journey</p>
        <div className="footer-decoration">✨</div>
      </div>
    </div>
  );
};

export default Home;

