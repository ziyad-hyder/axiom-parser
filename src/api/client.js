const API_BASE = 'http://localhost:8000/api';

export const analyzeDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        throw new Error('Analysis failed');
    }
    return response.json();
};

export const getDocuments = async () => {
    const response = await fetch(`${API_BASE}/documents`);
    if (!response.ok) {
        throw new Error('Failed to fetch documents');
    }
    return response.json();
};

export const getDocumentById = async (id) => {
    const response = await fetch(`${API_BASE}/documents/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch document');
    }
    return response.json();
};
