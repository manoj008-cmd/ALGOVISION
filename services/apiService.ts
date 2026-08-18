class ApiService {
    private token: string | null;
    private readonly baseUrl: string;

    constructor() {
        this.token = localStorage.getItem('algoToken');
        this.baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('algoToken', token);
        } else {
            localStorage.removeItem('algoToken');
        }
    }

    getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const headers = {
            ...this.getHeaders(),
            ...(options.headers && options.headers instanceof Headers
                ? Object.fromEntries(options.headers.entries())
                : (options.headers as Record<string, string> | undefined) || {}),
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : await response.text();

        if (!response.ok) {
            const message = typeof data === 'string' ? data : data?.message || 'Request failed';
            throw new Error(message);
        }

        return data;
    }

    async signup(userData: { name: string; studentId: string; phone: string; email: string; password: string }) {
        const data = await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (data?.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async login(credentials: { email: string; password: string }) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (data?.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async verifyToken() {
        return this.request('/auth/verify');
    }

    async submitQuizResult(payload: { score: number; totalQuestions: number; topicsCovered?: string[] }) {
        return this.request('/quiz/submit', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getQuizHistory() {
        return this.request('/quiz/history');
    }

    async getLeaderboard() {
        return this.request('/quiz/leaderboard');
    }

    async getAlgorithmSuggestion(array: number[], algorithm: string): Promise<string> {
        try {
            const response = await this.request('/ai/algorithm-suggestion', {
                method: 'POST',
                body: JSON.stringify({ array, algorithm }),
            });
            return response?.suggestion || response?.message || 'AI suggestion unavailable.';
        } catch (error) {
            const n = array.length;
            const sortedPairs = array.slice(1).filter((v, i) => array[i] <= v).length;
            const sortedness = n <= 1 ? 1 : sortedPairs / (n - 1);
            const isSorting = ['Quick Sort', 'Merge Sort', 'Selection Sort', 'Insertion Sort'].includes(algorithm);

            if (!isSorting) {
                return `AI Suggestion\n\nFor searching, if your data is sorted, prefer Binary Search (O(log n)). Otherwise use Linear Search (O(n)).`;
            }

            if (n <= 25 && sortedness > 0.8) {
                return `AI Suggestion\n\nYour array is small and already somewhat sorted. Insertion Sort often performs very well here (near O(n)).`;
            }
            if (n <= 40) {
                return `AI Suggestion\n\nFor small arrays, Insertion Sort is a strong practical choice; for guaranteed O(n log n), choose Merge Sort.`;
            }
            return `AI Suggestion\n\nFor larger inputs, prefer Merge Sort for predictable O(n log n). Quick Sort is also fast on average but can degrade to O(n^2) in worst cases.`;
        }
    }

    async getComplexityAnalysis(array: number[]): Promise<string> {
        try {
            const response = await this.request('/ai/complexity-analysis', {
                method: 'POST',
                body: JSON.stringify({ array, algorithm: 'Quick Sort' }),
            });
            return response?.analysis || response?.message || 'Complexity analysis unavailable.';
        } catch (error) {
            const n = array.length;
            const sortedPairs = array.slice(1).filter((v, i) => array[i] <= v).length;
            const sortedness = n <= 1 ? 1 : sortedPairs / (n - 1);
            const hasManyDuplicates = new Set(array).size / Math.max(1, n) < 0.7;

            const lines: string[] = [];
            lines.push('AI-Powered Analysis');
            lines.push('');
            lines.push(`Input size: ${n}`);
            lines.push(`Estimated sortedness: ${(sortedness * 100).toFixed(0)}%`);
            lines.push(`Duplicates: ${hasManyDuplicates ? 'many' : 'few'}`);
            lines.push('');
            lines.push('Recommendation:');
            if (n <= 25 && sortedness > 0.8) {
                lines.push('- Sorting: Insertion Sort (very good on nearly-sorted small arrays).');
            } else {
                lines.push('- Sorting: Merge Sort for consistent O(n log n), or Quick Sort for average-case speed.');
            }
            lines.push('- Searching: Binary Search only if sorted; otherwise Linear Search.');
            lines.push('');
            lines.push('Note: Using local heuristic analysis while the backend AI service is unavailable.');
            return lines.join('\n');
        }
    }

    async generateVideo(prompt: string, base64Image: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<string> {
        try {
            const response = await this.request('/ai/generate-video', {
                method: 'POST',
                body: JSON.stringify({ prompt, base64Image, mimeType, aspectRatio }),
            });
            return response?.message || 'Video generation request queued.';
        } catch (error) {
            return 'Video generation is not enabled in this build. Configure a dedicated video generation provider to enable it.';
        }
    }

    async getLowLatencyResponse(prompt: string): Promise<string> {
        const trimmed = prompt.trim();
        if (!trimmed) return 'Please enter a question.';

        try {
            const response = await this.request('/ai/chat', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: trimmed,
                    context: 'In the context of algorithm visualization (like for Quick Sort, Merge Sort, Binary Search), explain the topic clearly and practically.',
                }),
            });
            return response?.reply || 'AI assistant is temporarily unavailable.';
        } catch (error) {
            return 'Offline mode: AI assistant is unavailable because the backend service is not connected. Please try again later or use the local heuristic explanations.';
        }
    }

    logout() {
        this.setToken(null);
        localStorage.removeItem('algoUser');
        localStorage.removeItem('quizHistory');
    }
}

export const apiService = new ApiService();
