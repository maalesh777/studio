
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FileUpload from '@/components/core/FileUpload';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import { generateTattooDesigns, GenerateTattooDesignsInput } from '@/ai/flows/generate-tattoo-designs';
import { refineTattooDesigns, RefineTattooDesignsInput } from '@/ai/flows/refine-tattoo-designs';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { TattooDesign, GeneratedProposal } from '@/lib/types';
import { Wand2, Edit3, Save, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image'; // Keep if needed, though not directly used in snippet
import { cn } from '@/lib/utils';

const tattooStyles = [
  "Traditional", "Realism", "Watercolor", "Tribal", "New School", "Neo Traditional", "Japanese", 
  "Blackwork", "Illustrative", "Geometric", "Minimalist", "Abstract", "Dotwork", "Sketch"
];

// const bodyPlacements = [ // This array is defined but not used. Keep or remove based on future plans.
//   "Arm (Upper)", "Arm (Forearm)", "Leg (Thigh)", "Leg (Calf)", "Back (Full)", "Back (Upper)", "Back (Lower)",
//   "Chest", "Stomach", "Ribs", "Shoulder", "Neck", "Hand", "Foot", "Ankle", "Wrist"
// ];

const formSchema = z.object({
  description: z.string().min(10, { message: "Please describe your tattoo idea in at least 10 characters." }).max(1000),
  stylePreferences: z.string().min(1, { message: "Please select a style." }),
  keywords: z.string().max(200).optional(),
});

const refineFormSchema = z.object({
  additionalInfo: z.string().max(500).optional(),
});


export default function TattooGenerationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedProposals, setGeneratedProposals] = useState<GeneratedProposal[]>([]);
  const [referenceImageDataUri, setReferenceImageDataUri] = useState<string>("");
  const [refiningProposal, setRefiningProposal] = useState<GeneratedProposal | null>(null);
  const [refinedDescription, setRefinedDescription] = useState<string>("");
  const [refineReferenceImageUri, setRefineReferenceImageUri] = useState<string>("");


  const [_savedDesigns, setSavedDesigns] = useLocalStorage<TattooDesign[]>('tattooDesigns', []); // Renamed to avoid conflict if savedDesigns is used elsewhere
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      stylePreferences: "",
      keywords: "",
    },
  });

  const refineForm = useForm<z.infer<typeof refineFormSchema>>({
    resolver: zodResolver(refineFormSchema),
    defaultValues: {
      additionalInfo: "",
    },
  });


  const handleGenerate: SubmitHandler<z.infer<typeof formSchema>> = async (values) => {
    setIsLoading(true);
    setGeneratedProposals([]);
    try {
      const input: GenerateTattooDesignsInput = {
        ...values,
        referenceImage: referenceImageDataUri || undefined,
      };
      const result = await generateTattooDesigns(input);
      if (result && result.designProposals) {
        setGeneratedProposals(result.designProposals.map(desc => ({ description: desc })));
        toast({ title: "Designs Generated!", description: "Explore your new tattoo ideas below." });
      } else {
        throw new Error("No proposals returned.");
      }
    } catch (error) {
      console.error("Error generating designs:", error);
      toast({ variant: "destructive", title: "Generation Failed", description: String(error) || "Could not generate tattoo designs. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineSubmit: SubmitHandler<z.infer<typeof refineFormSchema>> = async (values) => {
    if (!refiningProposal || !refineReferenceImageUri) { // Ensure reference image is present for this flow
        toast({ variant: "destructive", title: "Missing Image", description: "Please provide a reference image for refinement." });
        return;
    }
    setIsLoading(true);
    try {
      const refineInput: RefineTattooDesignsInput = { 
        baseDesignDescription: refiningProposal.description + (values.additionalInfo ? ` Additional notes: ${values.additionalInfo}` : ""),
        referenceImageDataUri: refineReferenceImageUri, 
      };

      const result = await refineTattooDesigns(refineInput); 
      
      if (result && result.refinedDesignDescription) {
        setRefinedDescription(result.refinedDesignDescription);
        setGeneratedProposals(prev => prev.map(p => 
            p.description === refiningProposal.description ? 
            { ...p, description: result.refinedDesignDescription, refinedImageGenerationPrompt: result.imageGenerationPrompt } : p
        ));
        // Update the refiningProposal itself if it's still in state, so if dialog re-opens it has new base
        setRefiningProposal(prev => prev ? {...prev, description: result.refinedDesignDescription } : null);

        toast({ title: "Design Refined!", description: "The selected design has been updated with new details." });
      } else {
        throw new Error("Refinement did not return a description.");
      }
      // Do not close dialog immediately, let user see the refinedDescription in the Alert
      // setRefiningProposal(null); 
      // setRefineReferenceImageUri(""); 
      // refineForm.reset();

    } catch (error) {
      console.error("Error refining design:", error);
      toast({ variant: "destructive", title: "Refinement Failed", description: String(error) || "Could not refine the tattoo design." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDesign = (proposal: GeneratedProposal) => {
    const newDesign: TattooDesign = {
      id: Date.now().toString(),
      description: proposal.description,
      stylePreferences: form.getValues('stylePreferences'),
      keywords: form.getValues('keywords'),
      referenceImage: referenceImageDataUri || undefined, 
      createdAt: new Date().toISOString(),
      // Potentially save `proposal.refinedImageGenerationPrompt` if available
    };
    setSavedDesigns(prevDesigns => [...prevDesigns, newDesign]);
    toast({ title: "Design Saved!", description: "View it in your Library." });
  };

  const buttonAnimationClasses = "hover:-translate-y-0.5 active:translate-y-0 transform transition-transform duration-150 ease-in-out";

  return (
    <div className="space-y-12">
      <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
            <Wand2 className="w-8 h-8 mr-3 text-primary" />
            Create Your Vision
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Describe your ideal tattoo. Let our AI bring it to life with unique design proposals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-8">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Tattoo Idea Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., A majestic wolf howling at a geometric moon, surrounded by forest silhouettes..." {...field} rows={5} className="bg-input/50 border-input focus:border-primary" />
                    </FormControl>
                    <div className="mt-1 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md">
                      <FormDescription>Be as detailed as possible for best results.</FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="stylePreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Style Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-input/50 border-input focus:border-primary">
                            <SelectValue placeholder="Select a tattoo style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border-popover">
                          {tattooStyles.map(style => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Keywords (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., nature, cosmic, vibrant, delicate" {...field} className="bg-input/50 border-input focus:border-primary" />
                      </FormControl>
                      <div className="mt-1 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md">
                        <FormDescription>Comma-separated keywords.</FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FileUpload
                label="Reference Image (Optional)"
                onFileUpload={(_fileName, dataUri) => setReferenceImageDataUri(dataUri)}
                id="generate-reference-image"
              />

              <Button type="submit" disabled={isLoading} size="lg" className={cn("w-full md:w-auto text-lg", buttonAnimationClasses)}>
                {isLoading ? <LoadingSpinner className="mr-2" /> : <Wand2 className="mr-2 h-5 w-5" />}
                Generate Designs
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedProposals.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold tracking-tight text-center">Generated Proposals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedProposals.map((proposal, index) => (
              <Card key={index} className="flex flex-col shadow-lg hover:shadow-primary/30 transition-shadow duration-300 bg-card/90">
                <CardHeader>
                  <CardTitle>Proposal {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{proposal.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
                  <Dialog onOpenChange={(open) => {
                     if (!open) { // When dialog closes
                        setRefiningProposal(null);
                        setRefineReferenceImageUri("");
                        refineForm.reset();
                        setRefinedDescription("");
                      }
                  }}>
                    <DialogTrigger asChild>
                       <Button variant="outline" className={cn(buttonAnimationClasses)} onClick={() => {
                          setRefiningProposal(proposal);
                          setRefinedDescription(""); 
                          setRefineReferenceImageUri(""); 
                          refineForm.reset({ additionalInfo: "" });
                        }}>
                        <Edit3 className="mr-2 h-4 w-4" /> Refine
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px] bg-background border-border">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Refine Tattoo Proposal</DialogTitle>
                        <DialogDescription>
                          Add more details or upload a new reference image to guide the refinement. Current base: "{refiningProposal?.description.substring(0,100)}..."
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...refineForm}>
                        <form onSubmit={refineForm.handleSubmit(handleRefineSubmit)} className="space-y-4">
                           <FormField
                              control={refineForm.control}
                              name="additionalInfo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Notes/Changes</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="e.g., Make the lines thinner, add more shading here..." {...field} rows={3} className="bg-input/50 border-input focus:border-primary"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          <FileUpload
                            label="New Reference Image for Refinement (Required)"
                            onFileUpload={(_fileName, dataUri) => setRefineReferenceImageUri(dataUri)}
                            id="refine-reference-image"
                          />
                           {refinedDescription && (
                            <Alert className="mt-4 border-primary/50">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-primary">Design Updated!</AlertTitle>
                                <AlertDescription>
                                {refinedDescription}
                                </AlertDescription>
                            </Alert>
                          )}
                          <DialogFooter>
                            <Button type="submit" disabled={isLoading || !refineReferenceImageUri} className={cn(buttonAnimationClasses)}>
                              {isLoading ? <LoadingSpinner className="mr-2" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                              Refine with Image
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={() => handleSaveDesign(proposal)} className={cn(buttonAnimationClasses)}>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

    

    