"use client";

import dynamic from 'next/dynamic';

interface DicomViewerProps {
  initialUrl?: string;
  hideToolbar?: boolean;
}

const DicomViewerBase = dynamic(() => import('./DwvComponent'), {
  ssr: false, // Critical for dwv (needs window/document)
  loading: () => (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-black text-gray-500">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p>Initializing DICOM Engine...</p>
    </div>
  ),
});

export default function DicomViewer(props: DicomViewerProps) {
  return <DicomViewerBase {...props} />;
}
