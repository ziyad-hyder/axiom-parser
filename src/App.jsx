import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <nav className="navbar">
            <div className="nav-brand">DocuSense</div>
            <div className="nav-links">
                <Link to="/">Upload</Link>
                <Link to="/history">History</Link>
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
