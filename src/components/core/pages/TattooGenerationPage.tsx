
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
import { generateTattooImage, GenerateTattooImageInput } from '@/ai/flows/generate-tattoo-image'; // New import
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { TattooDesign, GeneratedProposal } from '@/lib/types';
import { Wand2, Edit3, Save, RefreshCcw, CheckCircle2, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image'; 
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

const tattooStyles = [
  "Traditional", "Realism", "Watercolor", "Tribal", "New School", "Neo Traditional", "Japanese", 
  "Blackwork", "Illustrative", "Geometric", "Minimalist", "Abstract", "Dotwork", "Sketch"
];

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

  const [isLoading, setIsLoading] = useState(false); // General loading for initial proposals
  const [isProcessingImage, setIsProcessingImage] = useState(false); // For any image generation/refinement
  const [generatedProposals, setGeneratedProposals] = useState<GeneratedProposal[]>([]);
  const [referenceImageDataUri, setReferenceImageDataUri] = useState<string>("");
  
  const [refiningProposalData, setRefiningProposalData] = useState<{ proposal: GeneratedProposal; originalDescription: string; index: number } | null>(null);
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
        setGeneratedProposals(result.designProposals.map(desc => ({ description: desc, isGeneratingImage: false })));
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

  const handleGenerateImageForProposal = async (proposalIndex: number) => {
    const proposal = generatedProposals[proposalIndex];
    if (!proposal) return;

    setGeneratedProposals(prev => 
      prev.map((p, i) => i === proposalIndex ? { ...p, isGeneratingImage: true } : p)
    );
    setIsProcessingImage(true);

    try {
      const imageResult = await generateTattooImage({ prompt: proposal.description });
      setGeneratedProposals(prev => 
        prev.map((p, i) => i === proposalIndex ? { ...p, generatedImageUri: imageResult.imageDataUri, isGeneratingImage: false } : p)
      );
      toast({ title: t('imageGeneratedSuccessTitle'), description: t('imageGeneratedSuccessDescription')});
    } catch (error) {
      console.error("Error generating image for proposal:", error);
      toast({
        variant: "destructive",
        title: t('imageGeneratedErrorTitle'),
        description: t('imageGeneratedErrorDescription') + ` Error: ${String(error instanceof Error ? error.message : error)}`,
      });
      setGeneratedProposals(prev => 
        prev.map((p, i) => i === proposalIndex ? { ...p, isGeneratingImage: false } : p)
      );
    } finally {
      setIsProcessingImage(false);
    }
  };


  const handleRefineSubmit: SubmitHandler<z.infer<typeof refineFormSchema>> = async (values) => {
    if (!refiningProposalData || !refineReferenceImageUri) { 
        toast({ 
            variant: "destructive", 
            title: t('missingImageForRefinement'), 
            description: t('missingImageForRefinementDescription') 
        });
        return;
    }
    setIsProcessingImage(true);
    const currentRefiningIdx = refiningProposalData.index;
    const originalProposalDesc = refiningProposalData.originalDescription;

    try {
      const refineInput: RefineTattooDesignsInput = { 
        baseDesignDescription: refiningProposalData.proposal.description + (values.additionalInfo ? ` Zusätzliche Anmerkungen: ${values.additionalInfo}` : ""),
        referenceImageDataUri: refineReferenceImageUri, 
      };

      const refinementResult = await refineTattooDesigns(refineInput); 
      
      if (refinementResult && refinementResult.refinedDesignDescription) {
        let newImageUri: string | undefined = refiningProposalData.proposal.generatedImageUri; // Keep old if new fails
        if (refinementResult.imageGenerationPrompt) {
          try {
            const imageGenResult = await generateTattooImage({ prompt: refinementResult.imageGenerationPrompt });
            newImageUri = imageGenResult.imageDataUri;
            toast({ title: t('proposalRefinedAndImageGenerated'), description: t('proposalRefinedDescription')});
          } catch (imgError) {
            console.error("Error generating image after refinement:", imgError);
            toast({
              variant: "destructive",
              title: t('imageGeneratedErrorTitle'),
              description: t('imageGeneratedErrorDescription') + ` Error: ${String(imgError instanceof Error ? imgError.message : imgError)}`,
            });
          }
        } else {
            toast({ title: t('designRefined'), description: t('designRefinedDescription') });
        }
        
        setGeneratedProposals(prev => {
          const newProposals = [...prev];
          // Ensure we are updating the correct proposal based on its original state when dialog opened
          if (newProposals[currentRefiningIdx] && newProposals[currentRefiningIdx].description === originalProposalDesc) {
             newProposals[currentRefiningIdx] = {
                ...newProposals[currentRefiningIdx],
                description: refinementResult.refinedDesignDescription,
                refinedImageGenerationPrompt: refinementResult.imageGenerationPrompt,
                generatedImageUri: newImageUri,
             };
          }
          return newProposals;
        });
        
        // Update the proposal in the dialog for immediate reflection
        setRefiningProposalData(prevData => prevData ? {
            ...prevData,
            proposal: {
                ...prevData.proposal,
                description: refinementResult.refinedDesignDescription,
                generatedImageUri: newImageUri,
                refinedImageGenerationPrompt: refinementResult.imageGenerationPrompt,
            }
        } : null);

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
      setIsProcessingImage(false);
    }
  };

  const handleSaveDesign = (proposal: GeneratedProposal) => {
    const newDesign: TattooDesign = {
      id: Date.now().toString(),
      description: proposal.description,
      stylePreferences: form.getValues('stylePreferences'),
      keywords: form.getValues('keywords'),
      referenceImage: referenceImageDataUri || undefined, 
      generatedImageUri: proposal.generatedImageUri, // Save the generated image
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

              <Button type="submit" disabled={isLoading || isProcessingImage} size="lg" className={cn("w-full md:w-auto text-lg", buttonAnimationClasses)}>
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
                   {proposal.generatedImageUri && (
                    <div className="mt-4 relative aspect-square w-full rounded-md overflow-hidden border border-border">
                      <Image src={proposal.generatedImageUri} alt={t('generatedTattooImageAlt', { proposalNumber: (index + 1).toString() })} layout="fill" objectFit="contain" data-ai-hint="tattoo design" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{proposal.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4">
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Dialog onOpenChange={(open) => {
                       if (!open) { 
                          setRefiningProposalData(null);
                          setRefineReferenceImageUri("");
                          refineForm.reset();
                        }
                    }}>
                      <DialogTrigger asChild>
                         <Button variant="outline" className={cn("w-full sm:flex-1", buttonAnimationClasses)} onClick={() => {
                            setRefiningProposalData({ proposal: {...proposal}, originalDescription: proposal.description, index });
                            setRefineReferenceImageUri(""); 
                            refineForm.reset({ additionalInfo: "" });
                          }}>
                          <Edit3 className="mr-2 h-4 w-4" /> {t('refine')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[525px] bg-background border-border">
                        <DialogHeader>
                          <DialogTitle className="text-xl">{t('refineTattooProposal')}</DialogTitle>
                           {refiningProposalData && (
                            <>
                            <DialogDescription>
                                {t('refineTattooProposalDescription', { baseDescription: refiningProposalData.proposal.description.substring(0,100) + "..." || ""})}
                            </DialogDescription>
                            {refiningProposalData.proposal.generatedImageUri && (
                                <div className="mt-2 relative h-40 w-full rounded-md overflow-hidden border border-border">
                                <Image src={refiningProposalData.proposal.generatedImageUri} alt={t('generatedTattooImageAlt', { proposalNumber: (refiningProposalData.index + 1).toString() })} layout="fill" objectFit="contain" data-ai-hint="tattoo sketch"/>
                                </div>
                            )}
                            </>
                           )}
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
                            <DialogFooter>
                              <Button type="submit" disabled={isProcessingImage || !refineReferenceImageUri} className={cn("w-full", buttonAnimationClasses)}>
                                {isProcessingImage && refiningProposalData?.index === index ? <LoadingSpinner className="mr-2" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                                {t('refineWithImage')}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Button onClick={() => handleSaveDesign(proposal)} className={cn("w-full sm:flex-1", buttonAnimationClasses)} disabled={isProcessingImage}>
                      <Save className="mr-2 h-4 w-4" /> {t('save')}
                    </Button>
                  </div>
                </CardFooter>
                <CardFooter className="pt-2">
                 {!proposal.generatedImageUri && !proposal.isGeneratingImage && (
                    <Button 
                      onClick={() => handleGenerateImageForProposal(index)} 
                      className={cn("w-full", buttonAnimationClasses)}
                      disabled={isProcessingImage}
                      variant="secondary"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" /> {t('generateImageButton')}
                    </Button>
                  )}
                  {proposal.isGeneratingImage && (
                    <div className="w-full flex justify-center items-center py-2">
                        <LoadingSpinner className="mr-2" /> {t('generatingImage')}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
