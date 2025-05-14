export interface TattooDesign {
  id: string;
  description: string;
  stylePreferences?: string;
  keywords?: string;
  referenceImage?: string; // Data URI of the reference image uploaded by user
  createdAt: string;
  generatedImageUri?: string; // Data URI of an AI generated image representing this design
  arPreviewImageUri?: string; // Data URI of the AR preview image
}

export interface GeneratedProposal {
  description: string;
  // Potentially add other fields if AI provides more structured output
}
