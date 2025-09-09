"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
    message: 'Color must be a valid hex code.',
  }),
  billing_rate: z.string().optional(),
});

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Project) => void;
  project: Project | null;
}

type FormData = z.infer<typeof formSchema>;

export default function ProjectForm({ isOpen, onClose, onSubmit, project }: ProjectFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      color: project?.color || '#3B82F6',
      billing_rate: project?.billing_rate ? project.billing_rate.toString() : undefined,
    },
  });

  const handleSubmit = async (values: FormData) => {
    const method = project ? 'PUT' : 'POST';
    const url = project ? `/api/projects/${project.id}` : '/api/projects';
    
    // Convert string to number for billing_rate and validate
    const billingRate = values.billing_rate && values.billing_rate.trim() !== '' 
      ? parseFloat(values.billing_rate) 
      : undefined;
    
    if (billingRate !== undefined && (isNaN(billingRate) || billingRate <= 0)) {
      form.setError('billing_rate', {
        type: 'manual',
        message: 'Billing rate must be a positive number',
      });
      return;
    }
    
    const submitData = {
      ...values,
      billing_rate: billingRate,
    };
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData),
    });
    const savedProject = await response.json();
    onSubmit(savedProject);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Project description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billing_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Rate ($/hour)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
