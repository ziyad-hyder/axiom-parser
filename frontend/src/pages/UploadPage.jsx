import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeDocument } from '../api/client';

export default function UploadPage() {
    const [status, setStatus] = useState('idle'); // idle, uploading, analyzing
    const navigate = useNavigate();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setStatus('uploading');
            // Simulate upload progress if desired, otherwise immediately analyze
            setStatus('analyzing');
            
            const result = await analyzeDocument(file);
            
            // Navigate to Dashboard, passing the result via state
            navigate(`/dashboard/${result.document.id}`, { state: { result } });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="upload-container">
            <h1>Axiom Parser</h1>
            <p>Upload a PDF or DOCX file to extract insights automatically.</p>
            
            <div className="upload-box">
                <input 
                    type="file" 
                    accept=".pdf,.docx" 
                    onChange={handleFileChange} 
                    disabled={status !== 'idle' && status !== 'error'}
                />
                
                {status === 'uploading' && <p>Uploading document...</p>}
                {status === 'analyzing' && <p>Analyzing with Gemini...</p>}
                {status === 'error' && <p className="error">An error occurred during analysis.</p>}
            </div>
        </div>
    );
}
