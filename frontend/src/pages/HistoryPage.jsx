import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments } from '../api/client';

export default function HistoryPage() {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        getDocuments().then(setDocuments).catch(console.error);
    }, []);

    return (
        <div className="history-container">
            <h2>Document History</h2>
            <ul className="history-list">
                {documents.map(doc => (
                    <li key={doc.id}>
                        <Link to={`/dashboard/${doc.id}`}>
                            {doc.filename} - Uploaded on {new Date(doc.uploaded_at).toLocaleString()}
                        </Link>
                    </li>
                ))}
                {documents.length === 0 && <p>No documents analyzed yet.</p>}
            </ul>
        </div>
    );
}
