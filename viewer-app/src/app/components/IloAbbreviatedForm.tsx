"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';

export default function IloAbbreviatedForm() {
  const [formData, setFormData] = useState({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ilo_abbreviated_classification.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-300 p-2 text-xs font-sans text-gray-900 leading-tight">
      <div className="max-w-4xl mx-auto bg-white border border-gray-400 shadow-sm">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 text-white p-2">
          <h1 className="text-sm font-bold tracking-wider">READING SHEET FOR ABBREVIATED ILO CLASSIFICATION</h1>
          <button onClick={exportToJson} className="flex items-center space-x-1 hover:text-blue-200" title="Export Data">
            <Download size={14} /> <span>Export JSON</span>
          </button>
        </div>

        {/* Identifiers */}
        <div className="grid grid-cols-2 border-b border-gray-400">
          <div className="flex border-r border-gray-400">
            <label className="w-32 bg-gray-100 p-1 border-r border-gray-400 font-bold flex items-center">Reader Code</label>
            <input type="text" name="readerCode" onChange={handleInputChange} className="flex-1 p-1 outline-none focus:bg-yellow-50" />
          </div>
          <div className="flex">
            <label className="w-32 bg-gray-100 p-1 border-r border-gray-400 font-bold flex items-center">Radiograph Identifier</label>
            <input type="text" name="radiographIdentifier" onChange={handleInputChange} className="flex-1 p-1 outline-none focus:bg-yellow-50" />
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-gray-400">
          <div className="flex border-r border-gray-400">
            <label className="w-32 bg-gray-100 p-1 border-r border-gray-400 font-bold flex items-center">Date of Reading</label>
            <input type="date" name="dateOfReading" onChange={handleInputChange} className="flex-1 p-1 outline-none focus:bg-yellow-50 uppercase" />
          </div>
          <div className="flex">
            <label className="w-32 bg-gray-100 p-1 border-r border-gray-400 font-bold flex items-center">Date of Radiograph</label>
            <input type="date" name="dateOfRadiograph" onChange={handleInputChange} className="flex-1 p-1 outline-none focus:bg-yellow-50 uppercase" />
          </div>
        </div>

        {/* Technical Quality */}
        <div className="border-b border-gray-400">
          <div className="bg-gray-200 p-1 border-b border-gray-400 font-bold">TECHNICAL QUALITY</div>
          <div className="flex flex-col md:flex-row p-2 gap-4 items-start">
            <div className="flex items-center space-x-4 border border-gray-300 p-2 rounded">
              <span className="font-bold">Grade</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map(grade => (
                  <label key={grade} className="flex items-center justify-center w-6 h-6 border border-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-200 font-bold">
                    <input type="radio" name="technicalQuality" value={grade} onChange={handleInputChange} className="hidden peer" />
                    <span className="peer-checked:bg-blue-600 peer-checked:text-white w-full h-full flex items-center justify-center">{grade}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full border border-gray-300 p-2 rounded bg-gray-50 flex flex-col">
              <label className="font-bold mb-1 flex justify-between">
                <span>Comment on technical quality:</span>
                <span className="font-normal italic text-[10px] text-gray-500">(If grade not 1 – comments required)</span>
              </label>
              <textarea name="qualityComment" rows={2} onChange={handleInputChange} className="w-full p-1 border border-gray-400 outline-none focus:bg-yellow-50"></textarea>
            </div>
          </div>
        </div>

        {/* Parenchymal Abnormalities */}
        <div className="border-b border-gray-400">
          <div className="bg-gray-200 p-1 border-b border-gray-400 font-bold">PARENCHYMAL ABNORMALITIES</div>
          <div className="flex flex-col">
            
            {/* Small Opacities */}
            <div className="flex border-b border-gray-300">
              <div className="w-1/2 p-2 border-r border-gray-300 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Small opacities</h3>
                  <span className="text-[10px] text-gray-600 block">Predominant shape and size</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="grid grid-cols-6 gap-1 w-[130px]">
                    {['p', 'q', 'r', 's', 't', 'u'].map(shape => (
                      <label key={shape} className="flex items-center justify-center border border-red-300 text-red-700 font-bold text-[10px] w-5 h-5 cursor-pointer hover:bg-red-50">
                        <input type="radio" name="smallOpacitiesShape" value={shape} onChange={handleInputChange} className="hidden peer" />
                        <span className="peer-checked:bg-red-600 peer-checked:text-white w-full h-full flex items-center justify-center">{shape}</span>
                      </label>
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-500 italic">Mark only one</span>
                </div>
              </div>
              
              <div className="w-1/2 p-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-600 block">Profusion (4-point scale)</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3].map(cat => (
                      <label key={cat} className="flex items-center justify-center border border-red-300 text-red-700 font-bold text-[10px] w-6 h-6 cursor-pointer hover:bg-red-50">
                        <input type="radio" name="smallOpacitiesProfusion" value={cat} onChange={handleInputChange} className="hidden peer" />
                        <span className="peer-checked:bg-red-600 peer-checked:text-white w-full h-full flex items-center justify-center">{cat}</span>
                      </label>
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-500 italic">Mark profusion category</span>
                </div>
              </div>
            </div>
            
            {/* Large Opacities */}
            <div className="flex p-2 items-center justify-between bg-gray-50">
              <h3 className="font-bold">Large opacities</h3>
              <div className="flex flex-col items-end space-y-1">
                <div className="flex space-x-1">
                  {['0', 'A', 'B', 'C'].map(size => (
                    <label key={size} className="flex items-center justify-center border border-red-400 text-red-700 font-bold text-[10px] w-6 h-6 cursor-pointer hover:bg-red-50">
                      <input type="radio" name="largeOpacities" value={size} onChange={handleInputChange} className="hidden peer" />
                      <span className="peer-checked:bg-red-600 peer-checked:text-white w-full h-full flex items-center justify-center">{size}</span>
                    </label>
                  ))}
                </div>
                <span className="text-[9px] text-gray-500 italic">0 for none, or mark A, B, or C</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
