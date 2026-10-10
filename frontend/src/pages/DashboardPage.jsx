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

    if (!result) return <div>Loading dashboard...</div>;

    const { document, findings, segments } = result;
    const filteredFindings = findings.filter(f => f.type === activeTab);

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <h2>Findings</h2>
                <div className="tabs">
                    <button className={activeTab === 'risk' ? 'active' : ''} onClick={() => setActiveTab('risk')}>Risks</button>
                    <button className={activeTab === 'deadline' ? 'active' : ''} onClick={() => setActiveTab('deadline')}>Deadlines</button>
                    <button className={activeTab === 'obligation' ? 'active' : ''} onClick={() => setActiveTab('obligation')}>Obligations</button>
                    <button className={activeTab === 'key_clause' ? 'active' : ''} onClick={() => setActiveTab('key_clause')}>Key Clauses</button>
                </div>
                
                <div className="findings-list">
                    {filteredFindings.map(finding => (
                        <FindingCard 
                            key={finding.id || finding.title} 
                            finding={finding} 
                            onClick={setHighlightedFinding} 
                        />
                    ))}
                    {filteredFindings.length === 0 && (
                        <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                            No {activeTab.replace('_', ' ')}s found in this document.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="main-content">
                <DocumentViewer document={document} highlightedFinding={highlightedFinding} segments={segments} />
            </div>
        </div>
    );
}
