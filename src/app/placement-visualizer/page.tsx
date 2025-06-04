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

interface VisualizationState {
  tattooDesignDataUri: string;
  tattooDesignFileName: string;
  bodyPartDataUri: string;
  bodyPartFileName: string;
  showVisualization: boolean;
  initialDesignDescription: string | null;
}

export default function PlacementVisualizerPage(): JSX.Element {
  const { t } = useSettings();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [savedDesigns] = useLocalStorage<TattooDesign[]>('tattooDesigns', []);

  const [state, setState] = useState<VisualizationState>({
    tattooDesignDataUri: "",
    tattooDesignFileName: "",
    bodyPartDataUri: "",
    bodyPartFileName: "",
    showVisualization: false,
    initialDesignDescription: null
  });

  // Destructure state for cleaner access
  const {
    tattooDesignDataUri,
    tattooDesignFileName,
    bodyPartDataUri,
    bodyPartFileName,
    showVisualization,
    initialDesignDescription
  } = state;

  useEffect(() => {
    const designId = searchParams.get('designId');
    if (designId && savedDesigns.length > 0) {
      const design = savedDesigns.find((d: TattooDesign) => d.id === designId);
      if (design) {
        setState(prev => ({
          ...prev,
          initialDesignDescription: design.description || null,
          tattooDesignDataUri: design.generatedImageUri || design.referenceImage || "",
          tattooDesignFileName: design.generatedImageUri 
            ? t('generatedImageAlt') 
            : t('referenceImageAlt')
        }));
      }
    }
  }, [searchParams, savedDesigns, t]);

  const handleVisualize = (): void => {
    if (!tattooDesignDataUri || !bodyPartDataUri) {
      toast({
        variant: "destructive",
        title: t('visualizerMissingImagesTitle'),
        description: t('visualizerMissingImagesDescription'),
      });
      setState(prev => ({ ...prev, showVisualization: false }));
      return;
    }
    setState(prev => ({ ...prev, showVisualization: true }));
  };

  const handleTattooUpload = (fileName: string, dataUri: string): void => {
    setState(prev => ({
      ...prev,
      tattooDesignDataUri: dataUri,
      tattooDesignFileName: fileName,
      showVisualization: false // Reset visualization when new image is uploaded
    }));
  };

  const handleBodyPartUpload = (fileName: string, dataUri: string): void => {
    setState(prev => ({
      ...prev,
      bodyPartDataUri: dataUri,
      bodyPartFileName: fileName,
      showVisualization: false // Reset visualization when new image is uploaded
    }));
  };

  const renderVisualization = (): JSX.Element | null => {
    if (!showVisualization || !tattooDesignDataUri || !bodyPartDataUri) {
      return null;
    }

    return (
      <Card className="shadow-xl border-primary/30 bg-card/90">
        <CardHeader>
          <CardTitle className="text-2xl">{t('visualizationResultTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          <div className="relative w-full max-w-xl aspect-square border-2 border-border rounded-lg overflow-hidden">
            <Image
              src={bodyPartDataUri}
              alt={bodyPartFileName || t('bodyPartImageLabel')}
              fill
              style={{ objectFit: 'contain' }}
              data-ai-hint="body part"
              priority
            />
            {/* Tattoo overlay with enhanced positioning */}
            <div 
              className="absolute top-1/4 left-1/4 w-1/2 h-1/2 pointer-events-none"
              style={{
                backgroundImage: `url(${tattooDesignDataUri})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))',
                opacity: 0.9
              }}
              title={tattooDesignFileName || t('tattooDesignImageLabel')}
              data-ai-hint="tattoo overlay"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReadyState = (): JSX.Element | null => {
    if (showVisualization || !tattooDesignDataUri || !bodyPartDataUri) {
      return null;
    }

    return (
      <Card className="border-dashed border-primary/30 bg-card/50 py-8">
        <CardContent className="text-center space-y-3 text-muted-foreground">
          <ImagePlus className="mx-auto h-12 w-12 text-primary/50" />
          <p className="text-lg">{t('visualizerReadyTitle')}</p>
          <p>{t('visualizerReadyDescription')}</p>
        </CardContent>
      </Card>
    );
  };

  const renderInitialPrompt = (): JSX.Element | null => {
    if (tattooDesignDataUri || bodyPartDataUri || showVisualization) {
      return null;
    }

    return (
      <Card className="border-dashed border-muted/50 bg-card/50 py-8">
        <CardContent className="text-center space-y-3 text-muted-foreground">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg">{t('visualizerInitialPrompt')}</p>
        </CardContent>
      </Card>
    );
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
                {t('previewingConcept', { 
                  description: initialDesignDescription.length > 100 
                    ? `${initialDesignDescription.substring(0, 100)}...` 
                    : initialDesignDescription 
                })}
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

      {renderVisualization()}
      {renderReadyState()}
      {renderInitialPrompt()}
    </div>
  );
}