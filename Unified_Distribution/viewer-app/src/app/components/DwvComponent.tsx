"use client";

import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import * as cornerstone from 'cornerstone-core';
// @ts-ignore
import * as cornerstoneTools from 'cornerstone-tools';
// @ts-ignore
import * as cornerstoneMath from 'cornerstone-math';
// @ts-ignore
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
// @ts-ignore
import dicomParser from 'dicom-parser';
// @ts-ignore
import Hammer from 'hammerjs';
import { Upload } from 'lucide-react';

let cornerstoneInitialized = false;

function initCornerstone() {
  if (cornerstoneInitialized) return;
  cornerstoneInitialized = true;
  
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.Hammer = Hammer;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

  cornerstoneTools.init();

  cornerstoneWADOImageLoader.webWorkerManager.initialize({
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        usePDFJS: false,
        strict: false,
      },
    },
  });
}

interface DicomViewerProps {
  initialUrl?: string;
  patientFile?: File | null;
  hideToolbar?: boolean;
}

export default function DicomViewerBase({ initialUrl, patientFile, hideToolbar = false }: DicomViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setIsMounted(true);
    initCornerstone();
  }, []);

  // Handle URL loading
  useEffect(() => {
    if (!isMounted || !containerRef.current || !initialUrl) return;
    
    try { cornerstone.enable(containerRef.current); } catch(e) {}
    
    setErrorMsg("");
    const urlToLoad = initialUrl.startsWith('http') 
      ? initialUrl 
      : `${window.location.origin}${initialUrl.startsWith('/') ? '' : '/'}${initialUrl}`;
      
    const imageId = `wadouri:${urlToLoad}`;
    console.log("Cornerstone loading URL:", imageId);
    
    cornerstone.loadImage(imageId).then((image: any) => {
      if (!containerRef.current) return;
      cornerstone.displayImage(containerRef.current, image);
      
      try { cornerstoneTools.addTool(cornerstoneTools.WwwcTool); } catch(e) {}
      try { cornerstoneTools.addTool(cornerstoneTools.PanTool); } catch(e) {}
      try { cornerstoneTools.addTool(cornerstoneTools.ZoomTool); } catch(e) {}
      
      cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
      cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 4 });
      cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 });
    }).catch((err: any) => {
      console.error("Cornerstone Load Error:", err);
      setErrorMsg(err.message || "Failed to load image");
    });

    return () => {
      if (containerRef.current) {
        try {
          cornerstone.disable(containerRef.current);
        } catch(e) {}
      }
    };
  }, [initialUrl, isMounted]);

  // Handle local File loading
  useEffect(() => {
    if (!isMounted || !containerRef.current || !patientFile) return;
    
    try { cornerstone.enable(containerRef.current); } catch(e) {}
    
    setErrorMsg("");
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(patientFile);
    console.log("Cornerstone loading File:", imageId);
    
    cornerstone.loadImage(imageId).then((image: any) => {
      if (!containerRef.current) return;
      cornerstone.displayImage(containerRef.current, image);
      
      try { cornerstoneTools.addTool(cornerstoneTools.WwwcTool); } catch(e) {}
      try { cornerstoneTools.addTool(cornerstoneTools.PanTool); } catch(e) {}
      try { cornerstoneTools.addTool(cornerstoneTools.ZoomTool); } catch(e) {}
      
      cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
      cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 4 });
      cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 });
    }).catch((err: any) => {
      console.error("Cornerstone File Load Error:", err);
      setErrorMsg(err.message || "Failed to load local file");
    });
    
    return () => {
      if (containerRef.current) {
        try {
          cornerstone.disable(containerRef.current);
        } catch(e) {}
      }
    };
  }, [patientFile, isMounted]);

  if (!isMounted) return <div className="flex-1 w-full h-full bg-black"></div>;

  return (
    <div className="flex flex-col w-full h-full bg-black relative">
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center z-20 text-red-500 bg-black bg-opacity-80 p-4 text-center">
          Error: {errorMsg}
        </div>
      )}

      <div 
        className="flex-1 w-full h-full relative overflow-hidden bg-black" 
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
      >
      </div>
    </div>
  );
}
