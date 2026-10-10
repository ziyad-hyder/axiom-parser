import React from 'react';

export default function FindingCard({ finding, onClick, isSelected }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(finding);
        }
    };

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
            <p className="finding-summary">{finding.summary}</p>
            <div className="finding-meta">
                <span className="location-label">{finding.location_ref}</span>
            </div>
        </div>
    );
}
