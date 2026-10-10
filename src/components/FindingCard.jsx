import React from 'react';

export default function FindingCard({ finding, onClick }) {
    return (
        <div className="finding-card" onClick={() => onClick(finding)}>
            <div className="finding-header">
                <h3>{finding.title}</h3>
                {finding.severity && (
                    <span className={`badge badge-${finding.severity.toLowerCase()}`}>
                        {finding.severity}
                    </span>
                )}
            </div>
            <p>{finding.summary}</p>
        </div>
    );
}
