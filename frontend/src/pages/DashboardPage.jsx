import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import FindingCard from '../components/FindingCard';
import DocumentViewer from '../components/DocumentViewer';
import { getDocumentById } from '../api/client';

export default function DashboardPage() {
    const { id } = useParams();
    const location = useLocation();
    const [result, setResult] = useState(location.state?.result || null);
    const [activeTab, setActiveTab] = useState('risk');
    const [highlightedFinding, setHighlightedFinding] = useState(null);

    useEffect(() => {
        if (!result) {
            getDocumentById(id).then(setResult).catch(console.error);
        }
    }, [id, result]);

    if (!result) return (
        <div className="dashboard-container" style={{ padding: 'var(--spacing-4)' }}>
            <div className="skeleton skeleton-title"></div>
            <div className="dashboard-columns">
                <div className="sidebar" style={{ padding: 'var(--spacing-4)' }}>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                </div>
                <div className="main-content" style={{ padding: 'var(--spacing-4)' }}>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                </div>
            </div>
        </div>
    );

    const { document, findings, segments } = result;
    const filteredFindings = findings.filter(f => f.type === activeTab);

    // Calculate counts
    const counts = {
        risk: findings.filter(f => f.type === 'risk').length,
        deadline: findings.filter(f => f.type === 'deadline').length,
        obligation: findings.filter(f => f.type === 'obligation').length,
        key_clause: findings.filter(f => f.type === 'key_clause').length,
    };

    return (
        <div className="dashboard-container">
            <div className="summary-bar">
                <div className="summary-title">{document.filename}</div>
                <div className="stat-chip badge-default">{(document.filename.split('.').pop() || 'doc').toUpperCase()}</div>
                <div className="stat-chip badge-default">{segments.length} segments</div>
                <div className="stat-chip risk">{counts.risk} Risks</div>
                <div className="stat-chip deadline">{counts.deadline} Deadlines</div>
                <div className="stat-chip obligation">{counts.obligation} Obligations</div>
                <div className="stat-chip clause">{counts.key_clause} Clauses</div>
            </div>
            
            <div className="dashboard-columns">
                <div className="sidebar">
                    <div className="tabs">
                        <button className={`tab ${activeTab === 'risk' ? 'active' : ''}`} onClick={() => setActiveTab('risk')}>
                            Risks <span className="tab-badge">{counts.risk}</span>
                        </button>
                        <button className={`tab ${activeTab === 'deadline' ? 'active' : ''}`} onClick={() => setActiveTab('deadline')}>
                            Deadlines <span className="tab-badge">{counts.deadline}</span>
                        </button>
                        <button className={`tab ${activeTab === 'obligation' ? 'active' : ''}`} onClick={() => setActiveTab('obligation')}>
                            Obligations <span className="tab-badge">{counts.obligation}</span>
                        </button>
                        <button className={`tab ${activeTab === 'key_clause' ? 'active' : ''}`} onClick={() => setActiveTab('key_clause')}>
                            Clauses <span className="tab-badge">{counts.key_clause}</span>
                        </button>
                    </div>
                    
                    <div className="findings-list">
                        {filteredFindings.map(finding => (
                            <FindingCard 
                                key={finding.id || finding.title} 
                                finding={finding} 
                                onClick={setHighlightedFinding} 
                                isSelected={highlightedFinding?.id === finding.id || highlightedFinding?.title === finding.title}
                            />
                        ))}
                        {filteredFindings.length === 0 && (
                            <div className="empty-state">
                                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <div>No {activeTab.replace('_', ' ')}s found in this document.</div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="main-content">
                    <DocumentViewer document={document} highlightedFinding={highlightedFinding} segments={segments} />
                </div>
            </div>
        </div>
    );
}
