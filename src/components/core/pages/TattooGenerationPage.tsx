
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
import Image from 'next/image'; 
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

const tattooStyles = [
  "Traditional", "Realism", "Watercolor", "Tribal", "New School", "Neo Traditional", "Japanese", 
  "Blackwork", "Illustrative", "Geometric", "Minimalist", "Abstract", "Dotwork", "Sketch"
];

// Form schemas remain in English for consistency in code, labels will be translated.
// Zod messages are not easily translated without extra libraries or more complex setup.
const formSchema = z.object({
  description: z.string().min(10, { message: "Please describe your tattoo idea in at least 10 characters." }).max(1000),
  stylePreferences: z.string().min(1, { message: "Please select a style." }),
  keywords: z.string().max(200).optional(),
});

const refineFormSchema = z.object({
  additionalInfo: z.string().max(500).optional(),
});


export default function TattooGenerationPage() {
  const { t } = useSettings();

  const [isLoading, setIsLoading] = useState(false);
  const [generatedProposals, setGeneratedProposals] = useState<GeneratedProposal[]>([]);
  const [referenceImageDataUri, setReferenceImageDataUri] = useState<string>("");
  const [refiningProposal, setRefiningProposal] = useState<GeneratedProposal | null>(null);
  const [refinedDescription, setRefinedDescription] = useState<string>("");
  const [refineReferenceImageUri, setRefineReferenceImageUri] = useState<string>("");


  const [_savedDesigns, setSavedDesigns] = useLocalStorage<TattooDesign[]>('tattooDesigns', []); 
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
        toast({ title: t('designsGenerated'), description: t('designsGeneratedDescription') });
      } else {
        throw new Error("No proposals returned.");
      }
    } catch (error) {
      console.error("Error generating designs:", error);
      toast({ 
        variant: "destructive", 
        title: t('generationFailed'), 
        description: String(error instanceof Error ? error.message : error) || t('generationFailedDescription') 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineSubmit: SubmitHandler<z.infer<typeof refineFormSchema>> = async (values) => {
    if (!refiningProposal || !refineReferenceImageUri) { 
        toast({ 
            variant: "destructive", 
            title: t('missingImageForRefinement'), 
            description: t('missingImageForRefinementDescription') 
        });
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
        setRefiningProposal(prev => prev ? {...prev, description: result.refinedDesignDescription } : null);

        toast({ title: t('designRefined'), description: t('designRefinedDescription') });
      } else {
        throw new Error("Refinement did not return a description.");
      }
    } catch (error) {
      console.error("Error refining design:", error);
      toast({ 
        variant: "destructive", 
        title: t('refinementFailed'), 
        description: String(error instanceof Error ? error.message : error) || t('refinementFailedDescription') 
      });
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
    };
    setSavedDesigns(prevDesigns => [...prevDesigns, newDesign]);
    toast({ title: t('designSaved'), description: t('designSavedDescription') });
  };

  const buttonAnimationClasses = "hover:-translate-y-0.5 active:translate-y-0 transform transition-transform duration-150 ease-in-out";
  
  return (
    <div className="space-y-12">
      <Card className="shadow-2xl border-ring bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
            <Wand2 className="w-8 h-8 mr-3 text-primary" />
            <span className="animated-gradient-text">{t('createYourVision')}</span>
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {t('createYourVisionDescription')}
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
                    <FormLabel className="label-base-style label-pastel-1">{t('tattooIdeaDescription')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('tattooIdeaPlaceholder')} {...field} rows={5} className="bg-input/50 border-input focus:border-primary" />
                    </FormControl>
                    <div className="mt-1 px-3 py-1.5 bg-background border border-border rounded-md shadow-sm">
                      <FormDescription>{t('tattooIdeaDescriptionHint')}</FormDescription>
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
                      <FormLabel className="label-base-style label-pastel-2">{t('stylePreference')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-input/50 border-input focus:border-primary">
                            <SelectValue placeholder={t('selectStyle')} />
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
                      <FormLabel className="label-base-style label-pastel-3">{t('keywordsOptional')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('keywordsPlaceholder')} {...field} className="bg-input/50 border-input focus:border-primary" />
                      </FormControl>
                      <div className="mt-1 px-3 py-1.5 bg-background border border-border rounded-md shadow-sm">
                        <FormDescription>{t('keywordsHint')}</FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FileUpload
                label={t('referenceImageOptional')}
                labelClassName="label-base-style label-pastel-4"
                onFileUpload={(_fileName, dataUri) => setReferenceImageDataUri(dataUri)}
                id="generate-reference-image"
              />

              <Button type="submit" disabled={isLoading} size="lg" className={cn("w-full md:w-auto text-lg", buttonAnimationClasses)}>
                {isLoading ? <LoadingSpinner className="mr-2" /> : <Wand2 className="mr-2 h-5 w-5" />}
                {t('generateDesigns')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedProposals.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold tracking-tight text-center">{t('designProposals')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedProposals.map((proposal, index) => (
              <Card key={index} className="flex flex-col shadow-lg hover:shadow-primary/30 transition-shadow duration-300 bg-card/90">
                <CardHeader>
                  <CardTitle>{t('proposal')} {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{proposal.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
                  <Dialog onOpenChange={(open) => {
                     if (!open) { 
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
                        <Edit3 className="mr-2 h-4 w-4" /> {t('refine')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px] bg-background border-border">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{t('refineTattooProposal')}</DialogTitle>
                        <DialogDescription>
                          {t('refineTattooProposalDescription', { baseDescription: refiningProposal?.description.substring(0,100) + "..." || ""})}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...refineForm}>
                        <form onSubmit={refineForm.handleSubmit(handleRefineSubmit)} className="space-y-4">
                           <FormField
                              control={refineForm.control}
                              name="additionalInfo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('additionalNotes')}</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder={t('additionalNotesPlaceholder')} {...field} rows={3} className="bg-input/50 border-input focus:border-primary"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          <FileUpload
                            label={t('newReferenceImageRequired')}
                            labelClassName="label-base-style label-pastel-1" 
                            onFileUpload={(_fileName, dataUri) => setRefineReferenceImageUri(dataUri)}
                            id="refine-reference-image"
                          />
                           {refinedDescription && (
                            <Alert className="mt-4 border-primary/50">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-primary">{t('designUpdated')}</AlertTitle>
                                <AlertDescription>
                                {refinedDescription}
                                </AlertDescription>
                            </Alert>
                          )}
                          <DialogFooter>
                            <Button type="submit" disabled={isLoading || !refineReferenceImageUri} className={cn(buttonAnimationClasses)}>
                              {isLoading ? <LoadingSpinner className="mr-2" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                              {t('refineWithImage')}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={() => handleSaveDesign(proposal)} className={cn(buttonAnimationClasses)}>
                    <Save className="mr-2 h-4 w-4" /> {t('save')}
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
