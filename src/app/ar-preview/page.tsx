// src/app/ar-preview/page.tsx
import { notFound } from 'next/navigation';

// This page was part of the AR Preview feature which has been removed
// and replaced by the Placement Visualizer.
// It now correctly returns a 404 error.
export default function ARPreviewPage() {
  notFound();
  // This return is technically unreachable but good for linting/type checking.
  return null;
}
