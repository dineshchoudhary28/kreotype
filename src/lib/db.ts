import { Collection, Document } from "mongodb";
import mongoose from "mongoose";

declare global {
  var mongoose: {
    conn: typeof import("mongoose") | null;
    promise: Promise<typeof import("mongoose")> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      // Connection pool configuration for production workloads
      maxPoolSize: 50, // Maximum number of connections in the pool
      minPoolSize: 10, // Minimum number of connections to maintain
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Timeout for initial server selection
      heartbeatFrequencyMS: 10000, // Check server health every 10 seconds
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      // Retry configuration
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("✅ Connected to MongoDB via Mongoose");
      console.log(`   Pool: ${opts.minPoolSize}-${opts.maxPoolSize} connections`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// For compatibility with legacy code if any
export async function getDb() {
  await connectDB();
  return mongoose.connection.db;
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  // Cast to any to bypass version mismatch in types between mongodb package versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db.collection<T>(name) as any;
}
