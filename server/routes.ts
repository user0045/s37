
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication endpoints
  
  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const userIP = req.ip || req.connection.remoteAddress || 'unknown';

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Check if IP is blocked
      const isBlocked = await storage.isIpBlocked(userIP);
      if (isBlocked) {
        return res.status(429).json({ 
          error: 'Too many failed login attempts. Please try again after 45 minutes.' 
        });
      }

      // Authenticate admin
      const admin = await storage.authenticateAdmin(username, password);
      
      if (admin) {
        // Record successful login attempt
        await storage.recordLoginAttempt(userIP, username, true);
        // Reset failed attempts after successful login
        await storage.resetFailedAttempts(userIP);
        res.json({ 
          success: true, 
          message: 'Login successful',
          admin: { id: admin.id, admin_name: admin.admin_name }
        });
      } else {
        // Record failed login attempt
        await storage.recordLoginAttempt(userIP, username, false);
        
        // Check how many failed attempts remain
        const failedAttempts = await storage.getRecentFailedAttempts(userIP);
        const remainingAttempts = 5 - failedAttempts;
        
        if (remainingAttempts <= 0) {
          return res.status(429).json({ 
            error: 'Too many failed login attempts. IP blocked for 45 minutes.' 
          });
        }
        
        res.status(401).json({ 
          error: 'Invalid credentials',
          remainingAttempts: remainingAttempts
        });
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  // Check if IP is blocked endpoint
  app.post("/api/admin/check-blocked", async (req, res) => {
    try {
      const userIP = req.ip || req.connection.remoteAddress || 'unknown';
      const isBlocked = await storage.isIpBlocked(userIP);
      const failedAttempts = await storage.getRecentFailedAttempts(userIP);
      
      res.json({ 
        isBlocked,
        failedAttempts,
        remainingAttempts: Math.max(0, 5 - failedAttempts)
      });
    } catch (error) {
      console.error('Error checking blocked status:', error);
      res.status(500).json({ error: 'Failed to check blocked status' });
    }
  });

  // Advertisement requests endpoints
  
  // Get all advertisement requests
  app.get("/api/advertisement-requests", async (req, res) => {
    try {
      const requests = await storage.getAdvertisementRequests();
      res.json(requests);
    } catch (error) {
      console.error('Error fetching advertisement requests:', error);
      res.status(500).json({ error: 'Failed to fetch advertisement requests' });
    }
  });

  // Create new advertisement request
  app.post("/api/advertisement-requests", async (req, res) => {
    try {
      const { email, description, budget, userIP } = req.body;

      if (!email || !description || !budget || !userIP) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate budget range
      const budgetAmount = parseFloat(budget);
      if (budgetAmount < 5000) {
        return res.status(400).json({ error: 'Minimum budget is ₹5,000' });
      }
      if (budgetAmount > 100000000) {
        return res.status(400).json({ error: 'Maximum budget is ₹10,00,00,000' });
      }

      // Check rate limiting (1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentRequest = await storage.checkRecentAdvertisementRequest(userIP, oneHourAgo);
      
      if (recentRequest) {
        return res.status(429).json({ 
          error: 'You can only make one advertisement request every hour. Please try again later.' 
        });
      }

      const newRequest = await storage.createAdvertisementRequest({
        email,
        description,
        budget: parseFloat(budget),
        user_ip: userIP
      });

      res.status(201).json(newRequest);
    } catch (error) {
      console.error('Error creating advertisement request:', error);
      res.status(500).json({ error: 'Failed to create advertisement request' });
    }
  });

  // Delete advertisement request
  app.delete("/api/advertisement-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAdvertisementRequest(id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting advertisement request:', error);
      res.status(500).json({ error: 'Failed to delete advertisement request' });
    }
  });

  // Check recent advertisement request
  app.post("/api/check-recent-ad-request", async (req, res) => {
    try {
      const { userIP, since } = req.body;
      const hasRecentRequest = await storage.checkRecentAdvertisementRequest(userIP, new Date(since));
      res.json({ hasRecentRequest });
    } catch (error) {
      console.error('Error checking recent advertisement request:', error);
      res.status(500).json({ error: 'Failed to check recent advertisement request' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
