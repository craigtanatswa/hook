"use client";

import { useState, useRef, useCallback, useEffect, useId } from "react";
import Image from "next/image";
import { Upload, X, AlertCircle, Film, ImageIcon, Crosshair, RotateCcw } from "lucide-react";

type ItemStatus = "existing" | "uploading" | "done" | "error";

type MediaItem = {
  id: string;
  url: string;
  preview: string;
  status: ItemStatus;
  errorMessage?: string;
  isVideo: boolean;
  focalPoint: string;
};

type MediaUploaderProps = {
  /** Newline-separated URLs pre-populated for edit mode */
  defaultUrls?: string;
  /** Newline-separated focal points matching defaultUrls order */
  defaultFocalPoints?: string;
  /** Validation error message passed in from the parent form */
  error?: string | null;
};

const ACCEPT = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm";
const MAX_FILES = 10;

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function guessIsVideo(url: string) {
  return /\.(mp4|mov|webm)(\?|$)/i.test(url);
}

function mimeIsVideo(type: string) {
  return type.startsWith("video/");
}

export function MediaUploader({ defaultUrls = "", defaultFocalPoints = "", error }: MediaUploaderProps) {
  const dropId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenUrlsRef = useRef<HTMLInputElement>(null);
  const hiddenFocalRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaItem[]>(() => {
    const urls = defaultUrls.split(/\r?\n/).map((u) => u.trim()).filter(Boolean);
    const focalList = defaultFocalPoints.split(/\r?\n/).map((s) => s.trim() || "50% 50%");
    return urls.map((url, i) => ({
      id: randomId(),
      url,
      preview: url,
      status: "existing" as ItemStatus,
      isVideo: guessIsVideo(url),
      focalPoint: focalList[i] ?? "50% 50%",
    }));
  });

  const [dragging, setDragging] = useState(false);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const adjustingItem = adjustingId ? items.find((i) => i.id === adjustingId) ?? null : null;

  // Reset natural size whenever a different image is opened for adjustment
  useEffect(() => { setImgNaturalSize(null); }, [adjustingId]);

  // Keep hidden inputs in sync
  const readyItems = items.filter((i) => i.status === "existing" || i.status === "done");
  const uploadedUrls = readyItems.map((i) => i.url).join("\n");
  const focalPointsStr = readyItems.map((i) => i.focalPoint).join("\n");

  useEffect(() => {
    if (hiddenUrlsRef.current) hiddenUrlsRef.current.value = uploadedUrls;
    if (hiddenFocalRef.current) hiddenFocalRef.current.value = focalPointsStr;
  }, [uploadedUrls, focalPointsStr]);

  const uploadFile = useCallback(async (file: File) => {
    const id = randomId();
    const preview = URL.createObjectURL(file);
    const isVideo = mimeIsVideo(file.type);

    setItems((prev) => [
      ...prev,
      { id, url: "", preview, status: "uploading" as ItemStatus, isVideo, focalPoint: "50% 50%" },
    ]);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json: { url?: string; error?: string } = await res.json();

      if (!res.ok || json.error || !json.url) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "error" as ItemStatus, errorMessage: json.error ?? "Upload failed" }
              : item
          )
        );
      } else {
        URL.revokeObjectURL(preview);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, url: json.url!, preview: json.url!, status: "done" as ItemStatus }
              : item
          )
        );
      }
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "error" as ItemStatus, errorMessage: "Network error — please try again" }
            : item
        )
      );
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const slots = MAX_FILES - items.filter((i) => i.status !== "error").length;
      arr.slice(0, slots).forEach(uploadFile);
    },
    [items, uploadFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item && item.preview.startsWith("blob:")) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const retryItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const makeCover = (id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      if (index <= 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const handleFocalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!adjustingId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
    setItems((prev) =>
      prev.map((item) =>
        item.id === adjustingId ? { ...item, focalPoint: `${x}% ${y}%` } : item
      )
    );
  };

  const canAdd = items.filter((i) => i.status !== "error").length < MAX_FILES;
  const hasUploading = items.some((i) => i.status === "uploading");

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">
        Photos &amp; Videos *
      </label>
      <p className="text-xs text-muted-foreground mb-3">
        Add at least one photo. Up to {MAX_FILES} files — JPG, PNG, GIF, WebP or MP4 / MOV video.
        Max 50 MB each. The first photo is the cover image.
      </p>

      {/* Drop zone */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload photos and videos"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer select-none py-10 px-4 transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : error
              ? "border-destructive bg-destructive/5"
              : "border-border hover:border-primary/60 hover:bg-muted/50"
          }`}
        >
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${error ? "bg-destructive/10" : "bg-muted"}`}>
            <Upload className={`h-6 w-6 ${error ? "text-destructive" : "text-muted-foreground"}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              Drop files here or{" "}
              <span className="text-primary underline underline-offset-2">tap to browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Photos and short videos welcome</p>
          </div>
          <input ref={fileInputRef} id={dropId} type="file" accept={ACCEPT} multiple className="sr-only" onChange={onInputChange} />
        </div>
      )}

      {/* Validation error */}
      {error && (
        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {/* Thumbnails grid */}
      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border"
            >
              {/* Cover badge */}
              {index === 0 && (item.status === "existing" || item.status === "done") && (
                <span className="absolute top-1.5 left-1.5 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground pointer-events-none leading-tight shadow-sm">
                  Cover
                </span>
              )}

              {/* Media preview */}
              {item.isVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted">
                  <Film className="h-7 w-7 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Video</span>
                </div>
              ) : item.status === "uploading" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
                </div>
              ) : (
                <Image
                  src={item.preview}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  style={{ objectPosition: item.focalPoint }}
                  unoptimized
                />
              )}

              {/* Uploading spinner */}
              {item.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/60 backdrop-blur-sm">
                  <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-[10px] text-muted-foreground font-medium">Uploading…</span>
                </div>
              )}

              {/* Error overlay */}
              {item.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/10 p-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-[10px] text-destructive text-center leading-tight font-medium">
                    {item.errorMessage ?? "Failed"}
                  </p>
                  <button type="button" onClick={() => retryItem(item.id)} className="mt-1 text-[10px] font-bold text-destructive underline underline-offset-2">
                    Remove
                  </button>
                </div>
              )}

              {/* Hover action buttons (ready items only) */}
              {(item.status === "existing" || item.status === "done") && (
                <>
                  {/* Make cover (non-first images) */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => makeCover(item.id)}
                      className="absolute bottom-7 left-1.5 z-20 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-[10px] font-bold text-foreground shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity leading-tight"
                    >
                      Make cover
                    </button>
                  )}

                  {/* Adjust (images only — not videos) */}
                  {!item.isVideo && (
                    <button
                      type="button"
                      onClick={() => setAdjustingId(item.id)}
                      className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-[10px] font-bold text-foreground shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity leading-tight"
                    >
                      <Crosshair className="h-2.5 w-2.5" />
                      Adjust
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-1.5 right-1.5 z-20 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5 text-foreground" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading hint */}
      {hasUploading && (
        <p className="mt-2 text-xs text-muted-foreground">Uploading… please wait before publishing.</p>
      )}
      {!canAdd && (
        <p className="mt-2 text-xs text-muted-foreground">{MAX_FILES} files added — remove one to replace it.</p>
      )}

      {/* Hidden inputs */}
      <input ref={hiddenUrlsRef} type="hidden" name="media_urls" defaultValue={uploadedUrls} />
      <input ref={hiddenFocalRef} type="hidden" name="media_focal_points" defaultValue={focalPointsStr} />

      {/* ── Focal-point picker overlay ─────────────────────────────── */}
      {adjustingItem && !adjustingItem.isVideo && (() => {
        // Parse current focal point (0–1 fractions)
        const [fxStr, fyStr] = adjustingItem.focalPoint.split(" ");
        const fx = parseFloat(fxStr) / 100;
        const fy = parseFloat(fyStr) / 100;

        // Viewport rectangle: represents the 3:4 portrait crop (most restrictive view)
        const TARGET = 3 / 4;
        const imgAspect = imgNaturalSize ? imgNaturalSize.w / imgNaturalSize.h : 4 / 3;
        let vpW: number, vpH: number;
        if (imgAspect > TARGET) {
          // Landscape image — crops left/right
          vpH = 0.88;
          vpW = (vpH * TARGET) / imgAspect;
        } else if (imgAspect < TARGET) {
          // Portrait image — crops top/bottom
          vpW = 0.88;
          vpH = (vpW * imgAspect) / TARGET;
        } else {
          vpW = 0.88; vpH = 0.88;
        }
        // Clamp so the rectangle stays inside the image
        const vpL = Math.max(0, Math.min(fx - vpW / 2, 1 - vpW));
        const vpT = Math.max(0, Math.min(fy - vpH / 2, 1 - vpH));

        // SVG viewBox coordinates (0–100 scale so we can use simple numbers)
        const rx = vpL * 100, ry = vpT * 100, rw = vpW * 100, rh = vpH * 100;
        const maskId = `cm-${adjustingId}`;
        const hSpace = vpL; // fraction of width to the left of the rect
        const hSpaceR = 1 - vpL - vpW;
        const vSpace = vpT;
        const vSpaceB = 1 - vpT - vpH;

        return (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setAdjustingId(null); }}
          >
            <div className="relative w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
                <div>
                  <p className="text-sm font-bold text-foreground">Adjust visible area</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click anywhere on the photo to reposition the frame. Shaded areas will be cropped out.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdjustingId(null)}
                  className="ml-4 shrink-0 h-8 w-8 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* ── Main image editor ── */}
              <div className="bg-black flex justify-center items-start overflow-hidden shrink-0">
                {/*
                  Inner wrapper sized to the image itself — SVG overlay and HTML labels
                  are positioned relative to this wrapper, not the outer black bar.
                */}
                <div
                  className="relative cursor-crosshair select-none"
                  style={{ maxHeight: "50vh", lineHeight: 0 }}
                  onClick={handleFocalClick}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={adjustingItem.preview}
                    alt="Adjust focal point"
                    style={{ maxHeight: "50vh", maxWidth: "100%", width: "auto", height: "auto", display: "block" }}
                    draggable={false}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                    }}
                  />

                  {/* SVG: dim the cropped area, draw the viewport rectangle */}
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    aria-hidden
                  >
                    <defs>
                      <mask id={maskId}>
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        {/* cut-out = the visible area stays bright */}
                        <rect x={rx} y={ry} width={rw} height={rh} fill="black" />
                      </mask>
                    </defs>

                    {/* Dark overlay applied everywhere EXCEPT the viewport rect */}
                    <rect x="0" y="0" width="100" height="100" fill="black" fillOpacity="0.58" mask={`url(#${maskId})`} />

                    {/* Viewport rectangle — dashed white border */}
                    <rect x={rx} y={ry} width={rw} height={rh} fill="none" stroke="white" strokeWidth="0.55" strokeDasharray="2.8 1.4" />

                    {/* Corner handles */}
                    <rect x={rx - 1.5} y={ry - 1.5} width="3.2" height="3.2" fill="white" rx="0.6" />
                    <rect x={rx + rw - 1.7} y={ry - 1.5} width="3.2" height="3.2" fill="white" rx="0.6" />
                    <rect x={rx - 1.5} y={ry + rh - 1.7} width="3.2" height="3.2" fill="white" rx="0.6" />
                    <rect x={rx + rw - 1.7} y={ry + rh - 1.7} width="3.2" height="3.2" fill="white" rx="0.6" />
                  </svg>

                  {/* "Visible to viewers" label — centred at the top of the viewport rect */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${(vpL + vpW / 2) * 100}%`,
                      top: `${Math.min((vpT + 0.04) * 100, 90)}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wide text-white bg-black/45 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap shadow">
                      Visible to viewers
                    </span>
                  </div>

                  {/* "Cropped out" labels in the dimmed strips */}
                  {hSpace > 0.1 && (
                    <div
                      className="absolute pointer-events-none flex items-center justify-center"
                      style={{ left: 0, top: `${vpT * 100}%`, width: `${vpL * 100}%`, height: `${vpH * 100}%` }}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/60 whitespace-nowrap" style={{ writingMode: "vertical-rl" }}>
                        Cropped
                      </span>
                    </div>
                  )}
                  {hSpaceR > 0.1 && (
                    <div
                      className="absolute pointer-events-none flex items-center justify-center"
                      style={{ left: `${(vpL + vpW) * 100}%`, top: `${vpT * 100}%`, right: 0, height: `${vpH * 100}%`, width: `${hSpaceR * 100}%` }}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/60 whitespace-nowrap" style={{ writingMode: "vertical-rl" }}>
                        Cropped
                      </span>
                    </div>
                  )}
                  {vSpace > 0.1 && (
                    <div
                      className="absolute pointer-events-none flex items-center justify-center"
                      style={{ top: 0, left: `${vpL * 100}%`, width: `${vpW * 100}%`, height: `${vpT * 100}%` }}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/60 whitespace-nowrap">
                        Cropped
                      </span>
                    </div>
                  )}
                  {vSpaceB > 0.1 && (
                    <div
                      className="absolute pointer-events-none flex items-center justify-center"
                      style={{ top: `${(vpT + vpH) * 100}%`, left: `${vpL * 100}%`, width: `${vpW * 100}%`, height: `${vSpaceB * 100}%` }}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/60 whitespace-nowrap">
                        Cropped
                      </span>
                    </div>
                  )}

                  {/* Focal point crosshair marker */}
                  <div
                    className="absolute pointer-events-none"
                    style={{ left: `${fx * 100}%`, top: `${fy * 100}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div className="h-6 w-6 rounded-full border-2 border-white shadow-lg bg-primary/75 flex items-center justify-center">
                      <Crosshair className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Result previews at each device size ── */}
              <div className="px-5 py-3 border-t border-border bg-muted/30 shrink-0">
                <p className="text-xs font-semibold text-muted-foreground mb-2.5">Result at each screen size</p>
                <div className="flex items-end gap-4">
                  {([
                    { label: "Mobile", ratio: "4/5", w: 44 },
                    { label: "Tablet",  ratio: "3/4", w: 54 },
                    { label: "Desktop", ratio: "4/3", w: 88 },
                  ] as const).map(({ label, ratio, w }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <div
                        className="overflow-hidden rounded-lg border border-border shadow-sm"
                        style={{ width: w, aspectRatio: ratio }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={adjustingItem.preview}
                          alt={`${label} preview`}
                          className="w-full h-full"
                          style={{ objectFit: "cover", objectPosition: adjustingItem.focalPoint }}
                          draggable={false}
                        />
                      </div>
                      <span className="text-[9px] font-semibold text-muted-foreground">{label}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground leading-snug ml-2 max-w-[10rem]">
                    Previews update live as you move the focal point.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((item) =>
                        item.id === adjustingId ? { ...item, focalPoint: "50% 50%" } : item
                      )
                    )
                  }
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset to center
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustingId(null)}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
