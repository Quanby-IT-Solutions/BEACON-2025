"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const createCodeSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be 50 characters or less"),
  isActive: z.boolean(),
});

type CreateCodeFormData = z.infer<typeof createCodeSchema>;

interface CreateCodeDialogProps {
  trigger: React.ReactNode;
  onCodeCreated: () => void;
  editingCode?: {
    id: string;
    code: string;
    isActive: boolean;
  };
  mode?: 'create' | 'edit';
}

export function CreateCodeDialog({ trigger, onCodeCreated, editingCode, mode = 'create' }: CreateCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get initial values based on mode
  const getInitialValues = () => {
    if (mode === 'edit' && editingCode) {
      return {
        code: editingCode.code,
        isActive: editingCode.isActive,
      };
    }
    return {
      code: "",
      isActive: false,
    };
  };

  const form = useForm<CreateCodeFormData>({
    resolver: zodResolver(createCodeSchema),
    defaultValues: getInitialValues(),
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && mode === 'edit' && editingCode) {
      // Load editing data when opening in edit mode
      form.reset(getInitialValues());
    } else if (!newOpen && !isSubmitting) {
      // Reset form when closing dialog
      form.reset(getInitialValues());
    }
    setOpen(newOpen);
  };

  const onSubmit = async (data: CreateCodeFormData) => {
    setIsSubmitting(true);
    try {
      const codeData = {
        ...(mode === 'edit' && editingCode ? { id: editingCode.id } : {}),
        code: data.code.trim().toUpperCase(), // Standardize to uppercase
        isActive: data.isActive,
      };

      const response = await fetch("/api/codes", {
        method: mode === 'edit' ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(codeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${mode} code`);
      }

      const result = await response.json();
      
      toast.success(`Code ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      form.reset(getInitialValues());
      handleOpenChange(false);
      onCodeCreated();
    } catch (error) {
      console.error("Error with code:", error);
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} code`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {mode === 'edit' ? 'Edit TML Code' : 'Create New TML Code'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Update the TML member code details.'
              : 'Add a new TML member code to the system.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Code Input */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TML Code *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter TML code" 
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a unique TML member code (will be converted to uppercase)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Code</FormLabel>
                    <FormDescription>
                      Active codes can be used for registration. Inactive codes are disabled.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  mode === 'edit' ? 'Update Code' : 'Create Code'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}