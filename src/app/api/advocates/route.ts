import db from "../../../db";
import { advocates } from "../../../db/schema";
import { count, ilike, or, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL || !db) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100); // Cap at 100
    const offset = (page - 1) * limit;
    const searchTerm = searchParams.get("search")?.trim();

    // Build search conditions
    let whereConditions: any[] = [];
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      whereConditions = [
        ilike(advocates.firstName, searchPattern),
        ilike(advocates.lastName, searchPattern),
        ilike(advocates.city, searchPattern),
        ilike(advocates.degree, searchPattern),
        // Search in JSONB specialties array
        sql`${advocates.specialties}::text ILIKE ${searchPattern}`,
        // Search years of experience as string
        sql`${advocates.yearsOfExperience}::text ILIKE ${searchPattern}`,
      ];
    }

    const whereClause =
      whereConditions.length > 0 ? or(...whereConditions) : undefined;

    // Get total count with search filter
    const [totalResult] = await db
      .select({ count: count() })
      .from(advocates)
      .where(whereClause);
    const total = totalResult.count;

    // Get paginated data with search filter
    const data = await db
      .select()
      .from(advocates)
      .where(whereClause)
      .orderBy(advocates.lastName, advocates.firstName) // Consistent ordering
      .limit(limit)
      .offset(offset);

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
      searchTerm: searchTerm || null,
    });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      { error: "Failed to fetch advocates" },
      { status: 500 }
    );
  }
}
