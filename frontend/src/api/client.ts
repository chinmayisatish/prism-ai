import type { ReviewReport, HistoryItem, DemoItem } from '../types';

const API_BASE = "/api";

export async function validateInput(repoUrl: string, prNumber?: number, demoId?: string) {
  const res = await fetch(`${API_BASE}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl, pr_number: prNumber, demo_id: demoId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Validation error (${res.status})`);
  }
  return res.json();
}

export async function submitReview(
  repoUrl: string,
  prNumber?: number,
  githubToken?: string,
  demoId?: string
): Promise<ReviewReport> {
  const res = await fetch(`${API_BASE}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo_url: repoUrl,
      pr_number: prNumber,
      github_token: githubToken || undefined,
      demo_id: demoId || undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Review request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchRecentReviews(): Promise<HistoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("Could not fetch review history:", e);
    return [];
  }
}

export async function fetchReviewById(reviewId: string): Promise<ReviewReport> {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}`);
  if (!res.ok) {
    throw new Error(`Review with ID '${reviewId}' not found.`);
  }
  return res.json();
}

export async function fetchDemoPresets(): Promise<DemoItem[]> {
  try {
    const res = await fetch(`${API_BASE}/demos`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchSystemHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
