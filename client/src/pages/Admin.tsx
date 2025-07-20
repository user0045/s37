
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [blockInfo, setBlockInfo] = useState({ isBlocked: false, failedAttempts: 0, remainingAttempts: 5 });

  useEffect(() => {
    checkBlockedStatus();
  }, []);

  const checkBlockedStatus = async () => {
    try {
      const response = await fetch('/api/admin/check-blocked', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlockInfo(data);
        setIsBlocked(data.isBlocked);
        setRemainingAttempts(data.remainingAttempts);
      }
    } catch (error) {
      console.error('Error checking blocked status:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isBlocked) {
      setError('IP address is blocked. Please try again after 45 minutes.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setError('');
      } else {
        setError(data.error || 'Login failed');
        
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        
        if (response.status === 429) {
          setIsBlocked(true);
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-dark-green/30 to-black opacity-60 wave-transition pointer-events-none" />
      
      <div className="relative z-10">
        <Card className="w-96 bg-gradient-to-br from-black/60 via-dark-green/10 to-black/60 backdrop-blur-sm border border-border/30 shadow-2xl shadow-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-foreground">Admin Access</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Secure Premium Portal
            </CardDescription>
            
            {isBlocked && (
              <div className="flex items-center justify-center space-x-2 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">IP Blocked - 45 minutes</span>
              </div>
            )}
            
            {!isBlocked && remainingAttempts < 5 && (
              <div className="flex items-center justify-center space-x-2 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-400">
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:border-primary"
                  disabled={isBlocked || isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:border-primary"
                  disabled={isBlocked || isLoading}
                  required
                />
              </div>
              
              {error && (
                <p className="text-sm text-red-400 text-center bg-red-900/20 border border-red-700/30 rounded px-3 py-2">{error}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                disabled={isBlocked || isLoading}
              >
                {isLoading ? 'Logging in...' : 'Secure Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
