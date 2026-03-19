#!/usr/bin/env node

import { execSync } from "node:child_process";
import { exit } from "node:process";
import { config } from "dotenv";

config();

const projectRef = process.env.PROJECT_REF;

if (!projectRef) {
  console.error("PROJECT_REF environment variable is not set");
  exit(1);
}

try {
  execSync(
    `supabase gen types typescript --project-id ${projectRef} --schema public > lib/supabase/database.types.ts`,
    { stdio: "inherit" },
  );
  console.log("Database types generated successfully");
} catch (error) {
  console.error("Failed to generate database types:", (error as Error).message);
  exit(1);
}
