import mongoose from "mongoose";

declare global {
  var _mongooseConnection: Promise<typeof mongoose> | undefined;
}

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (global._mongooseConnection) {
    return global._mongooseConnection;
  }

  global._mongooseConnection = mongoose.connect(uri);

  return global._mongooseConnection;
}
