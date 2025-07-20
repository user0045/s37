
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getUserIP } from '@/utils/ipUtils';

export interface AdvertisementRequest {
  id: string;
  email: string;
  description: string;
  budget: number;
  user_ip: string;
  created_at: string;
  updated_at: string;
}

export const useAdvertisementRequests = () => {
  return useQuery({
    queryKey: ['advertisement-requests'],
    queryFn: async () => {
      console.log('Fetching advertisement requests from database...');
      const { data, error } = await supabase
        .from('advertisement_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching advertisement requests:', error);
        throw error;
      }

      console.log('Fetched advertisement requests:', data);
      return data as AdvertisementRequest[];
    },
  });
};

export const useCreateAdvertisementRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestData: {
      email: string;
      description: string;
      budget: number;
    }) => {
      console.log('Creating advertisement request:', requestData);

      // Get user IP
      const userIP = await getUserIP();

      // Check if user has made a request in the last 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentRequests, error: checkError } = await supabase
        .from('advertisement_requests')
        .select('id')
        .eq('user_ip', userIP)
        .gte('created_at', oneHourAgo)
        .limit(1);

      if (checkError) {
        console.error('Error checking recent requests:', checkError);
        throw checkError;
      }

      if (recentRequests && recentRequests.length > 0) {
        throw new Error('You can only make one advertisement request every hour. Please try again later.');
      }

      // Validate budget range (client-side check)
      if (requestData.budget > 100000000) {
        throw new Error('Maximum budget is ₹10,00,00,000');
      }

      const { data, error } = await supabase
        .from('advertisement_requests')
        .insert([{
          email: requestData.email,
          description: requestData.description,
          budget: requestData.budget,
          user_ip: userIP,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating advertisement request:', error);
        throw error;
      }

      console.log('Created advertisement request:', data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your advertisement request has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['advertisement-requests'] });
    },
    onError: (error: any) => {
      console.error('Error creating advertisement request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAdvertisementRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting advertisement request with id:', id);
      
      // First check if the record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('advertisement_requests')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('Error checking record existence:', checkError);
        throw new Error('Record not found or database error');
      }

      if (!existingRecord) {
        throw new Error('Record not found');
      }

      // Now delete the record
      const { data, error } = await supabase
        .from('advertisement_requests')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      // Check if any rows were actually deleted
      if (!data || data.length === 0) {
        throw new Error('No rows were deleted');
      }

      console.log('Delete result:', data);
      return id;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Advertisement request deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['advertisement-requests'] });
    },
    onError: (error: any) => {
      console.error('Error deleting advertisement request:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete request", 
        variant: "destructive" 
      });
    },
  });
};
