import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeDocument } from '../api/client';

export default function UploadPage() {
    const [status, setStatus] = useState('idle'); // idle, file_selected, uploading, extracting, analyzing
    const [file, setFile] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setStatus('file_selected');
        setErrorMsg('');
    };

    const onFileChange = (e) => {
        handleFileSelect(e.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setStatus('idle');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        try {
            setStatus('uploading');
            // Simulate steps for UI
            setTimeout(() => {
                if (status !== 'error') setStatus('extracting');
            }, 800);
            
            setTimeout(() => {
                if (status !== 'error') setStatus('analyzing');
            }, 1800);
            
            const result = await analyzeDocument(file);
            navigate(`/dashboard/${result.document.id}`, { state: { result } });
        } catch (error) {
            console.error(error);
            const rawMsg = error.message || 'An error occurred during analysis.';
            setErrorMsg(rawMsg.replace(/—/g, '-'));
            setStatus('error');
        }
    };

    const isProcessing = ['uploading', 'extracting', 'analyzing'].includes(status);

    const renderStepper = () => {
        if (!isProcessing && status !== 'error') return null;
        
        return (
            <div className="progress-stepper" aria-live="polite">
                <div className={`step ${status === 'uploading' ? 'active' : ''} ${['extracting', 'analyzing', 'error'].includes(status) && status !== 'uploading' ? 'completed' : ''}`}>
                    {status === 'uploading' && <div className="spinner"></div>}
                    <span>Uploading document...</span>
                </div>
                <div className={`step ${status === 'extracting' ? 'active' : ''} ${['analyzing', 'error'].includes(status) && status !== 'extracting' ? 'completed' : ''}`}>
                    {status === 'extracting' && <div className="spinner"></div>}
                    <span>Extracting text...</span>
                </div>
                <div className={`step ${status === 'analyzing' ? 'active' : ''}`}>
                    {status === 'analyzing' && <div className="spinner"></div>}
                    <span>Analyzing with Gemini...</span>
                </div>
            </div>
        );
    };

    return (
        <div className="upload-container">
            <div className="upload-hero">
                <h1>Axiom Parser</h1>
                <p>Extract risks, deadlines, obligations and key clauses from legal and business documents</p>
            </div>
            
            {!file ? (
                <div 
                    className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        accept=".pdf,.docx" 
                        onChange={onFileChange} 
                        className="file-input"
                        ref={fileInputRef}
                    />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-primary)' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <div className="dropzone-text">Click to browse or drag file here</div>
                    <div className="dropzone-hint">Accepted types: PDF, DOCX (Max 10MB)</div>
                </div>
            ) : (
                <div className="file-preview">
                    <div className="file-info">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <div>
                            <div className="file-name">{file.name}</div>
                            <div className="file-meta">
                                {(file.size / 1024 / 1024).toFixed(2)} MB - {file.type || 'Document'}
                            </div>
                        </div>
                    </div>

                    {!isProcessing && status !== 'error' && (
                        <div className="file-actions">
                            <button className="btn btn-primary" onClick={handleAnalyze} disabled={!file}>
                                Analyze document
                            </button>
                            <button className="btn btn-secondary" onClick={handleRemoveFile}>
                                Remove
                            </button>
                        </div>
                    )}
                    
                    {renderStepper()}
                </div>
            )}
            
            {errorMsg && (
                <div className="error-banner">
                    <span>{errorMsg}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost" onClick={() => handleAnalyze()}>Retry</button>
                        <button className="btn btn-ghost" onClick={() => { setErrorMsg(''); setStatus(file ? 'file_selected' : 'idle'); }}>Dismiss</button>
                    </div>
                </div>
            )}
        </div>
    );
}
