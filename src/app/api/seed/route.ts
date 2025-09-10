import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function POST() {
  try {
    if (!db) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const records = await db.insert(advocates).values(advocateData).returning();
    return Response.json({ advocates: records });
  } catch (error) {
    console.error("Error seeding database:", error);
    return Response.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
