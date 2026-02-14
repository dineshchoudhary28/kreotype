import { connectDB } from "@/lib/db";
import { Log } from "@/server/models/Log";
import mongoose from "mongoose";

type LogType = "auth_failure" | "banned_action" | "admin_action" | "error" | "suspicious_result";

interface LogData {
  [key: string]: any;
}

/**
 * Adds a log entry to the database.
 * This is an asynchronous function but is designed to be "fire-and-forget".
 * It intentionally does not block the main execution flow and handles its own errors silently.
 *
 * @param type The type of the log entry.
 * @param message A descriptive message for the log.
 * @param data Optional: A JavaScript object with additional data to log.
 * @param userId Optional: The ID of the user associated with the event.
 * @param important Optional: A boolean to flag the log entry as important.
 */
export async function addLog(
  type: LogType,
  message: string,
  data?: LogData,
  userId?: string | mongoose.Types.ObjectId,
  important?: boolean
): Promise<void> {
  try {
    await connectDB();

    await Log.create({
      type,
      message,
      data,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      important: important || false,
      timestamp: new Date(),
    });
  } catch (error) {
    // Silently log the error to the console for debugging, but don't re-throw
    console.error("Failed to write to audit log:", error);
  }
}
