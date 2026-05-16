"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Camera } from "lucide-react";
import { createSession, issueUploadUrls, uploadToGcs, analyzeSession } from "@/lib/api";
import { useLanguage } from "@/context/language-context";

const MAX_PHOTOS = 10;

export default function CameraPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const [photos, setPhotos] = useState<{ dataUrl: string; file: File }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(true);
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    const [header, data] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
    const bytes = atob(data);
    const arr = new Uint8Array(bytes.length);
    for (let j = 0; j < bytes.length; j++) arr[j] = bytes.charCodeAt(j);
    const file = new File([arr], `photo_${Date.now()}.jpg`, { type: mime });

    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    setPhotos((prev) => {
      const next = [...prev, { dataUrl, file }];
      setTimeout(() => {
        thumbnailsRef.current?.scrollTo({ left: 9999, behavior: "smooth" });
      }, 50);
      return next;
    });
  }, [photos.length]);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (photos.length === 0 || isLoading) return;
    setIsLoading(true);

    try {
      const files = photos.map((p) => p.file);

      setLoadingMsg("세션 생성 중...");
      const sessionId = await createSession(language);
      sessionStorage.setItem("sessionId", sessionId);

      setLoadingMsg("이미지 업로드 중...");
      const uploads = await issueUploadUrls(sessionId, files);
      await Promise.all(uploads.map((u, i) => uploadToGcs(u.uploadUrl, files[i])));

      setLoadingMsg("분석 시작 중...");
      await analyzeSession(sessionId);

      // ✅ 분석 요청만 보내고 바로 메뉴 페이지로 이동
      // 나머지 폴링은 menu 페이지에서 스켈레톤 UI로 처리
      router.push("/menu");
    } catch (err) {
      console.error(err);
      setLoadingMsg("오류가 발생했습니다. 다시 시도해주세요.");
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMsg("");
      }, 2000);
    }
  };

  const canCapture = photos.length < MAX_PHOTOS;

  return (
      <div
          style={{
            position: "relative",
            display: "flex",
            height: "100svh",
            width: "100%",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "#000",
          }}
      >
        {flash && (
            <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  inset: 0,
                  zIndex: 50,
                  backgroundColor: "#fff",
                  animation: "flashFade 150ms ease-out forwards",
                }}
            />
        )}

        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          {cameraError ? (
              <div
                  style={{
                    display: "flex",
                    height: "100%",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    color: "rgba(250,250,250,0.6)",
                  }}
              >
                <Camera size={48} />
                <p style={{ fontSize: "14px", margin: 0 }}>카메라 접근 권한이 필요합니다</p>
              </div>
          ) : (
              <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ height: "100%", width: "100%", objectFit: "cover" }}
              />
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: "20px 20px 40px",
              backdropFilter: "blur(8px)",
            }}
        >
          {isLoading && (
              <p style={{ fontSize: "14px", color: "rgba(250,250,250,0.8)", margin: 0 }}>
                {loadingMsg}
              </p>
          )}

          <button
              onClick={capture}
              disabled={!canCapture || isLoading}
              style={{
                height: "72px",
                width: "72px",
                borderRadius: "9999px",
                border: "4px solid #FAFAFA",
                backgroundColor: "#FAFAFA",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                cursor: canCapture && !isLoading ? "pointer" : "not-allowed",
                opacity: canCapture && !isLoading ? 1 : 0.3,
                flexShrink: 0,
              }}
          />

          {photos.length > 0 && (
              <div style={{ display: "flex", width: "100%", alignItems: "center", gap: "12px" }}>
                <div
                    ref={thumbnailsRef}
                    style={{
                      display: "flex",
                      flex: 1,
                      gap: "8px",
                      overflowX: "auto",
                      paddingBottom: "4px",
                      scrollbarWidth: "none",
                    }}
                >
                  {photos.map((p, i) => (
                      <div
                          key={i}
                          style={{
                            position: "relative",
                            flexShrink: 0,
                            height: "72px",
                            width: "72px",
                            overflow: "hidden",
                            borderRadius: "16px",
                          }}
                      >
                        <img
                            src={p.dataUrl}
                            alt={`photo ${i + 1}`}
                            style={{ height: "100%", width: "100%", objectFit: "cover" }}
                        />
                        <button
                            onClick={() => removePhoto(i)}
                            disabled={isLoading}
                            style={{
                              position: "absolute",
                              right: "4px",
                              top: "4px",
                              display: "flex",
                              height: "20px",
                              width: "20px",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "9999px",
                              backgroundColor: "rgba(0,0,0,0.7)",
                              color: "#FAFAFA",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                            }}
                        >
                          <X size={11} strokeWidth={2.5} />
                        </button>
                      </div>
                  ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                      display: "flex",
                      height: "72px",
                      width: "72px",
                      flexShrink: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      backgroundColor: "#FAFAFA",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      border: "none",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.5 : 1,
                    }}
                >
                  {isLoading ? (
                      <div
                          style={{
                            height: "20px",
                            width: "20px",
                            borderRadius: "9999px",
                            border: "2px solid #1E1E1E",
                            borderTopColor: "transparent",
                            animation: "spin 0.7s linear infinite",
                          }}
                      />
                  ) : (
                      <ArrowRight size={22} style={{ color: "#1E1E1E" }} strokeWidth={2.5} />
                  )}
                </button>
              </div>
          )}

          <p style={{ fontSize: "12px", color: "rgba(250,250,250,0.5)", margin: 0 }}>
            {photos.length} / {MAX_PHOTOS}
          </p>
        </div>

        <style>{`
        @keyframes flashFade { from { opacity: 1; } to { opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        div::-webkit-scrollbar { display: none; }
      `}</style>
      </div>
  );
}