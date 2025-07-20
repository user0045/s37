import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Smart content order management function - try increasing first, then decrease sequentially
const manageContentOrder = async (targetOrder: number, excludeId: string | null = null) => {
  // Get all existing content ordered by content_order and created_at
  const query = supabase
    .from('upcoming_content')
    .select('id, content_order, created_at')
    .order('content_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (excludeId) {
    query.neq('id', excludeId);
  }

  const { data: allContent, error } = await query;
  if (error) throw error;

  if (!allContent || allContent.length === 0) {
    return; // No existing content, nothing to manage
  }

  // Check if targetOrder already exists
  const conflictingContent = allContent?.find(content => content.content_order === targetOrder);

  if (!conflictingContent) {
    // No conflict, nothing to do
    return;
  }

  // Get all content items at or above the target order, sorted by content_order ascending, then by created_at
  const contentAtOrAboveTarget = allContent
    .filter(content => content.content_order >= targetOrder)
    .sort((a, b) => {
      if (a.content_order === b.content_order) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return a.content_order - b.content_order;
    });

  // Try to shift everything up by 1 first (preferred approach)
  const maxOrder = Math.max(...allContent.map(c => c.content_order));
  
  if (maxOrder < 20) {
    // We have space to shift up, process from highest to lowest to avoid conflicts
    const reversedContent = [...contentAtOrAboveTarget].reverse();
    
    for (const content of reversedContent) {
      const newOrder = content.content_order + 1;
      if (newOrder <= 20) {
        await supabase
          .from('upcoming_content')
          .update({ content_order: newOrder })
          .eq('id', content.id);
      } else {
        // If we can't shift up anymore, we need to use the shift down approach
        break;
      }
    }
  } else {
    // No space to shift up, need to shift down
    // Find the lowest available position
    const usedOrders = new Set(allContent.map(c => c.content_order));
    let availablePosition = 1;
    
    while (usedOrders.has(availablePosition) && availablePosition < targetOrder) {
      availablePosition++;
    }
    
    if (availablePosition >= targetOrder) {
      throw new Error('Cannot resolve content order conflict - no available positions');
    }
    
    // Shift all content at or above target down to make space
    const contentToShiftDown = allContent
      .filter(content => content.content_order >= availablePosition && content.content_order < targetOrder)
      .sort((a, b) => a.content_order - b.content_order); // Process from lowest to highest
    
    for (const content of contentToShiftDown) {
      const newOrder = content.content_order - 1;
      if (newOrder >= 1) {
        await supabase
          .from('upcoming_content')
          .update({ content_order: newOrder })
          .eq('id', content.id);
      }
    }
    
    // Now shift the conflicting content at target position
    await supabase
      .from('upcoming_content')
      .update({ content_order: targetOrder - 1 })
      .eq('id', conflictingContent.id);
  }
};

interface UpcomingContentData {
  title: string;
  contentType: string;
  releaseDate: string;
  ratingType?: string;
  description: string;
  thumbnailUrl: string;
  trailerUrl: string;
  contentOrder: string;
  selectedGenres: string[];
  directors: string[];
  writers: string[];
  cast: string[];
}

