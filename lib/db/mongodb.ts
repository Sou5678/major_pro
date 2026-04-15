import { MongoClient, ServerApiVersion } from "mongodb";

const dbName = process.env.MONGODB_DB_NAME ?? "resumeiq";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

function createClient() {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  return new MongoClient(process.env.MONGODB_URI, {
    tlsAllowInvalidCertificates: true,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30_000,
    serverSelectionTimeoutMS: 10_000, // Increased from 5s to 10s
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

export async function getDatabase() {
  // Always cache the client globally — in both dev and prod
  if (!globalForMongo.mongoClient) {
    const client = createClient();
    if (!client) {
      throw new Error("MONGODB_URI is not configured.");
    }
    globalForMongo.mongoClient = client;
  }

  await globalForMongo.mongoClient.connect();
  return globalForMongo.mongoClient.db(dbName);
}
