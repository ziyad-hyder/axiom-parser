import React from 'react';

export default function DocumentViewer({ document, highlightedFinding }) {
    return (
        <div className="document-viewer">
            <h2>Document Viewer ({document.filename})</h2>
            <div className="viewer-placeholder">
                <p>PDF/DOCX rendering will appear here.</p>
                {highlightedFinding && (
                    <div className="highlighted-section">
                        <h4>Highlighted from Source:</h4>
                        <blockquote>"{highlightedFinding.source_quote}"</blockquote>
                        <p>Found at Location Ref: {highlightedFinding.location_ref}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
