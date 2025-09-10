import db from "../../../db";
import { advocates } from "../../../db/schema";
import { count } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    if (!db) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count
    const [totalResult] = await db.select({ count: count() }).from(advocates);
    const total = totalResult.count;

    // Get paginated data
    const data = await db.select().from(advocates).limit(limit).offset(offset);

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      { error: "Failed to fetch advocates" },
      { status: 500 }
    );
  }
}
