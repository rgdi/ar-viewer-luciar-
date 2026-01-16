
// assets/js/api.js

// Allow configuring API URL via window global or default to current origin
const API_BASE = window.API_BASE_URL || `${window.location.origin}/api`;

// Simple implementation of Supabase-like interface (or just a direct API client)
// Since we are moving to VPS, let's just make a clean API client tailored to our new backend.
// We will replace 'supabase.js' usages with this.

const auth = {
    async signIn({ email, password }) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error } };

        // Save token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { data: { user: data.user, session: { token: data.token } } };
    },

    async signUp({ email, password }) {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error } };

        // Auto login behaviour
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { data: { user: data.user, session: { token: data.token } }, error: null };
    },

    async signOut() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    },

    getUser() {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    }
};

const models = {
    async list() {
        const token = auth.getToken();
        if (!token) return { error: { message: 'Not logged in' } };

        const res = await fetch(`${API_BASE}/models`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return { error: { message: await res.text() } };
        return { data: await res.json() };
    },

    async upload(file, name, description, onProgress) {
        const token = auth.getToken();
        if (!token) return { error: { message: 'Not logged in' } };

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('description', description);

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            };

            xhr.onload = () => {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({ data });
                    } else {
                        resolve({ error: { message: data.error || 'Upload failed' } });
                    }
                } catch (e) {
                    resolve({ error: { message: 'Server error' } });
                }
            };

            xhr.onerror = () => {
                resolve({ error: { message: 'Network error during upload' } });
            };

            xhr.open('POST', `${API_BASE}/models`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);
        });
    },

    async get(id) {
        const res = await fetch(`${API_BASE}/models/${id}`);
        if (!res.ok) return { error: { message: 'Not found' } };
        return { data: await res.json() };
    },

    async incrementView(id) {
        await fetch(`${API_BASE}/models/${id}/view`, { method: 'POST' });
    }
};

// Utilities for Public URL
function getModelUrl(storagePath) {
    // storagePath is "userId/filename"
    // server serves uploads at /uploads
    // Assuming API_BASE is /api, we need root URL.
    // Hacky: removing /api
    const root = API_BASE.replace('/api', '');
    return `${root}/uploads/${storagePath}`;
}

export const api = {
    auth,
    models,
    getModelUrl
};
