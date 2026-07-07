import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2, Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { fileToDataUrl } from "@/lib/avatars";
import { MAX_POSTS_PER_PROFILE, type ProfilePost } from "@/lib/types";

export function PostsManager({ profileId }: { profileId: string }) {
  const qc = useQueryClient();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", profileId],
    queryFn: () => api.listPosts(profileId),
    retry: false,
  });

  const list: ProfilePost[] = posts ?? [];
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const add = useMutation({
    mutationFn: () =>
      api.addPost(profileId, { description: description.trim(), photoUrl }),
    onSuccess: () => {
      setDescription("");
      setPhotoUrl("");
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["posts", profileId] });
      qc.invalidateQueries({ queryKey: ["public-profile"] });
    },
  });

  const remaining = MAX_POSTS_PER_PROFILE - list.length;
  const canAdd = remaining > 0 && photoUrl && description.trim().length > 0;

  const onPickFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }
    setPhotoUrl(await fileToDataUrl(file));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Posts</h2>
        <span className="text-[11px] text-muted-foreground">
          {list.length} / {MAX_POSTS_PER_PROFILE} used
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Add up to {MAX_POSTS_PER_PROFILE} highlights — a photo and short caption.
      </p>

      {isLoading ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading posts…
        </div>
      ) : list.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              <div className="aspect-square w-full bg-muted">
                {p.photoUrl ? (
                  <img
                    src={p.photoUrl}
                    alt={p.description}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <p className="line-clamp-2 px-2.5 py-2 text-[11px] leading-snug text-foreground">
                {p.description}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          No posts yet.
        </div>
      )}

      {remaining > 0 ? (
        <div className="mt-5 space-y-2 rounded-xl border border-border bg-background/60 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              {photoUrl ? (
                <img src={photoUrl} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 240))}
                placeholder="Say something about this photo…"
                rows={2}
                className="input w-full resize-none text-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-accent"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {photoUrl ? "Change photo" : "Upload photo"}
                </button>
                <button
                  type="button"
                  disabled={!canAdd || add.isPending}
                  onClick={() => add.mutate()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-60"
                >
                  {add.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Add post
                </button>
              </div>
              {add.error && (
                <p className="text-[11px] text-red-400">
                  Couldn't add post. Backend may be waking up — please retry.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-[11px] text-muted-foreground">
          You've reached the {MAX_POSTS_PER_PROFILE}-post limit for this profile.
        </p>
      )}
    </div>
  );
}
