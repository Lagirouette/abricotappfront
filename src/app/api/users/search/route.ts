import { ApiError, apiFetch } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/user";
import { User } from "@/src/types/api";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ users: [] });

  try {
    const [{ users }, me] = await Promise.all([
      apiFetch<{ users: User[] }>(`/users/search?query=${encodeURIComponent(query)}`),
      getCurrentUser(),
    ]);
    return NextResponse.json({ users: users.filter((u) => u.id !== me.id) });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
    throw error;
  }
}
