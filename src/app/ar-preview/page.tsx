
"use client";

import { useState, useEffect, useRef } from 'react'; // Added useRef
import { useSearchParams } from 'next/navigation';
import FileUpload from '@/components/core/FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import { arPreviewTattoo, ARPreviewTattooInput } from '@/ai/flows/ar-preview-tattoo';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Camera as CameraIcon, Sparkles, AlertTriangle, Video } from 'lucide-react'; // Renamed Camera to CameraIcon
import useLocalStorage from '@/hooks/useLocalStorage';
import type { TattooDesign } from '@/lib/types';
import { useSettings } from '@/contexts/SettingsContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert imports

export default function ARPreviewPage() {
  const { t } = useSettings();
  const [tattooDesignDataUri, setTattooDesignDataUri] = useState<string>("");
  const [_tattooDesignFileName, setTattooDesignFileName] = useState<string>("");
  const [bodyImageDataUri, setBodyImageDataUri] = useState<string>("");
  const [_bodyImageFileName, setBodyImageFileName] = useState<string>("");
  
  const [arResultDataUri, setArResultDataUri] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [savedDesigns] = useLocalStorage<TattooDesign[]>('tattooDesigns', []);
  const [initialDesignDescription, setInitialDesignDescription] = useState<string | null>(null);

  const [useWebcam, setUseWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);


  useEffect(() => {
    const designId = searchParams.get('designId');
    if (designId) {
      const design = savedDesigns.find(d => d.id === designId);
      if (design) {
        setInitialDesignDescription(design.description);
        if (design.referenceImage) { 
          setTattooDesignDataUri(design.referenceImage);
          setTattooDesignFileName("Saved Reference");
        } else if (design.generatedImageUri) { 
           setTattooDesignDataUri(design.generatedImageUri);
           setTattooDesignFileName("AI Generated Image");
        }
      }
    }
  }, [searchParams, savedDesigns]);

  useEffect(() => {
    if (useWebcam) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: t('arPreviewFailed'), // Re-use a generic error or add a specific one
            description: t('arPreviewFailedDescription'), // Re-use or specify: "Camera access denied."
          });
        }
      };
      getCameraPermission();
    } else {
      // Stop webcam stream if not in use
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [useWebcam, toast, t]);


  const captureFromWebcam = () => {
    if (videoRef.current && canvasRef.current && hasCameraPermission) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setBodyImageDataUri(dataUri);
        setBodyImageFileName("webcam_capture.jpg");
        setUseWebcam(false); // Turn off webcam view after capture
      }
    }
  };


  const handleARPreview = async () => {
    if (!tattooDesignDataUri || !bodyImageDataUri) {
      toast({
        variant: "destructive",
        title: t('missingImages'),
        description: t('missingImagesDescription'),
      });
      return;
    }
    setIsLoading(true);
    setArResultDataUri("");
    try {
      const input: ARPreviewTattooInput = {
        tattooDesignDataUri,
        bodyImageDateUri: bodyImageDataUri, 
      };
      const result = await arPreviewTattoo(input);
      if (result && result.arVisualizationDataUri) {
        setArResultDataUri(result.arVisualizationDataUri);
        toast({ title: t('arPreviewGenerated'), description: t('arPreviewGeneratedDescription') });
      } else {
        throw new Error("No AR visualization returned.");
      }
    } catch (error) {
      console.error("Error generating AR preview:", error);
      toast({
        variant: "destructive",
        title: t('arPreviewFailed'),
        description: String(error instanceof Error ? error.message : error) || t('arPreviewFailedDescription'),
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
            <CameraIcon className="w-8 h-8 mr-3 text-primary" />
            {t('arPageTitle')}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {t('arPageDescription')}
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
              label={t('tattooDesignImage')}
              onFileUpload={(fileName, dataUri) => { setTattooDesignDataUri(dataUri); setTattooDesignFileName(fileName); }}
              id="tattoo-design-upload"
              className={tattooDesignDataUri ? "border-green-500/50" : ""}
            />
            <div className="space-y-4">
              {!useWebcam ? (
                <>
                  <FileUpload
                    label={t('bodyPartImage')}
                    onFileUpload={(fileName, dataUri) => { setBodyImageDataUri(dataUri); setBodyImageFileName(fileName); }}
                    id="body-image-upload"
                    className={bodyImageDataUri ? "border-green-500/50" : ""}
                  />
                  <Button onClick={() => setUseWebcam(true)} variant="outline" className="w-full">
                    <Video className="mr-2 h-5 w-5" />
                    {/* Add translation for "Use Webcam" */}
                    Use Webcam
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <video ref={videoRef} className="w-full aspect-video rounded-md border bg-muted" autoPlay muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                  {hasCameraPermission === false && (
                     <Alert variant="destructive">
                       <AlertTriangle className="h-4 w-4" />
                       <AlertTitle>{t('arPreviewFailed')}</AlertTitle> {/* Or specific "Camera Access Denied" title */}
                       <AlertDescription>{t('arPreviewFailedDescription')}</AlertDescription> {/* Or specific message */}
                     </Alert>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={captureFromWebcam} disabled={hasCameraPermission === false} className="flex-1">
                      <CameraIcon className="mr-2 h-5 w-5" />
                      {/* Add translation for "Capture" */}
                      Capture
                    </Button>
                    <Button onClick={() => setUseWebcam(false)} variant="outline" className="flex-1">
                      {/* Add translation for "Cancel" or "Back to Upload" */}
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleARPreview}
            disabled={isLoading || !tattooDesignDataUri || !bodyImageDataUri}
            size="lg"
            className="w-full md:w-auto text-lg"
          >
            {isLoading ? <LoadingSpinner className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {t('generateARPreview')}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <LoadingSpinner size={48} />
          <p className="mt-4 text-lg text-muted-foreground">{t('generatingARPreview')}</p>
        </div>
      )}

      {arResultDataUri && !isLoading && (
        <Card className="shadow-xl border-primary/30 bg-card/90">
          <CardHeader>
            <CardTitle className="text-2xl">{t('yourARPreview')}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <Image
              src={arResultDataUri}
              alt={t('arPreviewAlt')}
              width={500}
              height={500}
              className="rounded-lg border-2 border-border object-contain"
              data-ai-hint="tattoo body"
            />
          </CardContent>
        </Card>
      )}
       {!arResultDataUri && !isLoading && tattooDesignDataUri && (bodyImageDataUri || useWebcam) && (
        <Card className="border-dashed border-primary/30 bg-card/50 py-8">
          <CardContent className="text-center space-y-3 text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 text-primary/50" />
              <p className="text-lg">{t('readyToVisualize')}</p>
              <p>{bodyImageDataUri || useWebcam ? t('readyToVisualizeHint') : "Upload or capture body image to proceed."}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
