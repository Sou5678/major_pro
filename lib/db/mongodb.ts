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
    serverSelectionTimeoutMS: 5_000,  // Reduced from 10s to 5s
    connectTimeoutMS: 5_000,           // Reduced from 10s to 5s
    socketTimeoutMS: 45_000,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

export async function getDatabase() {
  // During build time, skip database connection
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database not available during build');
  }
  
  if (!globalForMongo.mongoClient) {
    const client = createClient();
    if (!client) {
      throw new Error("MONGODB_URI is not configured.");
    }
    
    // Connect once during initialization
    if (!isConnecting && !connectionPromise) {
      isConnecting = true;
      connectionPromise = client.connect()
        .then(() => {
          globalForMongo.mongoClient = client;
          isConnecting = false;
          console.log('[MongoDB] Connected successfully');
        })
        .catch((error) => {
          isConnecting = false;
          connectionPromise = null;
          console.error('[MongoDB] Connection failed:', error.message);
          throw error;
        });
    }
    
    await connectionPromise;
  }

  return globalForMongo.mongoClient!.db(dbName);
}
