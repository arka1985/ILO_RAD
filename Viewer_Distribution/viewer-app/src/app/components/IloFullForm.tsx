"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';

export default function IloFullForm() {
  const [formData, setFormData] = useState({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      let newFormData = { ...formData, [name]: value };
      
      // If quality is set to 1, clear all quality issues
      if (name === 'imageQualityGrade' && value === '1') {
        const issues = ['Overexposed (dark)', 'Underexposed (light)', 'Artifacts', 'Improper position', 'Poor contrast', 'Poor processing', 'Underinflation', 'Mottle', 'Excessive Edge Enhancement', 'Scapula Overlay', 'Other'];
        issues.forEach(issue => {
          delete (newFormData as any)[`quality_${issue}`];
        });
        delete (newFormData as any)['quality_OtherText'];
      }
      
      setFormData(newFormData);
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ilo_full_classification.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-300 p-2 text-xs font-sans text-gray-900 leading-tight">
      <div className="max-w-4xl mx-auto bg-white border border-gray-400 shadow-sm">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 text-white p-2">
          <h1 className="text-sm font-bold tracking-wider">CHEST RADIOGRAPH CLASSIFICATION FORM</h1>
          <button onClick={exportToJson} className="flex items-center space-x-1 hover:text-blue-200" title="Export Data">
            <Download size={14} /> <span>Export JSON</span>
          </button>
        </div>

        {/* Top Demographics Row */}
        <div className="flex border-b border-gray-400">
          <div className="flex-1 flex border-r border-gray-400">
            <label className="w-24 bg-gray-100 p-1 border-r border-gray-400 font-bold flex items-center">Patient's Name</label>
            <input type="text" name="patientName" onChange={handleInputChange} className="flex-1 p-1 outline-none focus:bg-yellow-50" />
          </div>
          <div className="flex-1 flex">
            <label className="w-24 bg-gray-100 p-1 border-r border-gray-400 font-bold flex items-center">Patient ID</label>
            <input type="text" name="patientId" onChange={handleInputChange} className="flex-1 p-1 outline-none focus:bg-yellow-50" />
          </div>
        </div>
        <div className="flex border-b border-gray-400">
          <div className="flex-1 flex border-r border-gray-400">
            <label className="w-24 bg-gray-100 p-1 border-r border-gray-400 font-bold flex items-center">Birth Date</label>
            <input type="date" name="birthDate" onChange={handleInputChange} className="flex-1 p-1 outline-none focus:bg-yellow-50 uppercase" />
          </div>
          <div className="flex-1 flex">
            <label className="w-24 bg-gray-100 p-1 border-r border-gray-400 font-bold flex items-center">Radiograph Date</label>
            <input type="date" name="radiographDate" onChange={handleInputChange} className="flex-1 p-1 outline-none focus:bg-yellow-50 uppercase" />
          </div>
        </div>

        {/* 1. Image Quality */}
        <div className="border-b border-gray-400">
          <div className="bg-gray-200 p-1 border-b border-gray-400 font-bold">1. IMAGE QUALITY</div>
          <div className="flex p-2 items-start">
            <div className="flex flex-col items-center mr-6 border-r border-gray-300 pr-4">
              <div className="flex space-x-2 mb-1">
                {[1,2,3,4].map(g => (
                  <label key={g} className="flex flex-col items-center cursor-pointer">
                    <input type="radio" name="imageQualityGrade" value={g} onChange={handleInputChange} className="w-4 h-4 mb-1" />
                    <span className="font-bold">{g}</span>
                  </label>
                ))}
              </div>
              <span className="text-[10px] text-gray-500 max-w-[120px] text-center">(If not grade 1, mark all boxes that apply)</span>
            </div>
            
            <div className="flex-1 grid grid-cols-4 gap-1 text-[11px]">
              {['Overexposed (dark)', 'Underexposed (light)', 'Artifacts', 'Improper position', 'Poor contrast', 'Poor processing', 'Underinflation', 'Mottle', 'Excessive Edge Enhancement', 'Scapula Overlay'].map(issue => (
                <label key={issue} className="flex items-center space-x-1 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input type="checkbox" name={`quality_${issue}`} onChange={handleInputChange} checked={!!(formData as any)[`quality_${issue}`]} />
                  <span>{issue}</span>
                </label>
              ))}
              <div className="col-span-2 flex items-center p-1">
                <label className="flex items-center space-x-1 w-full">
                  <input type="checkbox" name="quality_Other" onChange={handleInputChange} checked={!!(formData as any)['quality_Other']} />
                  <span>Other:</span>
                  <input type="text" name="quality_OtherText" onChange={handleInputChange} value={(formData as any)['quality_OtherText'] || ''} className="flex-1 border-b border-gray-400 outline-none px-1 focus:bg-yellow-50" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2A */}
        <div className="flex items-center bg-gray-200 p-1 border-b border-gray-400">
          <div className="font-bold flex-1">2A. ANY CLASSIFIABLE PARENCHYMAL ABNORMALITIES?</div>
          <div className="flex space-x-4 items-center bg-white border border-gray-400 px-2 rounded">
            <label className="flex items-center space-x-1 cursor-pointer font-bold">
              <span>Yes</span>
              <input type="radio" name="parenchymalAbnormalities" value="yes" onChange={handleInputChange} />
            </label>
            <span className="text-gray-400">|</span>
            <label className="flex items-center space-x-1 cursor-pointer font-bold">
              <span>No</span>
              <input type="radio" name="parenchymalAbnormalities" value="no" onChange={handleInputChange} />
            </label>
          </div>
        </div>

        {/* 2B & 2C Grid */}
        <div className="flex border-b border-gray-400">
          {/* 2B */}
          <div className="w-[60%] border-r border-gray-400 flex flex-col">
            <div className="bg-gray-100 p-1 border-b border-gray-400 font-bold">2B. SMALL OPACITIES</div>
            <div className="flex-1 flex">
              <div className="flex-1 border-r border-gray-300 p-2">
                <div className="text-center font-bold mb-2">a. SHAPE/SIZE</div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-[10px] text-gray-500 mb-1">PRIMARY</div>
                    <div className="grid grid-cols-2 gap-1 w-16 mx-auto">
                      {['p','q','r','s','t','u'].map(s => (
                        <label key={`prim_${s}`} className="border border-red-300 rounded-sm text-red-700 font-bold text-[10px] w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-red-50">
                          <input type="radio" name="smallShapePrim" value={s} onChange={handleInputChange} className="hidden" />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-gray-500 mb-1">SECONDARY</div>
                    <div className="grid grid-cols-2 gap-1 w-16 mx-auto">
                      {['p','q','r','s','t','u'].map(s => (
                        <label key={`sec_${s}`} className="border border-red-300 rounded-sm text-red-700 font-bold text-[10px] w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-red-50">
                          <input type="radio" name="smallShapeSec" value={s} onChange={handleInputChange} className="hidden" />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-24 border-r border-gray-300 p-2 flex flex-col items-center">
                <div className="text-center font-bold mb-2">b. ZONES</div>
                <div className="flex w-full text-center text-[10px] text-gray-500 font-bold mb-1">
                  <div className="flex-1">R</div>
                  <div className="flex-1">L</div>
                </div>
                <div className="flex w-full mb-1 items-center">
                  <div className="w-10 text-[10px] text-right pr-1">UPPER</div>
                  <input type="checkbox" name="zone_R_U" className="w-4 h-4 mx-1" onChange={handleInputChange}/>
                  <input type="checkbox" name="zone_L_U" className="w-4 h-4 mx-1" onChange={handleInputChange}/>
                </div>
                <div className="flex w-full mb-1 items-center">
                  <div className="w-10 text-[10px] text-right pr-1">MIDDLE</div>
                  <input type="checkbox" name="zone_R_M" className="w-4 h-4 mx-1" onChange={handleInputChange}/>
                  <input type="checkbox" name="zone_L_M" className="w-4 h-4 mx-1" onChange={handleInputChange}/>
                </div>
                <div className="flex w-full items-center">
                  <div className="w-10 text-[10px] text-right pr-1">LOWER</div>
                  <input type="checkbox" name="zone_R_L" className="w-4 h-4 mx-1" onChange={handleInputChange}/>
                  <input type="checkbox" name="zone_L_L" className="w-4 h-4 mx-1" onChange={handleInputChange}/>
                </div>
              </div>

              <div className="flex-1 p-2 flex flex-col items-center">
                <div className="text-center font-bold mb-2">c. PROFUSION</div>
                <div className="grid grid-cols-3 gap-1">
                  {['0/-','0/0','0/1','1/0','1/1','1/2','2/1','2/2','2/3','3/2','3/3','3/+'].map(p => (
                    <label key={`prof_${p}`} className="border border-red-300 text-red-700 font-bold text-[10px] px-1 py-[2px] text-center cursor-pointer hover:bg-red-50">
                      <input type="radio" name="profusion" value={p} onChange={handleInputChange} className="hidden peer" />
                      <span className="peer-checked:bg-red-600 peer-checked:text-white block w-full h-full">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* 2C */}
          <div className="w-[40%] flex flex-col">
            <div className="bg-gray-100 p-1 border-b border-gray-400 font-bold">2C. LARGE OPACITIES</div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold mr-2">SIZE</span>
                {['O', 'A', 'B', 'C'].map(size => (
                  <label key={`large_${size}`} className="border border-red-400 text-red-700 font-bold w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-red-50">
                    <input type="radio" name="largeOpacitiesSize" value={size} onChange={handleInputChange} className="hidden peer" />
                    <span className="peer-checked:bg-red-600 peer-checked:text-white w-full h-full flex items-center justify-center">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Remaining Sections (3A, 3B, etc.) Placeholder for brevity in overhaul */}
        <div className="bg-gray-200 p-1 border-b border-gray-400 font-bold flex justify-between">
          <span>3A. ANY CLASSIFIABLE PLEURAL ABNORMALITIES?</span>
          <div className="flex space-x-2 bg-white px-2 rounded border border-gray-400">
            <label className="flex items-center space-x-1"><input type="radio" name="pleural" value="yes"/><span>Yes</span></label>
            <label className="flex items-center space-x-1"><input type="radio" name="pleural" value="no"/><span>No</span></label>
          </div>
        </div>
        
        {/* Dense footer symbols */}
        <div className="bg-gray-100 p-1 border-b border-gray-400 font-bold">4B. OTHER SYMBOLS (OBLIGATORY)</div>
        <div className="p-2 flex flex-wrap gap-1 border-b border-gray-400 bg-white">
          {['aa','at','ax','bu','ca','cg','cn','co','cp','cv','di','ef','em','es','fr','hi','ho','id','ih','kl','me','pa','pb','pi','px','ra','rp','tb','OD'].map(sym => (
            <label key={sym} className="border border-red-300 text-red-700 font-bold text-[10px] w-6 h-5 flex items-center justify-center cursor-pointer hover:bg-red-50">
              <input type="checkbox" name={`symbol_${sym}`} onChange={handleInputChange} className="hidden peer" />
              <span className="peer-checked:bg-red-600 peer-checked:text-white w-full h-full flex items-center justify-center">{sym}</span>
            </label>
          ))}
          <div className="w-full mt-1 text-[10px] font-bold">If OD or other diseases, findings must be recorded.</div>
        </div>

      </div>
    </div>
  );
}
