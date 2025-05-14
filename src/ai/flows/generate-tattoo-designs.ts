// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating tattoo designs based on user descriptions.
 *
 * - generateTattooDesigns - A function that takes a tattoo idea description and generates tattoo design proposals.
 * - GenerateTattooDesignsInput - The input type for the generateTattooDesigns function.
 * - GenerateTattooDesignsOutput - The return type for the generateTattooDesigns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTattooDesignsInputSchema = z.object({
  description: z.string().describe('A detailed description of the desired tattoo, including style, elements, and placement.'),
  stylePreferences: z.string().describe('The preferred tattoo styles (e.g., traditional, minimalist, watercolor).'),
  keywords: z.string().describe('Keywords related to the tattoo design (e.g., nature, geometric, abstract).'),
  referenceImage: z
    .string()
    .optional()
    .describe(
      "Optional: A reference image for the tattoo design as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type GenerateTattooDesignsInput = z.infer<typeof GenerateTattooDesignsInputSchema>;

const GenerateTattooDesignsOutputSchema = z.object({
  designProposals: z.array(z.string()).describe('An array of tattoo design proposals, each described as a string.'),
});

export type GenerateTattooDesignsOutput = z.infer<typeof GenerateTattooDesignsOutputSchema>;

export async function generateTattooDesigns(input: GenerateTattooDesignsInput): Promise<GenerateTattooDesignsOutput> {
  return generateTattooDesignsFlow(input);
}

const incorporateElementTool = ai.defineTool(
  {
    name: 'incorporateElement',
    description: 'Determines whether a specific element should be incorporated into the tattoo design based on the user description and style preferences.',
    inputSchema: z.object({
      element: z.string().describe('The element to consider incorporating (e.g., a specific symbol, animal, or style).'),
      reason: z.string().describe('Why the element may or may not be suitable.'),
    }),
    outputSchema: z.boolean().describe('True if the element should be incorporated, false otherwise.'),
  },
  async input => {
    // In a real implementation, this would involve a more complex decision-making process.
    // For now, we simply return true if the element is mentioned in the description.
    return input.reason.toLowerCase().includes('yes');
  }
);

const generateTattooDesignsPrompt = ai.definePrompt({
  name: 'generateTattooDesignsPrompt',
  input: {schema: GenerateTattooDesignsInputSchema},
  output: {schema: GenerateTattooDesignsOutputSchema},
  tools: [incorporateElementTool],
  prompt: `You are an expert tattoo artist specializing in generating unique and creative tattoo designs based on user descriptions.

  Consider the user's description, style preferences, and keywords to create multiple distinct tattoo design proposals.
  Evaluate which specific design elements would be suitable, and remember that the overall design should be visually appealing and coherent.

  Description: {{{description}}}
  Style Preferences: {{{stylePreferences}}}
  Keywords: {{{keywords}}}
  {{~#if referenceImage}}Reference Image: {{media url=referenceImage}}{{/if}}

  Example Usage of incorporateElement Tool:

  Let's consider some design elements based on the keywords and style:
  Should a traditional rose be incorporated into the design? {{incorporateElementTool element=\'rose\' reason=\'The user mentioned traditional styles and roses are classic.\'}}
  Should geometric patterns be incorporated? {{incorporateElementTool element=\'geometric patterns\' reason=\'The user mentioned geometric as a keyword.\'}}

  Based on the user input, generate three different tattoo design proposals as strings inside a JSON array.
  Each design should be distinct and reflect the user's preferences.
  Remember to incorporate elements from the description, keywords, and style preferences as appropriate.
  Consider placement when generating designs.
  Follow JSON schema: {{$outputSchema}}.
  `, 
});

const generateTattooDesignsFlow = ai.defineFlow(
  {
    name: 'generateTattooDesignsFlow',
    inputSchema: GenerateTattooDesignsInputSchema,
    outputSchema: GenerateTattooDesignsOutputSchema,
  },
  async input => {
    const {output} = await generateTattooDesignsPrompt(input);
    return output!;
  }
);
