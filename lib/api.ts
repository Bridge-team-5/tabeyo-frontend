const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionStatus = "CREATED" | "UPLOADING" | "ANALYZING" | "READY" | "FAILED";

export type PriceDto = {
  amount: number;
  currency: string;
};

export type MenuItemDto = {
  id: number;
  originalName: string;
  translatedName: string;
  category?: string;
  price?: PriceDto;
  shortDescription: string;
  fullExplanation: string;
  spicinessLevel?: number;
  likelyIngredients: string[];
  potentialAllergens: string[];
  dietaryFlags: string[];
  hasImageInMenu: boolean;
  boundingBox?: number[];
  imageUrls?: string[];
  imageSearchQuery?: string;
  displayOrder: number;
};

export type SessionResponse = {
  id: string;
  status: SessionStatus;
  targetLanguage: string;
  detectedLanguage?: string;
  restaurantName?: string;
  items: MenuItemDto[];
};

export type RecommendationEntry = {
  itemId: number;
  score: number;
  reason: string;
};

// ─── 1. 세션 생성 ─────────────────────────────────────────────────────────────

export async function createSession(targetLanguage: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetLanguage }),
  });
  if (!res.ok) throw new Error("세션 생성 실패");
  const data = await res.json();
  return data.sessionId as string;
}

// ─── 2. 업로드 URL 발급 ────────────────────────────────────────────────────────

type IssuedUpload = {
  imageId: number;
  gcsObject: string;
  uploadUrl: string;
};

async function issueUploadUrls(
    sessionId: string,
    files: File[]
): Promise<IssuedUpload[]> {
  const items = files.map((f) => ({ contentType: f.type || "image/jpeg" }));
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/upload-urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("업로드 URL 발급 실패");
  const data = await res.json();
  return data.items as IssuedUpload[];
}

// ─── 3. GCS에 이미지 직접 업로드 ──────────────────────────────────────────────

async function uploadToGcs(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  if (!res.ok) throw new Error("GCS 업로드 실패");
}

// ─── 4. 분석 요청 ─────────────────────────────────────────────────────────────

async function analyzeSession(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/analyze`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("분석 요청 실패");
  return res.json() as Promise<SessionResponse>;
}

// ─── 5. 세션 상태 폴링 ────────────────────────────────────────────────────────

export async function pollSession(
    sessionId: string,
    intervalMs = 2000,
    timeoutMs = 60000
): Promise<SessionResponse> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`);
    if (!res.ok) throw new Error("세션 조회 실패");
    const session = (await res.json()) as SessionResponse;

    if (session.status === "READY") return session;
    if (session.status === "FAILED") throw new Error("분석 실패");

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("분석 시간 초과");
}

// ─── 추천 요청 ────────────────────────────────────────────────────────────────

export async function requestRecommend(
    sessionId: string,
    preferences?: string,
    allergies?: string
): Promise<RecommendationEntry[]> {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferences, allergies }),
  });
  if (!res.ok) throw new Error("추천 요청 실패");
  const data = await res.json();
  return data.recommendations as RecommendationEntry[];
}

// ─── 전체 업로드 + 분석 플로우 (카메라 페이지에서 호출) ──────────────────────────

export async function uploadAndAnalyze(
    files: File[],
    targetLanguage: string
): Promise<SessionResponse> {
  // 1. 세션 생성
  const sessionId = await createSession(targetLanguage);

  // 2. 업로드 URL 발급
  const uploads = await issueUploadUrls(sessionId, files);

  // 3. GCS에 병렬 업로드
  await Promise.all(
      uploads.map((u, i) => uploadToGcs(u.uploadUrl, files[i]))
  );

  // 4. 분석 시작
  await analyzeSession(sessionId);

  // 5. READY 될 때까지 폴링
  const session = await pollSession(sessionId);

  // sessionId를 같이 저장해서 이후 추천/주문에 쓸 수 있게
  return { ...session, id: sessionId };
}