export const useCreateUpcomingContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpcomingContentData) => {
      console.log('Creating upcoming content:', data);

      // Validate all required fields
      if (!data.title || !data.contentType || !data.releaseDate || !data.description || 
          !data.thumbnailUrl || !data.trailerUrl || !data.contentOrder || 
          !data.selectedGenres.length || !data.directors.length || 
          !data.writers.length || !data.cast.length) {
        throw new Error('All fields are required. Please fill in all the form fields.');
      }

      // Validate release date (tomorrow to 3 years from now)
      const releaseDate = new Date(data.releaseDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const threeYearsFromNow = new Date();
      threeYearsFromNow.setFullYear(today.getFullYear() + 3);

      tomorrow.setHours(0, 0, 0, 0);
      releaseDate.setHours(0, 0, 0, 0);

      if (releaseDate < tomorrow || releaseDate > threeYearsFromNow) {
        throw new Error('Release date must be from tomorrow onwards and within 3 years.');
      }

      // Check if we already have 20 announcements
      const { data: existingContent, error: countError } = await supabase
        .from('upcoming_content')
        .select('id', { count: 'exact' });

      if (countError) throw countError;

      if (existingContent && existingContent.length >= 20) {
        throw new Error('Maximum of 20 announcements allowed. Please delete some existing announcements first.');
      }

      const targetOrder = parseInt(data.contentOrder);

      // Smart content order management - maintain sequential order
      await manageContentOrder(targetOrder, null);

      const { data: result, error } = await supabase
        .from('upcoming_content')
        .insert([{
          title: data.title,
          content_type: data.contentType as any,
          genre: data.selectedGenres,
          release_date: data.releaseDate,
          content_order: targetOrder,
          rating_type: data.ratingType as any,
          directors: data.directors,
          writers: data.writers,
          cast_members: data.cast,
          thumbnail_url: data.thumbnailUrl,
          description: data.description,
          trailer_url: data.trailerUrl,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async () => {
      toast({ title: "Success", description: "Upcoming content announced successfully!" });
      queryClient.invalidateQueries({ queryKey: ['upcoming-content'] });
    },
    onError: (error: any) => {
      console.error('Error creating upcoming content:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to announce content", 
        variant: "destructive" 
      });
    },
  });
};

export const useUpdateUpcomingContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpcomingContentData) => {
      console.log('Updating upcoming content:', id, data);

      // Validate all required fields
      if (!data.title || !data.contentType || !data.releaseDate || !data.description || 
          !data.thumbnailUrl || !data.trailerUrl || !data.contentOrder || 
          !data.selectedGenres.length || !data.directors.length || 
          !data.writers.length || !data.cast.length) {
        throw new Error('All fields are required. Please fill in all the form fields.');
      }

      // Validate release date (tomorrow to 3 years from now)
      const releaseDate = new Date(data.releaseDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const threeYearsFromNow = new Date();
      threeYearsFromNow.setFullYear(today.getFullYear() + 3);

      tomorrow.setHours(0, 0, 0, 0);
      releaseDate.setHours(0, 0, 0, 0);

      if (releaseDate < tomorrow || releaseDate > threeYearsFromNow) {
        throw new Error('Release date must be from tomorrow onwards and within 3 years.');
      }

      const targetOrder = parseInt(data.contentOrder);

      // Get current content order for this item
      const { data: currentContent, error: currentError } = await supabase
        .from('upcoming_content')
        .select('content_order')
        .eq('id', id)
        .single();

      if (currentError) throw currentError;

      // Always apply content order management to ensure no duplicates
      // This handles both order changes and ensures sequential integrity
      await manageContentOrder(targetOrder, id);

      const { data: result, error } = await supabase
        .from('upcoming_content')
        .update({
          title: data.title,
          content_type: data.contentType as any,
          genre: data.selectedGenres,
          release_date: data.releaseDate,
          content_order: targetOrder,
          rating_type: data.ratingType as any,
          directors: data.directors,
          writers: data.writers,
          cast_members: data.cast,
          thumbnail_url: data.thumbnailUrl,
          description: data.description,
          trailer_url: data.trailerUrl,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Upcoming content updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['upcoming-content'] });
    },
    onError: (error) => {
      console.error('Error updating upcoming content:', error);
      toast({ title: "Error", description: "Failed to update content", variant: "destructive" });
    },
  });
};

export const useDeleteUpcomingContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting upcoming content:', id);

      const { error } = await supabase
        .from('upcoming_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Upcoming content deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['upcoming-content'] });
    },
    onError: (error) => {
      console.error('Error deleting upcoming content:', error);
      toast({ title: "Error", description: "Failed to delete content", variant: "destructive" });
    },
  });
};