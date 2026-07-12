import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ProfileView } from "@/components/ProfileView";
import { api } from "@/lib/api";
import { PROFILE_TYPES, type ProfileType } from "@/lib/types";
import { avatarKeyById, avatarKeyByHandle, avatarKeyByHandleType, getAvatar } from "@/lib/avatars";

export const Route = createFileRoute("/u/$handle/$type")({
  loader: ({ params }) => {
    if (!PROFILE_TYPES.includes(params.type as ProfileType)) throw notFound();
    return { type: params.type as ProfileType };
  },
  head: ({ params }) => ({
    meta: [{ title: `@${params?.handle} — TapMe` }],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-hero text-center">
      <div>
        <p className="text-lg font-semibold">Unknown profile type</p>
        <Link to="/" className="text-sm text-primary underline">Go home</Link>
      </div>
    </div>
  ),
  component: PublicProfile,
});

function PublicProfile() {
  const { handle, type } = Route.useParams();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["public-profile", handle],
    queryFn: () => api.getProfileByUsername(handle),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: posts } = useQuery({
    queryKey: ["posts", data?.id],
    queryFn: () => api.listPosts(data!.id),
    enabled: !!data?.id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const onBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <div className="min-h-screen bg-hero px-4 py-8">
      <div className="mx-auto flex max-w-sm items-center justify-between pb-6 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <span>tapme.in/{handle}</span>
      </div>
      <div className="flex justify-center">
        <PhoneFrame>
          {isLoading ? (
            <div className="flex h-[560px] items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : (
            <ProfileView
              type={type as ProfileType}
              data={data ?? undefined}
              posts={posts ?? undefined}
              handle={handle}
              avatarUrl={
                data?.photoUrl ||
                getAvatar(
                  ...(data?.id ? [avatarKeyById(data.id)] : []),
                  avatarKeyByHandleType(handle, type),
                  avatarKeyByHandle(handle),
                )
              }
            />
          )}
        </PhoneFrame>
      </div>
    </div>
  );
}

