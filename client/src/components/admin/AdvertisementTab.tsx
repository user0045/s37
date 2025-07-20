import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, Globe, DollarSign, Calendar, Mail } from 'lucide-react';
import { useAdvertisementRequests, useDeleteAdvertisementRequest } from '@/hooks/useAdvertisementRequests';
import { useToast } from '@/hooks/use-toast';

const AdvertisementTab = () => {
  const { data: requests, isLoading, error } = useAdvertisementRequests();
  const deleteRequest = useDeleteAdvertisementRequest();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const itemsPerPage = 20;
  const { toast } = useToast();

  const filteredRequests = requests ? requests.filter(request => {
    const matchesSearch = request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_ip.includes(searchTerm);

    const matchesDate = !dateFilter || 
                       new Date(request.created_at).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesDate;
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handleDeleteRequest = (id: string) => {
    console.log('Selected request ID for deletion:', id);
    setSelectedRequestId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRequestId) {
      try {
        await deleteRequest.mutateAsync(selectedRequestId);
        setDeleteDialogOpen(false);
        setSelectedRequestId(null);
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading advertisement requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Error loading advertisement requests. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Advertisement Requests</h2>
        <p className="text-muted-foreground">
          Manage and review advertisement requests from potential advertisers.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by email, description, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary"
          />
        </div>
        <div className="sm:w-48">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{requests?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{Math.round(requests?.reduce((sum, req) => sum + req.budget, 0) || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  {requests?.filter(req => 
                    new Date(req.created_at).getMonth() === new Date().getMonth()
                  ).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {paginatedRequests.length === 0 ? (
          <Card className="bg-card/50 border-border/30">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No advertisement requests found.</p>
            </CardContent>
          </Card>
        ) : (
          paginatedRequests.map((request) => (
            <Card key={request.id} className="bg-card/50 border-border/30 hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-foreground">{request.email}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Budget: ₹{Math.round(request.budget).toLocaleString('en-IN')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary border border-primary/30 hover:border-primary/50 transition-all duration-200 mr-2"
                        >
                          See More
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/95 backdrop-blur-sm border border-border/30">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Advertisement Request</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Full details of the advertisement request
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">Email:</p>
                              <p className="text-sm text-muted-foreground font-mono bg-background/50 px-2 py-1 rounded">
                                {request.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Budget:</p>
                              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 mt-1">
                                ₹{Math.round(request.budget).toLocaleString('en-IN')}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">Request Date:</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                User IP:
                              </p>
                              <p className="text-sm text-muted-foreground font-mono bg-background/50 px-2 py-1 rounded">
                                {request.user_ip}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Description:</p>
                            <div className="bg-background/50 border border-border/30 rounded p-3 max-h-40 overflow-y-auto">
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {request.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRequest(request.id)}
                      className="h-6 w-6 p-0 border-red-600/30 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{request.description.length > 100 ? `${request.description.substring(0, 100)}...` : request.description}</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="bg-background/50 border-border/50"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="bg-background/50 border-border/50"
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-sm border border-border/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Advertisement Request</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this advertisement request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background/50 border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteRequest.isPending}
            >
              {deleteRequest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdvertisementTab;