import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { adminNotFound, getAdminSession, hasAdminPermission } from "@/features/auth/admin-access";
import client from "@/lib/mongodb-client";
import { ADMIN_USER_IDS } from "@/config/admins";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await getAdminSession())) return adminNotFound();

    const objectIds = ADMIN_USER_IDS
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    const candidates = await client.db()
      .collection<{ _id: string | ObjectId }>("user")
      .find({
        $or: [
          { _id: { $in: [...ADMIN_USER_IDS, ...objectIds] } },
          { role: /(?:^|,)admin(?:,|$)/ },
        ],
      })
      .project<{ _id: string | ObjectId; name?: string; email?: string; image?: string }>(
        { _id: 1, name: 1, email: 1, image: 1 },
      )
      .toArray();

    const users = await Promise.all(candidates.map(async (user) => {
      const id = user._id.toString();
      if (!(await hasAdminPermission(id))) return null;
      return {
        id,
        name: user.name || "Admin",
        email: user.email || "",
        image: user.image || "",
      };
    }));
    const admins = users.filter((user) => user !== null);

    return NextResponse.json({ success: true, admins }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}
