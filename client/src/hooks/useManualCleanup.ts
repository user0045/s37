
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useManualCleanup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('Running manual cleanup using PostgreSQL function...');
      
      // Call the PostgreSQL function you created
      const { data, error } = await supabase.rpc('manual_cleanup_expired_announcements');
      
      if (error) throw error;
      
      // The function returns an array with one row containing deleted_count and cleanup_date
      const result = data?.[0];
      return result?.deleted_count || 0;
    },
    onSuccess: (deletedCount) => {
      if (deletedCount > 0) {
        toast({ 
          title: "Cleanup Complete", 
          description: `Removed ${deletedCount} expired announcement${deletedCount === 1 ? '' : 's'}` 
        });
      } else {
        toast({ 
          title: "Cleanup Complete", 
          description: "No expired announcements found" 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['upcoming-content'] });
    },
    onError: (error) => {
      console.error('Error during manual cleanup:', error);
      toast({ 
        title: "Cleanup Error", 
        description: "Failed to clean up expired announcements", 
        variant: "destructive" 
      });
    },
  });
};
