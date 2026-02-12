"use client";

import { useFormStatus } from "react-dom";

function Button({ isFollowing }: { isFollowing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`follow-btn ${isFollowing ? "following" : ""}`}
      type="submit"
      disabled={pending}
    >
      {pending ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export default function FollowButton({
  action,
  isFollowing,
}: {
  action: () => void;
  isFollowing: boolean;
}) {
  return (
    <form action={action}>
      <Button isFollowing={isFollowing} />
    </form>
  );
}
