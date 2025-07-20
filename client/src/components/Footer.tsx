import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getUserIP } from '@/utils/ipUtils';
import { useCreateAdvertisementRequest } from '@/hooks/useAdvertisementRequests';

const Footer: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    description: '',
    budget: ''
  });
  const createAdvertisementRequest = useCreateAdvertisementRequest();
  const { toast } = useToast();
  const [errors, setErrors] = useState({
    email: '',
    description: '',
    budget: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: any = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }

    if (!formData.description) {
      newErrors.description = 'Description is required';
      valid = false;
    }

    if (!formData.budget) {
      newErrors.budget = 'Budget is required';
      valid = false;
    } else if (parseInt(formData.budget) < 5000) {
      newErrors.budget = 'Minimum budget is ₹5,000';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.description || !formData.budget) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.budget) > 100000000) {
      toast({
        title: "Error",
        description: "Maximum budget is ₹10,00,00,000",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAdvertisementRequest.mutateAsync({
        email: formData.email,
        description: formData.description,
        budget: parseFloat(formData.budget),
      });

      // Reset form and close dialog
      setFormData({ email: '', description: '', budget: '' });
      setErrors({ email: '', description: '', budget: '' });
      setIsDialogOpen(false);

      // Show success message
      toast({
        title: "Request Submitted Successfully!",
        description: "Thanks for your request! Our team will review it and contact you soon.",
        duration: 5000,
      });
    } catch (error: any) {
      // Error handling is done in the hook
      console.error('Error submitting advertisement request:', error);
    }
  };

  const handleCancel = () => {
    setFormData({ email: '', description: '', budget: '' });
    setIsDialogOpen(false);
    setErrors({ email: '', description: '', budget: '' });
  };

  return (
    <footer className="bg-gradient-to-br from-black/90 via-[#0A7D4B]/20 to-black/90 backdrop-blur-sm border-t border-border/50 mt-auto w-full">
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Brand Section - 1/3 width */}
          <div className="flex flex-col items-center justify-start text-center">
            <h3 className="text-lg font-bold text-primary mb-3">GreenFlix</h3>
            <p className="text-sm text-muted-foreground px-4 leading-relaxed">
              Your ultimate destination for movies, web series, and TV shows.
              <br />
              Stream endless entertainment with high-quality content.
              <br />
              Discover new favorites and revisit classics anytime.
              <br />
              Experience cinema like never before.
            </p>
          </div>

          {/* Quick Links - 1/3 width */}
          <div className="flex flex-col items-center justify-start">
            <h4 className="text-base font-semibold text-foreground mb-3">Quick Links</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex flex-col space-y-2">
                <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors text-center">
                  Home
                </a>
                <a href="/movies" className="text-sm text-muted-foreground hover:text-primary transition-colors text-center">
                  Movies
                </a>
                <a href="/tv-shows" className="text-sm text-muted-foreground hover:text-primary transition-colors text-center">
                  Shows
                </a>
              </div>
              <div className="flex flex-col space-y-2">
                <a href="/web-series" className="text-sm text-muted-foreground hover:text-primary transition-colors text-center">
                  Web Series
                </a>
                <a href="/upcoming" className="text-sm text-muted-foreground hover:text-primary transition-colors text-center">
                  Upcoming
                </a>
              </div>
            </div>
          </div>

          {/* Categories - 1/3 width with 3 columns */}
          <div className="flex flex-col items-center justify-start">
            <h4 className="text-base font-semibold text-foreground mb-3">Categories</h4>
            <div className="grid grid-cols-3 gap-x-3 gap-y-2">
              <span className="text-sm text-muted-foreground text-center">Action</span>
              <span className="text-sm text-muted-foreground text-center">Comedy</span>
              <span className="text-sm text-muted-foreground text-center">Drama</span>
              <span className="text-sm text-muted-foreground text-center">Horror</span>
              <span className="text-sm text-muted-foreground text-center">Sci-Fi</span>
              <span className="text-sm text-muted-foreground text-center">Thriller</span>
              <span className="text-sm text-muted-foreground text-center">Crime</span>
              <span className="text-sm text-muted-foreground text-center">Family</span>
            </div>
          </div>
        </div>

        {/* Advertisement Contact Button */}
        <div className="flex justify-center mt-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              >
                Contact For Advertisement
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-sm border border-border/30 max-w-md w-[95vw] max-h-[90vh] mx-4">
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm sm:text-base">Advertisement Request</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                  Tell us about your advertisement needs and we'll get back to you soon.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto px-1">
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="email" className="text-foreground text-xs sm:text-sm">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`bg-background/50 border-border/50 focus:border-primary text-xs sm:text-sm h-8 sm:h-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="your@email.com"
                    required
                  />
                   {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="description" className="text-foreground text-xs sm:text-sm">Advertisement Description (Max 1000 words) *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      const wordCount = e.target.value.trim().split(/\s+/).filter(word => word.length > 0).length;
                      if (wordCount <= 1000 || e.target.value === '') {
                        setFormData({ ...formData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: '' });
                      }
                    }}
                    className={`bg-background/50 border-border/50 focus:border-primary min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe the type of advertisement you want to display on our platform..."
                    required
                  />
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Words: {formData.description.trim().split(/\s+/).filter(word => word.length > 0).length}/1000
                  </div>
                   {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="budget" className="text-foreground text-xs sm:text-sm">Budget (INR) - Minimum ₹5,000</Label>
                  <div className="relative">
                    <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">₹</span>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="5000"
                      value={formData.budget}
                      onChange={(e) => {
                        setFormData({ ...formData, budget: e.target.value });
                        if (errors.budget) setErrors({ ...errors, budget: '' });
                      }}
                      className={`bg-background/50 border-border/50 focus:border-primary pl-6 sm:pl-8 text-xs sm:text-sm h-8 sm:h-10 ${errors.budget ? 'border-red-500' : ''}`}
                      min="5000"
                      step="1"
                      required
                    />
                  </div>
                   {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    className="w-full sm:flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                    disabled={createAdvertisementRequest.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:flex-1 h-8 sm:h-10 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5"
                    disabled={createAdvertisementRequest.isPending}
                  >
                    {createAdvertisementRequest.isPending ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/30 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 GreenFlix. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <span className="text-sm text-muted-foreground">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;