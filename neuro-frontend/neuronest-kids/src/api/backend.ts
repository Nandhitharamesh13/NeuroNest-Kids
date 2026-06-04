const BASE_URL = "http://localhost:5000/api";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAPI(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

export async function registerAPI(email: string, password: string, displayName: string) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
    });
    return res.json();
}

export async function getMeAPI(token: string) {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

// ── Game Stats ────────────────────────────────────────────────────────────────

export async function getNextDifficulty(accuracy: number) {
    const res = await fetch(`${BASE_URL}/ai/difficulty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accuracy }),
    });
    return res.json();
}

export async function saveGameSessionAPI(data: any) {
    const res = await fetch(`${BASE_URL}/games/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getChildName(childId: string) {
    const res = await fetch(`${BASE_URL}/children/name/${childId}`);
    return res.json();
}

// ── Child Profiles ────────────────────────────────────────────────────────────

export async function getChildrenAPI(token: string) {
    const res = await fetch(`${BASE_URL}/children`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

export async function addChildAPI(token: string, data: { name: string; age: number; avatar: string }) {
    const res = await fetch(`${BASE_URL}/children`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateChildAPI(token: string, id: string | number, data: { name: string; age: number; avatar: string }) {
    const res = await fetch(`${BASE_URL}/children/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteChildAPI(token: string, id: string | number) {
    const res = await fetch(`${BASE_URL}/children/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

