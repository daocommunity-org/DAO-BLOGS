import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import client from "@/lib/mongodb-client";
import { ADMIN_USER_IDS } from "@/config/admins";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session || userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const db = client.db();
    
    // Convert designated user ID strings to ObjectIds safely
    const objectIds = ADMIN_USER_IDS
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    // Find all users who are admins by role or designated ID
    const users = await db
      .collection("user")
      .find({
        $or: [
          { role: "admin" },
          { _id: { $in: objectIds } },
        ],
      })
      .project({ _id: 1, name: 1, email: 1, image: 1, role: 1 })
      .toArray();

    const admins = users.map((u) => ({
      id: u._id.toString(),
      name: u.name || "Admin",
      email: u.email || "",
      image: u.image || "",
    }));

    return NextResponse.json({ success: true, admins });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}
