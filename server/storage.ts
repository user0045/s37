import { users, type User, type InsertUser } from "@shared/schema";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with direct configuration
const SUPABASE_URL = "https://kxlqebcjpefqtbwdxdss.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bHFlYmNqcGVmcXRid2R4ZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzU5MTEsImV4cCI6MjA2NTM1MTkxMX0.yCgy6oFmYLpmv-F7P04k43PMMqPD8YQQ1_Hz40YSMAk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

// Advertisement request types
interface CreateAdvertisementRequestData {
  email: string;
  description: string;
  budget: number;
  user_ip: string;
}

// Admin authentication types
interface AdminAuthData {
  id: string;
  admin_name: string;
  password: string;
  created_at: string;
  updated_at: string;
}

interface AdminLoginAttemptData {
  id: string;
  ip_address: string;
  admin_name: string;
  attempt_time: string;
  is_successful: boolean;
  created_at: string;
}

interface AdvertisementRequest {
  id: string;
  email: string;
  description: string;
  budget: number;
  user_ip: string;
  created_at: string;
  updated_at: string;
}

// Admin authentication functions
async function authenticateAdmin(adminName: string, password: string): Promise<AdminAuthData | null> {
  const { data, error } = await supabase
    .from('admin_auth')
    .select('*')
    .eq('admin_name', adminName)
    .eq('password', password)
    .single();

  if (error) {
    console.error('Error authenticating admin:', error);
    return null;
  }

  return data;
}

async function recordLoginAttempt(ipAddress: string, adminName: string, isSuccessful: boolean): Promise<void> {
  const { error } = await supabase
    .from('admin_login_attempts')
    .insert({
      ip_address: ipAddress,
      admin_name: adminName,
      is_successful: isSuccessful
    });

  if (error) {
    console.error('Error recording login attempt:', error);
  }
}

async function getRecentFailedAttempts(ipAddress: string): Promise<number> {
  const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('admin_login_attempts')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('is_successful', false)
    .gte('attempt_time', fortyFiveMinutesAgo);

  if (error) {
    console.error('Error getting recent failed attempts:', error);
    return 0;
  }

  return data?.length || 0;
}

async function isIpBlocked(ipAddress: string): Promise<boolean> {
  const failedAttempts = await getRecentFailedAttempts(ipAddress);
  return failedAttempts >= 5;
}

async function resetFailedAttempts(ipAddress: string): Promise<void> {
  const { error } = await supabase
    .from('admin_login_attempts')
    .delete()
    .eq('ip_address', ipAddress);

  if (error) {
    console.error('Error resetting failed attempts:', error);
  }
}


// Advertisement request functions
async function getAdvertisementRequests(): Promise<AdvertisementRequest[]> {
  try {
    const { data, error } = await supabase
      .from('advertisement_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching advertisement requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Database connection error:', error);
    return [];
  }
}

async function createAdvertisementRequest(data: CreateAdvertisementRequestData): Promise<AdvertisementRequest> {
  try {
    const { data: result, error } = await supabase
      .from('advertisement_requests')
      .insert([{
        email: data.email,
        description: data.description,
        budget: data.budget,
        user_ip: data.user_ip
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating advertisement request:', error);
      throw new Error('Failed to create advertisement request');
    }

    return result;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

async function deleteAdvertisementRequest(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('advertisement_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting advertisement request:', error);
      throw new Error('Failed to delete advertisement request');
    }
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

async function checkRecentAdvertisementRequest(userIP: string, since: Date): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('advertisement_requests')
      .select('id')
      .eq('user_ip', userIP)
      .gte('created_at', since.toISOString())
      .limit(1);

    if (error) {
      console.error('Error checking recent advertisement request:', error);
      return false;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Create storage instance and add methods
const storage = new MemStorage() as any;

// Add advertisement request methods to the main storage object
storage.getAdvertisementRequests = getAdvertisementRequests;
storage.createAdvertisementRequest = createAdvertisementRequest;
storage.deleteAdvertisementRequest = deleteAdvertisementRequest;
storage.checkRecentAdvertisementRequest = checkRecentAdvertisementRequest;

// Add admin authentication methods to the main storage object
storage.authenticateAdmin = authenticateAdmin;
storage.recordLoginAttempt = recordLoginAttempt;
storage.getRecentFailedAttempts = getRecentFailedAttempts;
storage.isIpBlocked = isIpBlocked;
storage.resetFailedAttempts = resetFailedAttempts;

export { storage };