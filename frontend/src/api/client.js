const getApiBase = () => {
    let baseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!baseUrl && import.meta.env.PROD) {
        throw new Error("VITE_API_BASE_URL is not configured");
    }

    if (!baseUrl) {
        baseUrl = 'http://localhost:8000';
    }

    // Strip trailing slash if present
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    
    return baseUrl + '/api';
};

export const API_BASE = getApiBase();

console.info(`[Startup] API Base URL configured to: ${API_BASE}`);

const handleFetchError = async (error, response) => {
    // Network errors or CORS
    if (error && !response) {
        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after waiting too long.`);
        }
        throw new Error(`Cannot reach the server at ${API_BASE}. Check that the backend is running and CORS allows this origin.`);
    }

    // HTTP errors
    if (!response.ok) {
        let detail = response.statusText;
        try {
            const data = await response.json();
            if (data.detail) {
                detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            }
        } catch (e) {
            // Ignore JSON parse error if response is not JSON
        }
        
        // Remove em-dashes from detail
        if (detail) {
            detail = detail.replace(/—/g, '-');
        }
        throw new Error(`Server returned ${response.status}: ${detail}`);
    }
};

export const analyzeDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

    try {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        await handleFetchError(null, response);
        
        clearTimeout(timeoutId);
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            await handleFetchError(error, null);
        }
        if (!error.message.includes('Cannot reach') && !error.message.includes('Server returned') && !error.message.includes('timed out')) {
            await handleFetchError(error, null);
        }
        throw error;
    }
};

export const getDocuments = async () => {
    try {
        const response = await fetch(`${API_BASE}/documents`);
        await handleFetchError(null, response);
        return await response.json();
    } catch (error) {
        if (!error.message.includes('Cannot reach') && !error.message.includes('Server returned')) {
            await handleFetchError(error, null);
        }
        throw error;
    }
};

export const getDocumentById = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/documents/${id}`);
        await handleFetchError(null, response);
        return await response.json();
    } catch (error) {
        if (!error.message.includes('Cannot reach') && !error.message.includes('Server returned')) {
            await handleFetchError(error, null);
        }
        throw error;
    }
};
