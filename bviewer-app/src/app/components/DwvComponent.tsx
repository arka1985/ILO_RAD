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
import { Upload, Ruler, Circle, Maximize, X, Eraser, Trash2, Contrast } from 'lucide-react';

let cornerstoneInitialized = false;

// Store manual calibrations
const customSpacings: Record<string, {rowPixelSpacing: number, columnPixelSpacing: number}> = {};

function customMetaDataProvider(type: string, imageId: string) {
  if (type === 'imagePlaneModule') {
    if (customSpacings[imageId]) {
      return {
        rowPixelSpacing: customSpacings[imageId].rowPixelSpacing,
        columnPixelSpacing: customSpacings[imageId].columnPixelSpacing
      };
    }
  }
  return undefined;
}

function initCornerstone() {
  if (cornerstoneInitialized) return;
  cornerstoneInitialized = true;
  
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.Hammer = Hammer;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

  cornerstone.metaData.addProvider(customMetaDataProvider, 10000);
  
  cornerstoneTools.init({
    showSVGCursors: false,
  });

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
  // Suppress cornerstone-tools colorLUT warning
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('colorLUT only provides 0 labels')) {
        return;
      }
      originalWarn.apply(console, args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTool, setActiveTool] = useState<'Wwwc' | 'Pan' | 'Zoom' | 'Length' | 'EllipticalRoi' | 'Eraser'>('Wwwc');
  
  // Calibration State
  const [loadedImage, setLoadedImage] = useState<any>(null);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [physicalWidth, setPhysicalWidth] = useState("");
  const [physicalHeight, setPhysicalHeight] = useState("");
  const [isCalibrated, setIsCalibrated] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initCornerstone();
  }, []);

  // Enable cornerstone element immediately after mount
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;
    
    try { 
      cornerstone.enable(containerRef.current); 
    } catch(e) {}
    
    const handleResize = () => {
      if (containerRef.current) {
        try {
          cornerstone.resize(containerRef.current);
          const enabledElement = cornerstone.getEnabledElement(containerRef.current);
          if (enabledElement && enabledElement.viewport) {
            cornerstone.fitToWindow(containerRef.current);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('resize', handleResize);
    
    try { 
      // Add tools specifically to this element to avoid "Unable to find tool" errors
      cornerstoneTools.addToolForElement(containerRef.current, cornerstoneTools.WwwcTool);
      cornerstoneTools.addToolForElement(containerRef.current, cornerstoneTools.PanTool);
      cornerstoneTools.addToolForElement(containerRef.current, cornerstoneTools.ZoomTool);
      cornerstoneTools.addToolForElement(containerRef.current, cornerstoneTools.LengthTool);
      cornerstoneTools.addToolForElement(containerRef.current, cornerstoneTools.EllipticalRoiTool);
      cornerstoneTools.addToolForElement(containerRef.current, cornerstoneTools.EraserTool);
    } catch(e) {}

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        try { cornerstone.disable(containerRef.current); } catch(e) {}
      }
    };
  }, [isMounted]);

  // Update active tool when it changes
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;
    try {
      const element = containerRef.current;
      // Passivate all tools first
      const tools = ['Wwwc', 'Pan', 'Zoom', 'Length', 'EllipticalRoi', 'Eraser'];
      tools.forEach(tool => {
        try { cornerstoneTools.setToolPassiveForElement(element, tool); } catch(e) {}
      });

      // Calculate masks
      // Middle click (4) is always Pan, Right click (2) is always Zoom
      let panMask = 4;
      let zoomMask = 2;
      
      if (activeTool === 'Pan') panMask |= 1; // Left + Middle
      else if (activeTool === 'Zoom') zoomMask |= 1; // Left + Right
      
      // Activate fixed tools
      cornerstoneTools.setToolActiveForElement(element, 'Pan', { mouseButtonMask: panMask });
      cornerstoneTools.setToolActiveForElement(element, 'Zoom', { mouseButtonMask: zoomMask });

      // Activate selected tool for left click (if it's not Pan or Zoom, which we already handled)
      if (activeTool !== 'Pan' && activeTool !== 'Zoom') {
        cornerstoneTools.setToolActiveForElement(element, activeTool, { mouseButtonMask: 1 });
      }
      
    } catch(e) {
      console.log("Error updating tools", e);
    }
  }, [activeTool, isMounted]);

  const handleClearMeasurements = () => {
    if (containerRef.current) {
      cornerstoneTools.clearToolState(containerRef.current, 'Length');
      cornerstoneTools.clearToolState(containerRef.current, 'EllipticalRoi');
      cornerstone.updateImage(containerRef.current);
    }
  };

  const toggleInvert = () => {
    if (!containerRef.current) return;
    const viewport = cornerstone.getViewport(containerRef.current);
    if (viewport) {
      viewport.invert = !viewport.invert;
      cornerstone.setViewport(containerRef.current, viewport);
    }
  };

  const handleImageLoaded = (image: any) => {
    if (!containerRef.current) return;
    
    setLoadedImage(image);
    
    // Check if image has valid pixel spacing
    if (image.columnPixelSpacing && image.rowPixelSpacing) {
      setIsCalibrated(true);
      setPhysicalWidth((image.columnPixelSpacing * image.width).toFixed(1));
      setPhysicalHeight((image.rowPixelSpacing * image.height).toFixed(1));
    } else {
      setIsCalibrated(false);
      setPhysicalWidth("");
      setPhysicalHeight("");
    }
    
    // --- MONOCHROME1 INVERSION FIX ---
    // If the image is MONOCHROME1 (invert = true), dark areas have high numerical values.
    // We invert the raw pixel data and turn off the invert flag so that ROI tools
    // (Mean, StdDev) report intuitively (white = high value, dark = low value).
    if (image.invert) {
      const pixels = image.getPixelData();
      const max = image.maxPixelValue;
      const min = image.minPixelValue;
      
      if (pixels && max !== undefined && min !== undefined) {
        for (let i = 0; i < pixels.length; i++) {
          pixels[i] = max - (pixels[i] - min);
        }
        image.invert = false;
        
        // Ensure window levels still apply correctly to the newly inverted data
        if (image.windowCenter !== undefined) {
          if (Array.isArray(image.windowCenter)) {
            image.windowCenter = image.windowCenter.map((wc: number) => max - (wc - min));
          } else {
            image.windowCenter = max - (image.windowCenter - min);
          }
        }
      }
    }
    // ---------------------------------
    
    // Get the default viewport for this specific image to avoid inheriting previous image's windowing
    const defaultViewport = cornerstone.getDefaultViewportForImage(containerRef.current, image);
    cornerstone.displayImage(containerRef.current, image, defaultViewport);
    cornerstone.fitToWindow(containerRef.current);
  };

  const applyCalibration = () => {
    if (!loadedImage || (!physicalWidth && !physicalHeight) || !containerRef.current) return;
    
    let w = parseFloat(physicalWidth);
    let h = parseFloat(physicalHeight);
    
    if (w > 0 || h > 0) {
      let spacing = 0;
      
      // If only width is provided
      if (w > 0 && !(h > 0)) {
        spacing = w / loadedImage.width;
      } 
      // If only height is provided
      else if (h > 0 && !(w > 0)) {
        spacing = h / loadedImage.height;
      } 
      // If both are provided, average them to enforce square pixels
      else {
        const colSpacing = w / loadedImage.width;
        const rowSpacing = h / loadedImage.height;
        spacing = (colSpacing + rowSpacing) / 2;
      }
      
      // CRITICAL: We must set column and row spacing to the EXACT SAME value.
      // If they are different, Cornerstone assumes the physical pixels are rectangular 
      // and will stretch/warp the image visually to compensate.
      loadedImage.columnPixelSpacing = spacing;
      loadedImage.rowPixelSpacing = spacing;
      
      customSpacings[loadedImage.imageId] = {
        columnPixelSpacing: spacing,
        rowPixelSpacing: spacing
      };
      
      setIsCalibrated(true);
      
      // Force cornerstone to clear its metadata cache for this tool if any,
      // and re-render the image so tools update their displays without warping it.
      cornerstone.updateImage(containerRef.current);
      setShowCalibrationModal(false);
    }
  };

  // Handle URL loading
  useEffect(() => {
    if (!isMounted || !containerRef.current || !initialUrl) return;
    
    setErrorMsg("");
    const urlToLoad = initialUrl.startsWith('http') 
      ? initialUrl 
      : `${window.location.origin}${initialUrl.startsWith('/') ? '' : '/'}${initialUrl}`;
      
    const isWebImage = urlToLoad.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
    const imageId = isWebImage ? urlToLoad : `wadouri:${urlToLoad}`;
    console.log("Cornerstone loading URL:", imageId);
    
    cornerstone.loadImage(imageId).then(handleImageLoaded).catch((err: any) => {
      console.error("Cornerstone Load Error:", err);
      setErrorMsg(err.message || "Failed to load image");
    });
  }, [initialUrl, isMounted]); // Don't include activeTool here to avoid reload

  // Handle local File loading
  useEffect(() => {
    if (!isMounted || !containerRef.current || !patientFile) return;
    
    setErrorMsg("");
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(patientFile);
    console.log("Cornerstone loading File:", imageId);
    
    cornerstone.loadImage(imageId).then(handleImageLoaded).catch((err: any) => {
      console.error("Cornerstone File Load Error:", err);
      setErrorMsg(err.message || "Failed to load local file");
    });
  }, [patientFile, isMounted]); // Don't include activeTool here to avoid reload

  if (!isMounted) return <div className="flex-1 w-full h-full bg-black"></div>;

  return (
    <div className="flex flex-col w-full h-full bg-black relative">
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center z-20 text-red-500 bg-black bg-opacity-80 p-4 text-center">
          Error: {errorMsg}
        </div>
      )}

      {/* Toolbar Layer */}
      {!hideToolbar && loadedImage && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-[#1e293b] rounded-lg shadow-xl border border-[#334155] flex items-center space-x-1 p-1">
          <button 
            onClick={() => setActiveTool('Length')}
            title="Measure Length"
            className={`p-2 rounded transition-colors ${activeTool === 'Length' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#334155]'}`}
          >
            <Ruler size={18} />
          </button>
          <button 
            onClick={() => setActiveTool('EllipticalRoi')}
            title="Measure Area/Shape"
            className={`p-2 rounded transition-colors ${activeTool === 'EllipticalRoi' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#334155]'}`}
          >
            <Circle size={18} />
          </button>
          <button 
            onClick={() => setActiveTool('Eraser')}
            title="Eraser (Delete Single Measurement)"
            className={`p-2 rounded transition-colors ${activeTool === 'Eraser' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#334155]'}`}
          >
            <Eraser size={18} />
          </button>
          
          <div className="w-px h-6 bg-[#334155] mx-1"></div>

          <button 
            onClick={toggleInvert}
            title="Invert Image Colors (Negative/Positive)"
            className="p-2 rounded transition-colors text-gray-400 hover:text-white hover:bg-[#334155]"
          >
            <Contrast size={18} />
          </button>
          
          <div className="w-px h-6 bg-[#334155] mx-1"></div>

          <button 
            onClick={handleClearMeasurements}
            title="Clear All Measurements"
            className="p-2 rounded transition-colors text-red-400 hover:text-red-300 hover:bg-[#334155]"
          >
            <Trash2 size={18} />
          </button>
          
          <div className="w-px h-6 bg-[#334155] mx-1"></div>
          
          <button 
            onClick={() => setShowCalibrationModal(true)}
            title="Calibrate Physical Size"
            className={`p-2 rounded transition-colors flex items-center space-x-1 ${!isCalibrated ? 'bg-orange-600 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-[#334155]'}`}
          >
            <Maximize size={18} />
            {!isCalibrated && <span className="text-[10px] font-bold px-1 uppercase tracking-wider">Uncalibrated</span>}
          </button>
        </div>
      )}

      {/* Calibration Modal */}
      {showCalibrationModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-[#334155] rounded-lg shadow-2xl w-full max-w-sm p-6 relative">
            <button 
              onClick={() => setShowCalibrationModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
              <Maximize size={20} className="text-orange-400" />
              <span>Image Size Calibration</span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              If this image lacks DICOM pixel spacing data, measurements will default to pixels. Enter the known physical width <strong>OR</strong> height of the film/detector to calibrate measurements into millimeters. (You only need to enter one to prevent image distortion).
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Width (mm)</label>
                <input 
                  type="number" 
                  value={physicalWidth}
                  onChange={e => setPhysicalWidth(e.target.value)}
                  placeholder="e.g. 350 (Optional if Height given)" 
                  className="w-full bg-[#020617] border border-[#475569] text-white px-3 py-2 rounded outline-none focus:border-orange-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Height (mm)</label>
                <input 
                  type="number" 
                  value={physicalHeight}
                  onChange={e => setPhysicalHeight(e.target.value)}
                  placeholder="e.g. 430 (Optional if Width given)" 
                  className="w-full bg-[#020617] border border-[#475569] text-white px-3 py-2 rounded outline-none focus:border-orange-500" 
                />
              </div>
              <button 
                onClick={applyCalibration}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded transition-colors mt-2"
              >
                Apply Calibration
              </button>
            </div>
          </div>
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
