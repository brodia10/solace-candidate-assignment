import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

const advocates = pgTable(
  "advocates",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("payload").default([]).notNull(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // Search indexes for performance
    firstNameIdx: index("advocates_first_name_idx").on(table.firstName),
    lastNameIdx: index("advocates_last_name_idx").on(table.lastName),
    cityIdx: index("advocates_city_idx").on(table.city),
    degreeIdx: index("advocates_degree_idx").on(table.degree),
    yearsOfExperienceIdx: index("advocates_years_of_experience_idx").on(
      table.yearsOfExperience
    ),
    // Composite index for full name search
    fullNameIdx: index("advocates_full_name_idx").on(
      table.firstName,
      table.lastName
    ),
    // GIN index for JSONB specialties search
    specialtiesIdx: index("advocates_specialties_idx").using(
      "gin",
      table.specialties
    ),
  })
);

export { advocates };
