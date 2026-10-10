import React, { useEffect, useRef } from 'react';

export default function DocumentViewer({ document, highlightedFinding, segments = [] }) {
    const segmentRefs = useRef({});

    useEffect(() => {
        if (highlightedFinding && segmentRefs.current[highlightedFinding.location_ref]) {
            segmentRefs.current[highlightedFinding.location_ref].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedFinding]);

    const highlightText = (text, quote) => {
        if (!quote) return text;
        const index = text.toLowerCase().indexOf(quote.toLowerCase());
        if (index === -1) return text;
        
        return (
            <>
                {text.substring(0, index)}
                <mark className="highlight-mark">{text.substring(index, index + quote.length)}</mark>
                {text.substring(index + quote.length)}
            </>
        );
    };

    return (
        <div className="document-viewer">
            <h2>Document Viewer ({document.filename})</h2>
            <div className="viewer-content" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                {segments.length > 0 ? (
                    segments.map(seg => (
                        <div 
                            key={seg.location_ref} 
                            ref={el => segmentRefs.current[seg.location_ref] = el}
                            className={`segment-block ${highlightedFinding?.location_ref === seg.location_ref ? 'active-segment' : ''}`}
                            style={{ marginBottom: '1.5rem', padding: '1rem', background: highlightedFinding?.location_ref === seg.location_ref ? '#f0fdf4' : '#fff', borderLeft: highlightedFinding?.location_ref === seg.location_ref ? '4px solid #16a34a' : 'none' }}
                        >
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Location Ref: {seg.location_ref}</div>
                            <div>
                                {highlightedFinding?.location_ref === seg.location_ref 
                                    ? highlightText(seg.text, highlightedFinding.source_quote) 
                                    : seg.text}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No segments available for rendering.</p>
                )}
            </div>
        </div>
    );
}
