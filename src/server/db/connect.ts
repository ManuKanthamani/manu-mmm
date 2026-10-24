import mongoose from "mongoose";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalMongoose = globalThis as typeof globalThis & {
  __mmmMongoose?: MongooseCache;
};

const cache = (globalMongoose.__mmmMongoose ??= {
  connection: null,
  promise: null,
});

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;
  if (!uri || !dbName) throw new Error("MongoDB connection settings are missing.");

  if (cache.connection) return cache.connection;

  cache.promise ??= mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 12_000,
  }).catch((error: unknown) => {
    cache.promise = null;
    throw error;
  });

  cache.connection = await cache.promise;
  return cache.connection;
}
