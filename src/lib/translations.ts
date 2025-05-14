
export type Locale = 'de' | 'en';

export type TranslationKey = keyof typeof translations.de;

export const translations = {
  de: {
    // Header
    generate: 'Generieren',
    library: 'Bibliothek',
    arPreview: 'AR Vorschau',
    settings: 'Einstellungen',
    appTitle: 'TattooAI:Vision',
    appDescription: 'Revolutionäre KI-gestützte Tattoo-Design-App mit futuristischer Ästhetik.',

    // Tattoo Generation Page
    createYourVision: 'Deine Vision gestalten',
    createYourVisionDescription: 'Beschreibe dein ideales Tattoo. Lass unsere KI es mit einzigartigen Designvorschlägen zum Leben erwecken.',
    tattooIdeaDescription: 'Tattoo-Idee Beschreibung',
    tattooIdeaDescriptionHint: 'Sei so detailliert wie möglich für beste Ergebnisse.',
    stylePreference: 'Stilpräferenz',
    selectStyle: 'Wähle einen Tattoo-Stil',
    keywordsOptional: 'Schlüsselwörter (Optional)',
    keywordsHint: 'Kommagetrennte Schlüsselwörter.',
    referenceImageOptional: 'Referenzbild (Optional)',
    generateDesigns: 'Designs generieren',
    uploadAccepted: 'Akzeptiert: {types}',
    designProposals: 'Generierte Vorschläge',
    proposal: 'Vorschlag',
    refine: 'Verfeinern',
    save: 'Speichern',
    refineTattooProposal: 'Tattoo-Vorschlag verfeinern',
    refineTattooProposalDescription: 'Füge weitere Details hinzu oder lade ein neues Referenzbild hoch, um die Verfeinerung zu leiten. Aktuelle Basis: "{baseDescription}"',
    additionalNotes: 'Zusätzliche Notizen/Änderungen',
    additionalNotesPlaceholder: 'z.B. Linien dünner machen, hier mehr Schattierung hinzufügen...',
    newReferenceImageRequired: 'Neues Referenzbild zur Verfeinerung (Erforderlich)',
    designUpdated: 'Design aktualisiert!',
    refineWithImage: 'Mit Bild verfeinern',

    // Library Page
    myDesignLibrary: 'Meine Designbibliothek',
    myDesignLibraryDescription: 'Durchsuche, verwalte und betrachte deine einzigartigen Tattoo-Visionen in der Vorschau.',
    loadingSavedVisions: 'Deine gespeicherten Visionen werden geladen...',
    libraryIsEmpty: 'Deine Bibliothek ist leer',
    libraryIsEmptyHint: 'Noch keine Tattoo-Designs gespeichert. Beginne damit, ',
    generateNewDesignsLink: 'einige neue Designs zu generieren',
    designIdea: 'Design-Idee',
    style: 'Stil',
    keywords: 'Schlüsselwörter',
    savedOn: 'Gespeichert am',
    delete: 'Löschen',
    areYouSure: 'Bist du sicher?',
    deleteWarning: 'Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird dieses Tattoo-Design dauerhaft aus deiner Bibliothek entfernt.',
    cancel: 'Abbrechen',

    // AR Preview Page
    arPageTitle: 'Augmented Reality Tattoo Vorschau',
    arPageDescription: 'Visualisiere dein Tattoo-Design auf deinem Körper. Lade ein Bild des Tattoos und ein Foto hoch, wo du es haben möchtest.',
    previewingConcept: 'Vorschau für Konzept: "{description}"',
    tattooDesignImage: '1. Tattoo-Design Bild',
    bodyPartImage: '2. Körperteil Bild',
    generateARPreview: 'AR Vorschau erstellen',
    generatingARPreview: 'Deine AR-Vorschau wird generiert... Dies kann einen Moment dauern.',
    yourARPreview: 'Deine AR Vorschau',
    readyToVisualize: 'Bereit zur Visualisierung!',
    readyToVisualizeHint: 'Klicke auf "AR Vorschau erstellen", um dein Tattoo-Konzept zum Leben zu erwecken.',
    
    // Settings Page
    language: 'Sprache',
    appearance: 'Erscheinungsbild',
    theme: 'Theme',
    light: 'Hell',
    dark: 'Dunkel',
    german: 'Deutsch',
    english: 'Englisch',

    // Toasts (Basic translations, hook needs update for full dynamic translation)
    missingImages: 'Fehlende Bilder',
    missingImagesDescription: 'Bitte lade sowohl ein Tattoo-Design-Bild als auch ein Körperbild hoch.',
    arPreviewGenerated: 'AR Vorschau generiert!',
    arPreviewGeneratedDescription: 'Sieh unten, wie dein Tattoo aussehen könnte.',
    arPreviewFailed: 'AR Vorschau fehlgeschlagen',
    arPreviewFailedDescription: 'AR Vorschau konnte nicht generiert werden. Das KI-Modell ist möglicherweise nicht verfügbar oder die Bilder sind nicht geeignet. Bitte versuche es mit anderen Bildern erneut.',
    designsGenerated: 'Designs generiert!',
    designsGeneratedDescription: 'Entdecke unten deine neuen Tattoo-Ideen.',
    generationFailed: 'Generierung fehlgeschlagen',
    generationFailedDescription: 'Tattoo-Designs konnten nicht generiert werden. Bitte versuche es erneut.',
    missingImageForRefinement: 'Fehlendes Bild zur Verfeinerung',
    missingImageForRefinementDescription: 'Bitte stelle ein Referenzbild für die Verfeinerung bereit.',
    designRefined: 'Design verfeinert!',
    designRefinedDescription: 'Das ausgewählte Design wurde mit neuen Details aktualisiert.',
    refinementFailed: 'Verfeinerung fehlgeschlagen',
    refinementFailedDescription: 'Das Tattoo-Design konnte nicht verfeinert werden.',
    designSaved: 'Design gespeichert!',
    designSavedDescription: 'Sieh es in deiner Bibliothek an.',
    designDeleted: 'Design gelöscht',
    designDeletedDescription: 'Das Tattoo-Design wurde aus deiner Bibliothek entfernt.',
  },
  en: {
    // Header
    generate: 'Generate',
    library: 'Library',
    arPreview: 'AR Preview',
    settings: 'Settings',
    appTitle: 'TattooAI:Vision',
    appDescription: 'Revolutionary AI-powered tattoo design app with a futuristic aesthetic.',

    // Tattoo Generation Page
    createYourVision: 'Create Your Vision',
    createYourVisionDescription: 'Describe your ideal tattoo. Let our AI bring it to life with unique design proposals.',
    tattooIdeaDescription: 'Tattoo Idea Description',
    tattooIdeaDescriptionHint: 'Be as detailed as possible for best results.',
    stylePreference: 'Style Preference',
    selectStyle: 'Select a tattoo style',
    keywordsOptional: 'Keywords (Optional)',
    keywordsHint: 'Comma-separated keywords.',
    referenceImageOptional: 'Reference Image (Optional)',
    generateDesigns: 'Generate Designs',
    uploadAccepted: 'Accepted: {types}',
    designProposals: 'Generated Proposals',
    proposal: 'Proposal',
    refine: 'Refine',
    save: 'Save',
    refineTattooProposal: 'Refine Tattoo Proposal',
    refineTattooProposalDescription: 'Add more details or upload a new reference image to guide the refinement. Current base: "{baseDescription}"',
    additionalNotes: 'Additional Notes/Changes',
    additionalNotesPlaceholder: 'e.g., Make the lines thinner, add more shading here...',
    newReferenceImageRequired: 'New Reference Image for Refinement (Required)',
    designUpdated: 'Design Updated!',
    refineWithImage: 'Refine with Image',

    // Library Page
    myDesignLibrary: 'My Design Library',
    myDesignLibraryDescription: 'Browse, preview, and manage your unique tattoo visions.',
    loadingSavedVisions: 'Loading your saved visions...',
    libraryIsEmpty: 'Your Library is Empty',
    libraryIsEmptyHint: 'No tattoo designs saved yet. Start by ',
    generateNewDesignsLink: 'generating some new designs',
    designIdea: 'Design Idea',
    style: 'Style',
    keywords: 'Keywords',
    savedOn: 'Saved on',
    delete: 'Delete',
    areYouSure: 'Are you sure?',
    deleteWarning: 'This action cannot be undone. This will permanently delete this tattoo design from your library.',
    cancel: 'Cancel',

    // AR Preview Page
    arPageTitle: 'Augmented Reality Tattoo Preview',
    arPageDescription: 'Visualize your tattoo design on your body. Upload an image of the tattoo and a photo of where you want it.',
    previewingConcept: 'Previewing concept: "{description}"',
    tattooDesignImage: '1. Tattoo Design Image',
    bodyPartImage: '2. Body Part Image',
    generateARPreview: 'Generate AR Preview',
    generatingARPreview: 'Generating your AR preview... This may take a moment.',
    yourARPreview: 'Your AR Preview',
    readyToVisualize: 'Ready to visualize!',
    readyToVisualizeHint: 'Click "Generate AR Preview" to see your tattoo concept come to life.',
    
    // Settings Page
    language: 'Language',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    german: 'German',
    english: 'English',

    // Toasts
    missingImages: 'Missing Images',
    missingImagesDescription: 'Please upload both a tattoo design image and a body image.',
    arPreviewGenerated: 'AR Preview Generated!',
    arPreviewGeneratedDescription: 'See how your tattoo might look below.',
    arPreviewFailed: 'AR Preview Failed',
    arPreviewFailedDescription: 'Could not generate AR preview. The AI model might be unavailable or the images may not be suitable. Please try again with different images.',
    designsGenerated: 'Designs Generated!',
    designsGeneratedDescription: 'Explore your new tattoo ideas below.',
    generationFailed: 'Generation Failed',
    generationFailedDescription: 'Could not generate tattoo designs. Please try again.',
    missingImageForRefinement: 'Missing Image for Refinement',
    missingImageForRefinementDescription: 'Please provide a reference image for refinement.',
    designRefined: 'Design Refined!',
    designRefinedDescription: 'The selected design has been updated with new details.',
    refinementFailed: 'Refinement Failed',
    refinementFailedDescription: 'Could not refine the tattoo design.',
    designSaved: 'Design Saved!',
    designSavedDescription: 'View it in your Library.',
    designDeleted: 'Design Deleted',
    designDeletedDescription: 'The tattoo design has been removed from your library.',
  },
};

export function getTranslatedString(
  lang: Locale,
  key: TranslationKey,
  replacements?: Record<string, string>
): string {
  const translationSet = translations[lang] || translations.en;
  let str = translationSet[key] || key; // Fallback to key if not found

  if (replacements) {
    Object.keys(replacements).forEach(placeholder => {
      str = str.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
    });
  }
  return str;
}
