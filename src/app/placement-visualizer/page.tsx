import { Suspense } from 'react';
import PlacementVisualizerContent from './placement-visualizer-content';

export default function PlacementVisualizerPage() {
  return (
    <Suspense fallback={<div>Loading visualization...</div>}>
      <PlacementVisualizerContent />
    </Suspense>
  );
}
