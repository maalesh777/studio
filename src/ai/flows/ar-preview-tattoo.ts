'use server';

/**
 * @fileOverview AR Tattoo Preview Flow.
 *
 * This file defines a Genkit flow for projecting tattoo designs onto a user's body in real-time using augmented reality.
 *
 * @remarks
 * - `arPreviewTattoo`: The main function to initiate the AR tattoo preview process.
 * - `ARPreviewTattooInput`: The input type for the `arPreviewTattoo` function.
 * - `ARPreviewTattooOutput`: The output type for the `arPreviewTattoo` function, providing AR visualization details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the AR tattoo preview flow.
 * @remarks
 * Includes the tattoo design as a data URI and the user's body image as a data URI.
 */
const ARPreviewTattooInputSchema = z.object({
  tattooDesignDataUri: z
    .string()
    .describe(
      'The tattoo design as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  bodyImageDateUri: z
    .string()
    .describe(
      'The user\'s body image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

/**
 * Type for the input of the AR tattoo preview flow.
 */
export type ARPreviewTattooInput = z.infer<typeof ARPreviewTattooInputSchema>;

/**
 * Output schema for the AR tattoo preview flow.
 * @remarks
 * Includes the AR visualization as a data URI.
 */
const ARPreviewTattooOutputSchema = z.object({
  arVisualizationDataUri: z
    .string()
    .describe(
      'The AR visualization of the tattoo on the body as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

/**
 * Type for the output of the AR tattoo preview flow.
 */
export type ARPreviewTattooOutput = z.infer<typeof ARPreviewTattooOutputSchema>;

/**
 * Function to initiate the AR tattoo preview process.
 * @param input - The input containing the tattoo design and body image data URIs.
 * @returns A promise that resolves with the AR visualization data URI.
 */
export async function arPreviewTattoo(input: ARPreviewTattooInput): Promise<ARPreviewTattooOutput> {
  return arPreviewTattooFlow(input);
}

const arPreviewTattooPrompt = ai.definePrompt({
  name: 'arPreviewTattooPrompt',
  input: {schema: ARPreviewTattooInputSchema},
  output: {schema: ARPreviewTattooOutputSchema},
  prompt: `Given the tattoo design and the user's body image, generate an AR visualization of the tattoo on the body.

Tattoo Design: {{media url=tattooDesignDataUri}}
Body Image: {{media url=bodyImageDateUri}}

Create a realistic visualization of the tattoo on the body, considering the contours and lighting of the body.

Return the AR visualization as a data URI.

AR Visualization: {{media url=arVisualizationDataUri}}`,
});

/**
 * Genkit flow for AR tattoo preview.
 * @param input - The input containing the tattoo design and body image data URIs.
 * @returns A promise that resolves with the AR visualization data URI.
 */
const arPreviewTattooFlow = ai.defineFlow(
  {
    name: 'arPreviewTattooFlow',
    inputSchema: ARPreviewTattooInputSchema,
    outputSchema: ARPreviewTattooOutputSchema,
  },
  async input => {
    // Use Gemini 2.0 Flash experimental image generation to generate images using Genkit.
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.tattooDesignDataUri}},
        {media: {url: input.bodyImageDateUri}},
        {text: 'Create a realistic visualization of the tattoo on the body'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {arVisualizationDataUri: media.url!};
  }
);
