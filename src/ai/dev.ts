
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-tattoo-designs.ts';
import '@/ai/flows/refine-tattoo-designs.ts';
// import '@/ai/flows/ar-preview-tattoo.ts'; // Removed AR Preview
import '@/ai/flows/generate-tattoo-image.ts';

