import { cookies, headers } from "next/headers";

const DEV_USER_ID = "demo-user";

export function getCurrentUserId() {
  const cookieStore = cookies();
  const headerStore = headers();
  return (
    cookieStore.get("uid")?.value ||
    headerStore.get("x-user-id") ||
    DEV_USER_ID
  );
}
