
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
    tattooIdeaPlaceholder: "z.B. Ein majestätischer Wolf, der einen geometrischen Mond anheult, umgeben von Waldschatten...",
    stylePreference: 'Stilpräferenz',
    selectStyle: 'Wähle einen Tattoo-Stil',
    keywordsOptional: 'Schlüsselwörter (Optional)',
    keywordsHint: 'Kommagetrennte Schlüsselwörter.',
    keywordsPlaceholder: "z.B. Natur, kosmisch, lebendig, zart",
    referenceImageOptional: 'Referenzbild (Optional)',
    generateDesigns: 'Designs generieren',
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
    generateImageButton: 'Bild generieren',
    generatingImage: 'Bild wird generiert...',
    generatedTattooImageAlt: 'Generiertes Tattoo-Bild für Vorschlag {proposalNumber}',
    proposalRefinedAndImageGenerated: 'Vorschlag verfeinert & Bild generiert',
    proposalRefinedDescription: 'Der Vorschlag und das zugehörige Bild wurden aktualisiert.',


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
    referenceImageAlt: "Referenzbild",
    generatedImageAlt: "Generiertes Tattoo-Bild",


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
    arPreviewAlt: "AR Tattoo Vorschau",
    
    // Settings Page
    language: 'Sprache',
    appearance: 'Erscheinungsbild',
    theme: 'Theme',
    light: 'Hell',
    dark: 'Dunkel',
    german: 'Deutsch',
    english: 'Englisch',
    settingsPageDescription: "Passe hier deine App-Erfahrung an.",

    // FileUpload Component
    fileUploadHint: "Zum Hochladen klicken oder per Drag & Drop ziehen",
    uploadAccepted: 'Akzeptiert: {types}',
    removeImageAriaLabel: "Bild entfernen",
    invalidFileTypeToastTitle: "Ungültiger Dateityp",
    invalidFileTypeToastDescription: "Bitte laden Sie {acceptedTypes} hoch.",

    // Toasts
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
    imageGeneratedSuccessTitle: 'Bild generiert!',
    imageGeneratedSuccessDescription: 'Dein Tattoo-Bild wurde erfolgreich erstellt.',
    imageGeneratedErrorTitle: 'Bildgenerierung fehlgeschlagen',
    imageGeneratedErrorDescription: 'Das Bild für dein Tattoo konnte nicht erstellt werden. Das KI-Modell ist möglicherweise nicht verfügbar oder der Inhalt wurde blockiert. Bitte versuche es später erneut oder mit einer anderen Beschreibung.',

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
    tattooIdeaPlaceholder: "e.g. A majestic wolf howling at a geometric moon, surrounded by forest shadows...",
    stylePreference: 'Style Preference',
    selectStyle: 'Select a tattoo style',
    keywordsOptional: 'Keywords (Optional)',
    keywordsHint: 'Comma-separated keywords.',
    keywordsPlaceholder: "e.g. Nature, cosmic, vibrant, delicate",
    referenceImageOptional: 'Reference Image (Optional)',
    generateDesigns: 'Generate Designs',
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
    generateImageButton: 'Generate Image',
    generatingImage: 'Generating image...',
    generatedTattooImageAlt: 'Generated tattoo image for proposal {proposalNumber}',
    proposalRefinedAndImageGenerated: 'Proposal Refined & Image Generated',
    proposalRefinedDescription: 'The proposal and its associated image have been updated.',
    

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
    referenceImageAlt: "Reference image",
    generatedImageAlt: "Generated tattoo image",


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
    arPreviewAlt: "AR Tattoo Preview",
    
    // Settings Page
    language: 'Language',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    german: 'German',
    english: 'English',
    settingsPageDescription: "Customize your app experience here.",

    // FileUpload Component
    fileUploadHint: "Click to upload or drag and drop",
    uploadAccepted: 'Accepted: {types}',
    removeImageAriaLabel: "Remove image",
    invalidFileTypeToastTitle: "Invalid File Type",
    invalidFileTypeToastDescription: "Please upload {acceptedTypes}.",


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
    imageGeneratedSuccessTitle: 'Image Generated!',
    imageGeneratedSuccessDescription: 'Your tattoo image has been successfully created.',
    imageGeneratedErrorTitle: 'Image Generation Failed',
    imageGeneratedErrorDescription: 'Could not generate the image for your tattoo. The AI model might be unavailable or the content was blocked. Please try again later or with a different description.',
  },
};

export function getTranslatedString(
  lang: Locale,
  key: TranslationKey,
  replacements?: Record<string, string>
): string {
  const translationSet = translations[lang] || translations.en; // Fallback to English if lang not found
  let str = translationSet[key] || key; // Fallback to key itself if not found in chosen or English set

  if (replacements) {
    Object.keys(replacements).forEach(placeholder => {
      str = str.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
    });
  }
  return str;
}
