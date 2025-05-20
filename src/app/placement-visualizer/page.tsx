
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/core/FileUpload';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { TattooDesign } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Layers, ImagePlus, AlertTriangle, Sparkles } from 'lucide-react';
import LoadingSpinner from '@/components/core/LoadingSpinner';

export default function PlacementVisualizerPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [savedDesigns] = useLocalStorage<TattooDesign[]>('tattooDesigns', []);

  const [tattooDesignDataUri, setTattooDesignDataUri] = useState<string>("");
  const [tattooDesignFileName, setTattooDesignFileName] = useState<string>("");
  const [bodyPartDataUri, setBodyPartDataUri] = useState<string>("");
  const [bodyPartFileName, setBodyPartFileName] = useState<string>("");
  
  const [showVisualization, setShowVisualization] = useState<boolean>(false);
  const [initialDesignDescription, setInitialDesignDescription] = useState<string | null>(null);

  useEffect(() => {
    const designId = searchParams.get('designId');
    if (designId) {
      const design = savedDesigns.find(d => d.id === designId);
      if (design) {
        setInitialDesignDescription(design.description);
        if (design.generatedImageUri) {
          setTattooDesignDataUri(design.generatedImageUri);
          setTattooDesignFileName(t('generatedImageAlt'));
        } else if (design.referenceImage) {
          setTattooDesignDataUri(design.referenceImage);
          setTattooDesignFileName(t('referenceImageAlt'));
        }
      }
    }
  }, [searchParams, savedDesigns, t]);

  const handleVisualize = () => {
    if (!tattooDesignDataUri || !bodyPartDataUri) {
      toast({
        variant: "destructive",
        title: t('visualizerMissingImagesTitle'),
        description: t('visualizerMissingImagesDescription'),
      });
      setShowVisualization(false);
      return;
    }
    setShowVisualization(true);
  };

  const handleTattooUpload = (fileName: string, dataUri: string) => {
    setTattooDesignDataUri(dataUri);
    setTattooDesignFileName(fileName);
    setShowVisualization(false); // Reset visualization if new image is uploaded
  };

  const handleBodyPartUpload = (fileName: string, dataUri: string) => {
    setBodyPartDataUri(dataUri);
    setBodyPartFileName(fileName);
    setShowVisualization(false); // Reset visualization if new image is uploaded
  };

  return (
    <div className="space-y-12">
      <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
            <Layers className="w-8 h-8 mr-3 text-primary" />
            {t('visualizerPageTitle')}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {t('visualizerPageDescription')}
            {initialDesignDescription && (
              <span className="block mt-2 text-sm italic">
                {t('previewingConcept', { description: initialDesignDescription.substring(0,100) + "..." })}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <FileUpload
              label={t('tattooDesignImageLabel')}
              onFileUpload={handleTattooUpload}
              id="tattoo-design-visualizer-upload"
              className={tattooDesignDataUri ? "border-green-500/50" : ""}
            />
            <FileUpload
              label={t('bodyPartImageLabel')}
              onFileUpload={handleBodyPartUpload}
              id="body-part-visualizer-upload"
              className={bodyPartDataUri ? "border-green-500/50" : ""}
            />
          </div>
          <Button
            onClick={handleVisualize}
            disabled={!tattooDesignDataUri || !bodyPartDataUri}
            size="lg"
            className="w-full md:w-auto text-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {t('visualizeButton')}
          </Button>
        </CardContent>
      </Card>

      {showVisualization && tattooDesignDataUri && bodyPartDataUri && (
        <Card className="shadow-xl border-primary/30 bg-card/90">
          <CardHeader>
            <CardTitle className="text-2xl">{t('visualizationResultTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <div className="relative w-full max-w-xl aspect-square border-2 border-border rounded-lg overflow-hidden">
              <Image
                src={bodyPartDataUri}
                alt={bodyPartFileName || t('bodyPartImageLabel')}
                layout="fill"
                objectFit="contain"
                data-ai-hint="body part"
              />
              {/* Basic overlay - can be enhanced with draggable/resizable component later */}
              <div 
                className="absolute top-1/4 left-1/4 w-1/2 h-1/2" // Example positioning and size
                style={{
                    backgroundImage: `url(${tattooDesignDataUri})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    // Add filter: 'drop-shadow(2px 4px 6px black)' for a simple shadow
                }}
                title={tattooDesignFileName || t('tattooDesignImageLabel')}
                data-ai-hint="tattoo overlay"
               />
            </div>
          </CardContent>
        </Card>
      )}

      {!showVisualization && tattooDesignDataUri && bodyPartDataUri && (
        <Card className="border-dashed border-primary/30 bg-card/50 py-8">
          <CardContent className="text-center space-y-3 text-muted-foreground">
              <ImagePlus className="mx-auto h-12 w-12 text-primary/50" />
              <p className="text-lg">{t('visualizerReadyTitle')}</p>
              <p>{t('visualizerReadyDescription')}</p>
          </CardContent>
        </Card>
      )}
      
      {!tattooDesignDataUri && !bodyPartDataUri && !showVisualization && (
         <Card className="border-dashed border-muted/50 bg-card/50 py-8">
          <CardContent className="text-center space-y-3 text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg">{t('visualizerInitialPrompt')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
