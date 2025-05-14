"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FileUpload from '@/components/core/FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import { arPreviewTattoo, ARPreviewTattooInput } from '@/ai/flows/ar-preview-tattoo';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Camera, Sparkles, AlertTriangle } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { TattooDesign } from '@/lib/types';

export default function ARPreviewPage() {
  const [tattooDesignDataUri, setTattooDesignDataUri] = useState<string>("");
  const [tattooDesignFileName, setTattooDesignFileName] = useState<string>("");
  const [bodyImageDataUri, setBodyImageDataUri] = useState<string>("");
  const [bodyImageFileName, setBodyImageFileName] = useState<string>("");
  
  const [arResultDataUri, setArResultDataUri] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [savedDesigns] = useLocalStorage<TattooDesign[]>('tattooDesigns', []);
  const [initialDesignDescription, setInitialDesignDescription] = useState<string | null>(null);

  useEffect(() => {
    const designId = searchParams.get('designId');
    if (designId) {
      const design = savedDesigns.find(d => d.id === designId);
      if (design) {
        setInitialDesignDescription(design.description);
        if (design.referenceImage) { // If a reference image was saved with the design
          setTattooDesignDataUri(design.referenceImage);
          setTattooDesignFileName("Saved Reference");
        } else if (design.generatedImageUri) { // Or if an AI generated image was saved
           setTattooDesignDataUri(design.generatedImageUri);
           setTattooDesignFileName("AI Generated Image");
        }
      }
    }
  }, [searchParams, savedDesigns]);


  const handleARPreview = async () => {
    if (!tattooDesignDataUri || !bodyImageDataUri) {
      toast({
        variant: "destructive",
        title: "Missing Images",
        description: "Please upload both a tattoo design image and a body image.",
      });
      return;
    }
    setIsLoading(true);
    setArResultDataUri("");
    try {
      const input: ARPreviewTattooInput = {
        tattooDesignDataUri,
        bodyImageDateUri: bodyImageDataUri, // Corrected typo in flow variable name
      };
      const result = await arPreviewTattoo(input);
      if (result && result.arVisualizationDataUri) {
        setArResultDataUri(result.arVisualizationDataUri);
        toast({ title: "AR Preview Generated!", description: "See how your tattoo might look below." });
      } else {
        throw new Error("No AR visualization returned.");
      }
    } catch (error) {
      console.error("Error generating AR preview:", error);
      toast({
        variant: "destructive",
        title: "AR Preview Failed",
        description: String(error) || "Could not generate AR preview. The AI model might be unavailable or the images may not be suitable. Please try again with different images.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
            <Camera className="w-8 h-8 mr-3 text-primary" />
            Augmented Reality Tattoo Preview
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Visualize your tattoo design on your body. Upload an image of the tattoo and a photo of where you want it.
            {initialDesignDescription && <span className="block mt-2 text-sm italic">Previewing concept: "{initialDesignDescription.substring(0,100)}..."</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FileUpload
              label="1. Tattoo Design Image"
              onFileUpload={(fileName, dataUri) => { setTattooDesignDataUri(dataUri); setTattooDesignFileName(fileName); }}
              id="tattoo-design-upload"
              className={tattooDesignDataUri ? "border-green-500/50" : ""}
            />
            <FileUpload
              label="2. Body Part Image"
              onFileUpload={(fileName, dataUri) => { setBodyImageDataUri(dataUri); setBodyImageFileName(fileName); }}
              id="body-image-upload"
              className={bodyImageDataUri ? "border-green-500/50" : ""}
            />
          </div>
          <Button
            onClick={handleARPreview}
            disabled={isLoading || !tattooDesignDataUri || !bodyImageDataUri}
            size="lg"
            className="w-full md:w-auto text-lg"
          >
            {isLoading ? <LoadingSpinner className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Generate AR Preview
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <LoadingSpinner size={48} />
          <p className="mt-4 text-lg text-muted-foreground">Generating your AR preview... This may take a moment.</p>
        </div>
      )}

      {arResultDataUri && !isLoading && (
        <Card className="shadow-xl border-primary/30 bg-card/90">
          <CardHeader>
            <CardTitle className="text-2xl">Your AR Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <Image
              src={arResultDataUri}
              alt="AR Tattoo Preview"
              width={500}
              height={500}
              className="rounded-lg border-2 border-border object-contain"
              data-ai-hint="tattoo body"
            />
          </CardContent>
        </Card>
      )}
       {!arResultDataUri && !isLoading && tattooDesignDataUri && bodyImageDataUri && (
        <Card className="border-dashed border-primary/30 bg-card/50 py-8">
          <CardContent className="text-center space-y-3 text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 text-primary/50" />
              <p className="text-lg">Ready to visualize!</p>
              <p>Click "Generate AR Preview" to see your tattoo concept come to life.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
