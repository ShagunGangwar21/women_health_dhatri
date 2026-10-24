import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FALLBACK_DB_PATH = path.join(DATA_DIR, 'db_fallback.json');

export let isMongoConnected = false;

// Fallback JSON-file database engine for zero-downtime reliability
class JsonStore {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FALLBACK_DB_PATH)) {
      fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify({
        users: [],
        cycles: [],
        symptoms: [],
        daily: [],
        reports: [],
        appointments: [],
        goals: [],
        conversations: []
      }, null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch {
      return { users: [], cycles: [], symptoms: [], daily: [], reports: [], appointments: [], goals: [], conversations: [] };
    }
  }

  write(data) {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2));
  }

  find(collection, query = {}) {
    const data = this.read();
    const items = data[collection] || [];
    return items.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
  }

  findOne(collection, query = {}) {
    const results = this.find(collection, query);
    return results[0] || null;
  }

  insert(collection, item) {
    const data = this.read();
    if (!data[collection]) data[collection] = [];
    const newItem = {
      _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    data[collection].push(newItem);
    this.write(data);
    return newItem;
  }

  findByIdAndUpdate(collection, id, updates) {
    const data = this.read();
    const items = data[collection] || [];
    const index = items.findIndex(i => i._id === id || i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(data);
    return items[index];
  }

  findByIdAndDelete(collection, id) {
    const data = this.read();
    const items = data[collection] || [];
    const filtered = items.filter(i => i._id !== id && i.id !== id);
    data[collection] = filtered;
    this.write(data);
    return true;
  }
}

export const fallbackStore = new JsonStore();

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dhatri';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log(`🌸 [Database] Connected to MongoDB at: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️ [Database] MongoDB connection skipped (${error.message}).`);
    console.log(`🌸 [Database] Activated resilient persistent file storage at: ${FALLBACK_DB_PATH}`);
  }
};
