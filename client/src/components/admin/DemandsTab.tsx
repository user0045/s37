import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, Plus, ChevronLeft, ChevronRight, MessageCircle, Search, Calendar, Globe } from 'lucide-react';
import { useContentDemands, useCreateContentDemand, useDeleteDemand } from '@/hooks/useContentDemands';
import { useToast } from '@/hooks/use-toast';

const DemandsTab = () => {
  const { data: requests, isLoading, error } = useContentDemands();
  const createMutation = useCreateContentDemand();
  const deleteMutation = useDeleteDemand();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { toast } = useToast();
  const [showThankYou, setShowThankYou] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const filteredRequests = requests ? requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.content_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = !dateFilter || 
                       request.date === dateFilter;

    return matchesSearch && matchesDate;
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteMutation.mutateAsync(deleteConfirm.id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete content suggestion.',
          variant: 'destructive',
        });
      }
    }
  };

  const truncateDescription = (description: string | null, maxLength: number = 50) => {
    if (!description) return 'No description provided';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'
      : description;
  };

  if (isLoading) {
    return (
      <Card className="bg-card/40 backdrop-blur-sm border border-border/30">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/40 backdrop-blur-sm border border-border/30">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-foreground">Error loading content requests. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/40 backdrop-blur-sm border border-border/30">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">User Content Requests</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage and respond to user content suggestions and demands.
        </p>

        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, type, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary w-48"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Content Requests</CardTitle>
        </div>

        <div className="rounded-md border border-border/30 bg-background/20">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-muted/20">
                <TableHead className="text-foreground font-medium">Content Title</TableHead>
                <TableHead className="text-foreground font-medium">Type</TableHead>
                <TableHead className="text-foreground font-medium">Requested Date</TableHead>
                <TableHead className="text-foreground font-medium">Description</TableHead>
                <TableHead className="text-foreground font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request) => (
                  <TableRow key={request.id} className="border-border/30 hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">
                      {request.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {request.content_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.date ? new Date(request.date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="max-w-xs truncate">
                          {truncateDescription(request.description)}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs bg-transparent hover:bg-dark-green/20 text-muted-foreground hover:text-primary border-0 text-dark-green hover:text-primary"
                            >
                              See More
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card/95 backdrop-blur-sm border border-border/30">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">{request.title}</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                Full details of the content request
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-foreground">Type:</p>
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mt-1">
                                    {request.content_type}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">Requested Date:</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {request.date ? new Date(request.date).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {request.user_ip && (
                                <div>
                                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    User IP Address:
                                  </p>
                                  <p className="text-sm text-muted-foreground font-mono bg-background/50 px-2 py-1 rounded">
                                    {request.user_ip}
                                  </p>
                                </div>
                              )}

                              <div>
                                <p className="text-sm font-medium text-foreground mb-2">Description:</p>
                                <p className="text-foreground leading-relaxed">
                                  {request.description || 'No description provided'}
                                </p>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                  >
                                    Close
                                  </Button>
                                </DialogTrigger>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(request.id, request.title)}
                        disabled={deleteMutation.isPending}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No content requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="mt-2 text-sm text-muted-foreground">
          Total requests: {requests?.length || 0}
        </div>
      </CardContent>

      {/* Thank You Dialog */}
      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-center">Thank You!</DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              Thanks for your request! Our team will review it and contact you soon.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setShowThankYou(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card/90 backdrop-blur-sm border border-border/50 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Content Suggestion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background/50 border-border/50 hover:bg-background/70">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-destructive hover:scale-105 transition-all duration-200"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default DemandsTab;