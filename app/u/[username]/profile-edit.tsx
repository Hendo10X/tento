"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Upload } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/server/profile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const MAX_SIZE = 400;
const MAX_INPUT_MB = 2;

function resizeImage(
  file: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = (height / width) * MAX_SIZE;
          width = MAX_SIZE;
        } else {
          width = (width / height) * MAX_SIZE;
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas error"));
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export function ProfileEdit({
  initialBio,
  initialImage,
}: {
  initialBio: string;
  initialImage: string;
  username: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [image, setImage] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setBio(initialBio);
    setImage(initialImage);
    setOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_INPUT_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_INPUT_MB}MB`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      setImage(dataUrl);
      toast.success("Image ready");
    } catch {
      toast.error("Could not process image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ bio: bio.trim() || undefined, image: image.trim() || undefined });
      if (image.trim()) {
        typeof window !== "undefined" && sessionStorage.setItem("tento-avatar-updated", "1");
      }
      toast.success("Profile updated");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Could not update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-tento-lavender text-white shadow-sm transition-colors hover:bg-tento-lavender-hover"
        aria-label="Edit profile"
      >
        <Pencil className="h-2.5 w-2.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl p-5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg uppercase tracking-wide">
              Edit profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Change your avatar and bio
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Avatar
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-400">
                      <Upload className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 cursor-pointer border-neutral-200 text-xs"
                  >
                    {uploading ? "Processing…" : "Upload image"}
                  </Button>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    JPG, PNG. Max {MAX_INPUT_MB}MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short bio..."
                rows={3}
                maxLength={160}
                className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:border-tento-lavender focus:outline-none focus:ring-1 focus:ring-tento-lavender"
              />
              <p className="mt-1 text-[10px] text-neutral-400">
                {bio.length}/160
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="h-9 w-full cursor-pointer bg-tento-lavender text-xs font-semibold text-white hover:bg-tento-lavender-hover disabled:opacity-60"
            >
              {loading ? (
                <span className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
