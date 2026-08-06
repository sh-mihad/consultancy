import mongoose from "mongoose"

/**
 * Mongoose connection, cached on globalThis.
 *
 * Next.js re-executes modules on every hot reload in dev, and route handlers run
 * in a long-lived process in prod. Without this cache each reload/request opens a
 * fresh connection until MongoDB refuses new ones.
 */

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalForMongoose = globalThis as unknown as {
  _mongooseCache?: MongooseCache
}

const cached: MongooseCache = globalForMongoose._mongooseCache ?? {
  conn: null,
  promise: null,
}

globalForMongoose._mongooseCache = cached

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI

    // Checked here rather than at module scope: a top-level throw would break
    // `next build`, which imports modules without a populated env.
    if (!uri) {
      throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.")
    }

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        // Fail fast instead of hanging a request for 30s when mongod is down.
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m)
      .catch((err) => {
        // Clear the promise so the next request retries instead of resolving
        // the same rejected promise forever.
        cached.promise = null
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export async function dbDisconnect(): Promise<void> {
  if (!cached.conn) return
  await cached.conn.disconnect()
  cached.conn = null
  cached.promise = null
}
