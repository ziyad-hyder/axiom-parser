import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments } from '../api/client';

export default function HistoryPage() {
    const [documents, setDocuments] = useState(null);

    useEffect(() => {
        getDocuments().then(setDocuments).catch(console.error);
    }, []);

    if (documents === null) {
        return (
            <div className="history-container">
                <h2>Document History</h2>
                <div className="history-list">
                    <div className="history-card" style={{ height: '80px' }}>
                        <div className="skeleton skeleton-title" style={{ width: '200px', margin: 0 }}></div>
                    </div>
                    <div className="history-card" style={{ height: '80px' }}>
                        <div className="skeleton skeleton-title" style={{ width: '150px', margin: 0 }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="history-container">
            <h2>Document History</h2>
            
            {documents.length === 0 ? (
                <div className="empty-state" style={{ background: 'var(--brand-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--brand-border)' }}>
                    <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <h3>No documents yet</h3>
                    <p>Upload a document to start extracting insights.</p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--spacing-3)' }}>Upload Document</Link>
                </div>
            ) : (
                <div className="history-list">
                    {documents.map(doc => {
                        const fileExt = doc.filename.split('.').pop() || 'doc';
                        const date = new Date(doc.uploaded_at).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit'
                        });
                        
                        return (
                            <Link to={`/dashboard/${doc.id}`} className="history-card" key={doc.id}>
                                <div className="history-info">
                                    <div className="history-filename">{doc.filename}</div>
                                    <div className="history-meta">
                                        <span className="badge badge-default">{fileExt}</span>
                                        <span>Uploaded on {date}</span>
                                    </div>
                                </div>
                                <div className="btn btn-secondary">Open</div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
