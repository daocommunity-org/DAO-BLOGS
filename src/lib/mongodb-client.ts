import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Invalid/Missing environment variable: 'MONGODB_URI'");
}

const options = {};

declare global {
  var _mongoClient: MongoClient | undefined;
}

if (!global._mongoClient) {
  global._mongoClient = new MongoClient(uri, options);
}
const client: MongoClient = global._mongoClient;

export default client;
