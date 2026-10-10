import React, { useEffect, useRef, useState } from 'react';

export default function DocumentViewer({ document, highlightedFinding, segments = [] }) {
    const segmentRefs = useRef({});
    const [animatedSegment, setAnimatedSegment] = useState(null);

    useEffect(() => {
        if (highlightedFinding && segmentRefs.current[highlightedFinding.location_ref]) {
            segmentRefs.current[highlightedFinding.location_ref].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Trigger animation
            setAnimatedSegment(highlightedFinding.location_ref);
            const timer = setTimeout(() => {
                setAnimatedSegment(null);
            }, 2000); // match animation duration
            return () => clearTimeout(timer);
        }
    }, [highlightedFinding]);

    const highlightText = (text, quote, isAnimated) => {
        if (!quote) return text;
        const index = text.toLowerCase().indexOf(quote.toLowerCase());
        if (index === -1) return text;
        
        return (
            <>
                {text.substring(0, index)}
                <mark className={`highlight-mark ${isAnimated ? 'pulse-animation' : ''}`}>
                    {text.substring(index, index + quote.length)}
                </mark>
                {text.substring(index + quote.length)}
            </>
        );
    };

    return (
        <>
            <div className="viewer-header">
                <div className="viewer-title">{document.filename}</div>
                <div className="viewer-hint">Click a finding to jump to its source</div>
            </div>
            <div className="viewer-content">
                {segments.length > 0 ? (
                    segments.map(seg => {
                        const isTarget = highlightedFinding?.location_ref === seg.location_ref;
                        const isAnimated = isTarget && animatedSegment === seg.location_ref;
                        
                        return (
                            <div 
                                key={seg.location_ref} 
                                ref={el => segmentRefs.current[seg.location_ref] = el}
                                className="segment-block"
                            >
                                <div className="segment-label">{seg.location_ref}</div>
                                <div>
                                    {isTarget && highlightedFinding.source_quote
                                        ? highlightText(seg.text, highlightedFinding.source_quote, isAnimated) 
                                        : seg.text}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <div>No segments available for rendering.</div>
                    </div>
                )}
            </div>
        </>
    );
}
