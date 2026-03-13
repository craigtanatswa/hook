"use client";

import { useState, useRef, useCallback, useEffect, useId } from "react";
import Image from "next/image";
import { Upload, X, AlertCircle, Film, ImageIcon } from "lucide-react";

type ItemStatus = "existing" | "uploading" | "done" | "error";

type MediaItem = {
  id: string;
  url: string;
  preview: string;
  status: ItemStatus;
  errorMessage?: string;
  isVideo: boolean;
};

type MediaUploaderProps = {
  /** Newline-separated URLs pre-populated for edit mode */
  defaultUrls?: string;
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

export function MediaUploader({ defaultUrls = "", error }: MediaUploaderProps) {
  const dropId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaItem[]>(() =>
    defaultUrls
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter(Boolean)
      .map((url) => ({
        id: randomId(),
        url,
        preview: url,
        status: "existing" as ItemStatus,
        isVideo: guessIsVideo(url),
      }))
  );

  const [dragging, setDragging] = useState(false);

  // Keep the hidden input in sync so FormData picks up the correct value
  const uploadedUrls = items
    .filter((i) => i.status === "existing" || i.status === "done")
    .map((i) => i.url)
    .join("\n");

  useEffect(() => {
    if (hiddenRef.current) hiddenRef.current.value = uploadedUrls;
  }, [uploadedUrls]);

  const uploadFile = useCallback(async (file: File) => {
    const id = randomId();
    const preview = URL.createObjectURL(file);
    const isVideo = mimeIsVideo(file.type);

    setItems((prev) => [
      ...prev,
      { id, url: "", preview, status: "uploading" as ItemStatus, isVideo },
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
      if (item && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const retryItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
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
        Max 50 MB each. The first photo is used as the cover image.
      </p>

      {/* Drop zone */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload photos and videos"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer select-none py-10 px-4 transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : error
              ? "border-destructive bg-destructive/5"
              : "border-border hover:border-primary/60 hover:bg-muted/50"
          }`}
        >
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              error ? "bg-destructive/10" : "bg-muted"
            }`}
          >
            <Upload
              className={`h-6 w-6 ${error ? "text-destructive" : "text-muted-foreground"}`}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              Drop files here or{" "}
              <span className="text-primary underline underline-offset-2">tap to browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Photos and short videos welcome
            </p>
          </div>
          <input
            ref={fileInputRef}
            id={dropId}
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={onInputChange}
          />
        </div>
      )}

      {/* Error message */}
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
              {/* Cover badge on first uploaded/existing item */}
              {index === 0 &&
                (item.status === "existing" || item.status === "done") && (
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
                  unoptimized
                />
              )}

              {/* Uploading spinner overlay */}
              {item.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/60 backdrop-blur-sm">
                  <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Uploading…
                  </span>
                </div>
              )}

              {/* Error overlay */}
              {item.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/10 p-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-[10px] text-destructive text-center leading-tight font-medium">
                    {item.errorMessage ?? "Failed"}
                  </p>
                  <button
                    type="button"
                    onClick={() => retryItem(item.id)}
                    className="mt-1 text-[10px] font-bold text-destructive underline underline-offset-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Remove button (shown on hover when not uploading/error) */}
              {(item.status === "existing" || item.status === "done") && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute top-1.5 right-1.5 z-20 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5 text-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading hint */}
      {hasUploading && (
        <p className="mt-2 text-xs text-muted-foreground">
          Uploading… please wait before publishing.
        </p>
      )}

      {/* Max files reached */}
      {!canAdd && (
        <p className="mt-2 text-xs text-muted-foreground">
          {MAX_FILES} files added — remove one to replace it.
        </p>
      )}

      {/* Hidden input — carries URLs into FormData for the server action */}
      <input ref={hiddenRef} type="hidden" name="media_urls" defaultValue={uploadedUrls} />
    </div>
  );
}
