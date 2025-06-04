
'use server';
/**
 * @fileOverview Generates an image for a tattoo design.
 * - generateTattooImage - A function that takes a textual prompt and generates an image.
 * - GenerateTattooImageInput - Input type.
 * - GenerateTattooImageOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTattooImageInputSchema = z.object({
  prompt: z.string().describe('The detailed textual prompt for tattoo image generation.'),
});
export type GenerateTattooImageInput = z.infer<typeof GenerateTattooImageInputSchema>;

const GenerateTattooImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'The generated tattoo image as a data URI. Format: \'data:image/png;base64,<encoded_data>\'.'
    ),
});
export type GenerateTattooImageOutput = z.infer<typeof GenerateTattooImageOutputSchema>;

export async function generateTattooImage(input: GenerateTattooImageInput): Promise<GenerateTattooImageOutput> {
  return generateTattooImageFlow(input);
}

const generateTattooImageFlow = ai.defineFlow(
  {
    name: 'generateTattooImageFlow',
    inputSchema: GenerateTattooImageInputSchema,
    outputSchema: GenerateTattooImageOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: input.prompt, 
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE', // Adjusted based on potential tattoo imagery
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            }
        ]
      },
    });

    if (!media || !media.url) { // Added check for media being null or undefined
 throw new Error('Image generation failed or returned no media or media URL.');
    }
    return {imageDataUri: media.url};
  }
);
