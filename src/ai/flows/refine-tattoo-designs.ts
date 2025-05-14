// src/ai/flows/refine-tattoo-designs.ts
'use server';

/**
 * @fileOverview Refines tattoo designs based on user-provided reference images.
 *
 * - refineTattooDesigns - A function that handles the tattoo design refinement process.
 * - RefineTattooDesignsInput - The input type for the refineTattooDesigns function.
 * - RefineTattooDesignsOutput - The return type for the refineTattooDesigns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineTattooDesignsInputSchema = z.object({
  baseDesignDescription: z
    .string()
    .describe('The initial description of the desired tattoo design.'),
  referenceImageDataUri: z
    .string()
    .describe(
      "A reference image to guide the tattoo design, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type RefineTattooDesignsInput = z.infer<typeof RefineTattooDesignsInputSchema>;

const RefineTattooDesignsOutputSchema = z.object({
  refinedDesignDescription: z
    .string()
    .describe('A refined description of the tattoo design based on the reference image.'),
  imageGenerationPrompt: z
    .string()
    .describe('A prompt to be used to generate an image of the design.'),
});

export type RefineTattooDesignsOutput = z.infer<typeof RefineTattooDesignsOutputSchema>;

export async function refineTattooDesigns(input: RefineTattooDesignsInput): Promise<RefineTattooDesignsOutput> {
  return refineTattooDesignsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineTattooDesignsPrompt',
  input: {schema: RefineTattooDesignsInputSchema},
  output: {schema: RefineTattooDesignsOutputSchema},
  prompt: `You are a tattoo design expert. A user wants a tattoo with the following description: "{{baseDesignDescription}}".
They have also provided a reference image to guide the design:
{{media url=referenceImageDataUri}}

Based on the reference image, provide a refined description of the tattoo design and an image generation prompt that incorporates elements from both the original description and the reference image.

Ensure the refined design description describes the new tattoo design incorporating elements of the image, and make sure the image generation prompt will lead to a clear image of the tattoo design.

Return the description as the refinedDesignDescription, and the image generation prompt as imageGenerationPrompt.`,
});

const refineTattooDesignsFlow = ai.defineFlow(
  {
    name: 'refineTattooDesignsFlow',
    inputSchema: RefineTattooDesignsInputSchema,
    outputSchema: RefineTattooDesignsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
