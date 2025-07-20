import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import UploadContentTab from '@/components/admin/UploadContentTab';
import UpcomingContentTab from '@/components/admin/UpcomingContentTab';
import ManageContentTab from '@/components/admin/ManageContentTab';
import DemandsTab from '@/components/admin/DemandsTab';
import AdvertisementTab from './admin/AdvertisementTab';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0A7D4B]/20 to-black">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage content, uploads, demands, and advertisements</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-border/30">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Upload
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="manage" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Manage
            </TabsTrigger>
            <TabsTrigger 
              value="demands" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Demands
            </TabsTrigger>
            <TabsTrigger 
              value="advertisements" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Ads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <UploadContentTab />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <UpcomingContentTab />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <ManageContentTab />
          </TabsContent>

          <TabsContent value="demands" className="space-y-6">
            <DemandsTab />
          </TabsContent>

          <TabsContent value="advertisements" className="space-y-6">
            <AdvertisementTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;