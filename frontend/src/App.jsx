import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <nav className="navbar">
            <Link to="/" className="nav-brand">Axiom Parser</Link>
            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>Upload</NavLink>
                <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>History</NavLink>
            </div>
        </nav>
        
        <main className="content">
            <Routes>
                <Route path="/" element={<UploadPage />} />
                <Route path="/dashboard/:id" element={<DashboardPage />} />
                <Route path="/history" element={<HistoryPage />} />
            </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
