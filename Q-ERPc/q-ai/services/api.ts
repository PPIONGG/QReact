import { Message, AppMode, SubMode, OCRSaveParams } from '../types';

// const BASE_URL = process.env.BACKEND_BASE_URL; // Moved to apiFetch

const getBaseUrl = () => {
    return localStorage.getItem('qai_backend_url') || import.meta.env.VITE_BACKEND_BASE_URL;
};

// --- Types ---

export interface ApiError {
    detail: string;
}

// --- Auth ---

const DEFAULT_TOKEN = import.meta.env.VITE_BACKEND_JWT_KEY;

export const getAuthToken = (): string | null => {
    return localStorage.getItem('qai_token') || DEFAULT_TOKEN;
};

export const setAuthToken = (token: string) => {
    localStorage.setItem('qai_token', token);
};

// --- Config ---

export interface AppConfig {
    default_model?: string;
    ollama_url?: string;
    llm_provider?: 'ollama' | 'vllm';
    vllm_url?: string;
    context_window?: string;
    max_token?: string;
    ollama_model?: string;
    vllm_model?: string;
    // Add other config fields as needed
}

export const getAppConfig = async (): Promise<AppConfig> => {
    return apiFetch<AppConfig>('/config');
};

export const updateAppConfig = async (config: AppConfig) => {
    return apiFetch<any>('/config', {
        method: 'POST',
        body: JSON.stringify(config)
    });
};

export const getAvailableModels = async () => {
    return apiFetch<string[]>('/config/models');
};

export const updateDefaultModel = async (model: string) => {
    return apiFetch<any>('/config/model/default', {
        method: 'POST',
        body: JSON.stringify({ model })
    });
};

// --- Generic Fetch Wrapper ---

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = getBaseUrl();
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 501) {
            throw new Error("Feature not implemented yet.");
        }
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    // Handle empty responses (e.g. 204 No Content)
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// --- Chat & Sessions ---

export const sendMessage = async (
    sessionId: string | null,
    message: string,
    attachments: { name: string; mimeType: string; data: string }[],
    mode: AppMode,
    subMode: SubMode,
    topic?: string,
    language: string = 'en',
    model?: string
): Promise<{ text: string, sessionId: string }> => {

    // 1. Create Session if needed
    let activeSessionId = sessionId;

    // Check if we need to create a session on backend.
    // We assume backend IDs are UUIDs (contain '-'), while local IDs are timestamps (no '-').
    const isBackendId = activeSessionId && activeSessionId.includes('-');

    if (!activeSessionId || !isBackendId) {
        try {
            // Determine context based on mode/subMode
            let context = '';
            if (subMode === SubMode.SUMMARIZE) {
                // In a real app, we might fetch the summary first to pass as context, 
                // or let the backend handle it. For now, we create a session with basic info.
                context = `Topic: ${topic}`;
            }

            const newSession = await createSession({
                mode: subMode === SubMode.OTHER ? mode.toLowerCase() : subMode.toLowerCase(), // mapping might need adjustment
                title: topic ? `${subMode} - ${topic}` : `${mode} Chat`, // Simple default title
                summary_context: context
            });
            activeSessionId = newSession.id;
        } catch (e) {
            console.error("Failed to create session", e);
            throw e;
        }
    }

    // 2. Send Question
    // If SubMode is SUMMARIZE, use the ERP Custom Question endpoint
    if (subMode === SubMode.SUMMARIZE) {
        if (!activeSessionId) throw new Error("Session ID is required for ERP custom question");

        try {
            const result = await askERPCustomQuestion(activeSessionId, message, language, model);
            return {
                text: result.ai_response,
                sessionId: activeSessionId
            };
        } catch (e: any) {
            throw e;
        }
    }

    // If SubMode is KNOWLEDGE, use the Knowledge Query endpoint
    if (subMode === SubMode.KNOWLEDGE) {
        if (!activeSessionId) throw new Error("Session ID is required for Knowledge query");

        try {
            const result = await askKnowledgeQuery({
                session_id: activeSessionId,
                prompt: message,
                language,
                model
            });
            return {
                text: result.ai_summary,
                sessionId: activeSessionId
            };
        } catch (e: any) {
            throw e;
        }
    }

    // Default Chat API
    if (attachments.length > 0 && subMode !== SubMode.OCR) {
        console.warn("Attachments in non-OCR chat are not fully specified in current API doc. Sending text only.");
    }

    try {
        const result = await apiFetch<any>('/chat/question', {
            method: 'POST',
            body: JSON.stringify({
                session_id: activeSessionId,
                question: message,
                language,
                model
            })
        });

        return {
            text: result.ai_response,
            sessionId: activeSessionId!
        };
    } catch (e: any) {
        if (e.message === "Feature not implemented yet.") {
            return { text: "I'm sorry, but this feature is not implemented yet in the backend.", sessionId: activeSessionId! };
        }
        throw e;
    }
};

