
"use client";

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { TattooDesign } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Palette, Tag, CalendarDays, Library as LibraryIcon, Settings } from 'lucide-react'; // Renamed Library to LibraryIcon to avoid conflict
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';
import { useSettings } from '@/contexts/SettingsContext'; // Import useSettings

export default function LibraryPage() {
  const { t } = useSettings(); // Get translation function
  const [savedDesigns, setSavedDesigns] = useLocalStorage<TattooDesign[]>('tattooDesigns', []);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true); // Ensure localStorage is accessed only on client
  }, []);

  const handleDeleteDesign = (id: string) => {
    setSavedDesigns(savedDesigns.filter(design => design.id !== id));
    toast({ title: t('designDeleted'), description: t('designDeletedDescription') });
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-sky-400 to-cyan-300">{t('myDesignLibrary')}</h1>
        <p className="text-xl text-muted-foreground text-center">{t('loadingSavedVisions')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse bg-card/50">
              <CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader>
              <CardContent><div className="h-20 bg-muted rounded"></div></CardContent>
              <CardFooter><div className="h-10 w-full bg-muted rounded"></div></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (savedDesigns.length === 0) {
    return (
      <div className="text-center space-y-6 py-16">
        <LibraryIcon className="mx-auto h-24 w-24 text-muted-foreground/50" />
        <h1 className="text-4xl font-bold tracking-tight">{t('libraryIsEmpty')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('libraryIsEmptyHint')}
          <Link href="/" className="text-primary hover:underline font-semibold">
            {t('generateNewDesignsLink')}
          </Link>
          !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-sky-400 to-cyan-300">{t('myDesignLibrary')}</h1>
      <p className="text-xl text-muted-foreground text-center">{t('myDesignLibraryDescription')}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedDesigns.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(design => (
          <Card key={design.id} className="flex flex-col shadow-lg hover:shadow-primary/30 transition-shadow duration-300 bg-card/90">
            <CardHeader>
              <CardTitle className="truncate">{t('designIdea')}</CardTitle>
              {design.referenceImage && (
                <div className="mt-2 relative h-40 w-full rounded-md overflow-hidden border border-border">
                  <Image src={design.referenceImage} alt="Reference" layout="fill" objectFit="cover" data-ai-hint="tattoo reference"/>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <p className="text-muted-foreground line-clamp-4">{design.description}</p>
              <div className="space-y-1 text-sm">
                {design.stylePreferences && (
                  <div className="flex items-center text-muted-foreground/80">
                    <Palette className="w-4 h-4 mr-2 text-primary/70" /> {t('style')}: {design.stylePreferences}
                  </div>
                )}
                {design.keywords && (
                  <div className="flex items-center text-muted-foreground/80">
                    <Tag className="w-4 h-4 mr-2 text-primary/70" /> {t('keywords')}: {design.keywords}
                  </div>
                )}
                <div className="flex items-center text-muted-foreground/80">
                  <CalendarDays className="w-4 h-4 mr-2 text-primary/70" /> {t('savedOn')}: {new Date(design.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
              <Link href={`/ar-preview?designId=${design.id}`} passHref>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Eye className="mr-2 h-4 w-4" /> {t('arPreview')}
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('deleteWarning')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteDesign(design.id)}>
                      {t('delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
