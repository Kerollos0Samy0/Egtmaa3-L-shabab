import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

import Projector from './pages/Projector';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <header style={{ backgroundColor: 'var(--dark-green)', padding: '1rem', color: 'white', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--accent-gold)' }}>نعمل جبانيوت؟</h1>
          <p>اجتماع يوسف الصديق للشباب</p>
        </header>
        <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/projector" element={<Projector />} />
          </Routes>
        </main>
        <footer style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '0.9rem' }}>
          <Link to="/admin" style={{ color: '#888', textDecoration: 'none' }}>لوحة الخدام</Link>
        </footer>
      </div>
    </Router>
  );
}

export default App;