// --- ERP Summarization ---

export const getProductionSummary = async (data: any) => {
    return apiFetch<any>('/erp/production/summary', {
        method: 'POST',
        body: JSON.stringify({ ...data, include_ai_insights: false })
    });
};

export const getSalesSummary = async (data: any) => {
    return apiFetch<any>('/erp/sales/summary', {
        method: 'POST',
        body: JSON.stringify({ ...data, include_ai_insights: false })
    });
};

export const askERPCustomQuestion = async (sessionId: string, question: string, language: string = 'en', model?: string) => {
    return apiFetch<any>('/erp/custom-question', {
        method: 'POST',
        body: JSON.stringify({
            session_id: sessionId,
            question,
            language,
            model
        })
    });
};

interface CreateSessionParams {
    mode: string;
    title: string;
    summary_context?: string;
    context_metadata?: any;
}

export const createSession = async (params: CreateSessionParams) => {
    return apiFetch<any>('/sessions', {
        method: 'POST',
        body: JSON.stringify(params)
    });
};

export const getSessions = async (limit = 50, offset = 0) => {
    return apiFetch<any[]>(`/sessions?limit=${limit}&offset=${offset}`);
};

export const getSessionMessages = async (sessionId: string, limit = 100) => {
    return apiFetch<any>(`/sessions/${sessionId}/messages?limit=${limit}`);
}

// --- Admin ---

export const getRoles = async (params: { include_inactive?: boolean } = {}) => {
    const query = new URLSearchParams();
    if (params.include_inactive !== undefined) {
        query.append('include_inactive', params.include_inactive.toString());
    }
    return apiFetch<any[]>(`/admin/roles?${query.toString()}`);
};

export const createRole = async (name: string, description: string) => {
    return apiFetch<any>('/admin/roles', {
        method: 'POST',
        body: JSON.stringify({ name, description })
    });
}

export const getUsers = async () => {
    return apiFetch<any[]>('/admin/users');
};

export const assignRole = async (userId: string, roleId: number) => {
    return apiFetch<any>(`/admin/users/${userId}/assign-role`, {
        method: 'POST',
        body: JSON.stringify({ role_id: roleId })
    });
}

// --- Knowledge ---

export const getDocuments = async () => {
    return apiFetch<any>('/knowledge/documents');
};

export const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${getBaseUrl()}/knowledge/ingest`, {
        method: 'POST',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail);
    }
    return response.json();
};

export const deleteDocument = async (id: number) => {
    return apiFetch(`/knowledge/documents/by-parent/${id}`, { method: 'DELETE' });
}

export const assignDocumentRoles = async (documentId: number, roleIds: number[]) => {
    return apiFetch(`/knowledge/documents/${documentId}/roles`, {
        method: 'POST',
        body: JSON.stringify({ role_ids: roleIds })
    });
};

interface KnowledgeQueryParams {
    session_id: string;
    prompt: string;
    language?: string;
    model?: string;
}

export const askKnowledgeQuery = async (params: KnowledgeQueryParams) => {
    return apiFetch<any>('/knowledge/query', {
        method: 'POST',
        body: JSON.stringify(params)
    });
};

// --- OCR ---

export const extractDocument = async (
    file: File,
    sessionId: string,
    documentType: string = 'Invoice',
    language: string = 'en'
) => {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams({
        session_id: sessionId,
        document_type: documentType,
        language: language
    });

    const token = getAuthToken();
    const response = await fetch(`${getBaseUrl()}/ocr/extract?${params.toString()}`, {
        method: 'POST',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail);
    }
    return response.json();
};

export const saveOCRExtraction = async (params: OCRSaveParams) => {
    return apiFetch<any>('/ocr/save', {
        method: 'POST',
        body: JSON.stringify(params)
    });
};

export const getOCRHistory = async () => {
    return apiFetch<any>('/ocr/history');
}

export const getOCRHello = async () => {
    // Just a health check or check capabilities
    return apiFetch('/ocr/health');
}
