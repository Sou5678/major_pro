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
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30_000,
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
    retryWrites: true,
    retryReads: true,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: false,
    },
  });
}

let isConnecting = false;
let connectionPromise: Promise<void> | null = null;
let connectionFailed = false;

export async function getDatabase() {
  // During build time, skip database connection
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database not available during build');
  }
  
  // If connection previously failed, throw immediately to use fallback
  if (connectionFailed) {
    throw new Error('MongoDB connection unavailable - using fallback storage');
  }
  
  if (!globalForMongo.mongoClient) {
    const client = createClient();
    if (!client) {
      connectionFailed = true;
      throw new Error("MONGODB_URI is not configured.");
    }
    
    // Connect once during initialization with timeout
    if (!isConnecting && !connectionPromise) {
      isConnecting = true;
      
      // Add a timeout wrapper
      const connectWithTimeout = Promise.race([
        client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('MongoDB connection timeout')), 8000)
        )
      ]);
      
      connectionPromise = connectWithTimeout
        .then(() => {
          globalForMongo.mongoClient = client;
          isConnecting = false;
          connectionFailed = false;
          console.log('[MongoDB] Connected successfully');
        })
        .catch((error) => {
          isConnecting = false;
          connectionPromise = null;
          connectionFailed = true;
          console.warn('[MongoDB] Connection failed, will use fallback storage:', error.message);
          throw error;
        });
    }
    
    await connectionPromise;
  }

  return globalForMongo.mongoClient!.db(dbName);
}
