export type AssistantResponse = {
    output: string;
    raw: unknown;
};

const BASE_URL = (import.meta as any)?.env?.VITE_ASSISTANT_API || 'http://localhost:8000';

export async function sendAssistantQuestion(input: string, signal?: AbortSignal): Promise<AssistantResponse> {
    const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
        signal,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Assistant API error ${res.status}: ${text}`);
    }
    return res.json();
}


