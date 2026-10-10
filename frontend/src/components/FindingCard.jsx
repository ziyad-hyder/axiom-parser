import React from 'react';

export default function FindingCard({ finding, onClick, isSelected }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(finding);
        }
    };

    // Remove em dashes from summary if any
    const summary = finding.summary ? finding.summary.replace(/—/g, '-') : '';

    return (
        <div 
            className={`finding-card type-${finding.type} ${isSelected ? 'selected' : ''}`}
            onClick={() => onClick(finding)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-pressed={isSelected}
        >
            <div className="finding-header">
                <h3 className="finding-title">{finding.title}</h3>
                {finding.severity && (
                    <span className={`badge badge-${finding.severity.toLowerCase()}`}>
                        {finding.severity}
                    </span>
                )}
            </div>
            <p className="finding-summary">{summary}</p>
            <div className="finding-meta">
                <span className="location-label">Segment {finding.location_ref}</span>
            </div>
        </div>
    );
}
