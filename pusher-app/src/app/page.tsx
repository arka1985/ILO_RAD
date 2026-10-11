"use client";

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Server, CheckCircle, AlertCircle, X, Send } from 'lucide-react';

export default function PusherPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [radiographDate, setRadiographDate] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(true);

  useEffect(() => {
      const accepted = sessionStorage.getItem('ilo_terms_accepted');
      if (!accepted) {
        setHasAcceptedTerms(false);
        setShowLicenseModal(true);
      }
    }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default to relative local API when mounted on client, specifically targeting port 3000 (Viewer)
  if (typeof window !== 'undefined' && targetUrl === '') {
    setTargetUrl(`${window.location.protocol}//${window.location.hostname}:3000/api/dicom-receiver`);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const clearFile = () => {
    setFile(null);
    setStatus('idle');
    setMessage('');
    setPatientName('');
    setPatientId('');
    setRadiographDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isTrainingFormat = file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg') || file.name.toLowerCase().endsWith('.png'));

  const handlePush = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('Pushing DICOM file to interpreter...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientName', patientName);
    formData.append('patientId', patientId);
    formData.append('radiographDate', radiographDate);

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatus('success');
        setMessage('File successfully pushed to the Interpreter Viewer!');
      } else {
        throw new Error('Server rejected the file.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to connect to the target URL.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-300 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-[#0f172a] border-b border-orange-800 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3 text-white">
          <UploadCloud className="text-emerald-500" size={24} />
          <h1 className="font-bold text-xl tracking-wider">PulmoView: DICOM Push Utility</h1>
        </div>
        <div className="text-xs text-gray-500">
          Source X-Ray Sender
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#0f172a] border border-orange-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <div className="p-6 border-b border-orange-800 bg-[#1e293b]/50">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center space-x-2">
              <Server size={14} />
              <span>Target Interpreter URL</span>
            </label>
            <input 
              type="text" 
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              className="w-full bg-[#020617] border border-orange-500 text-white px-4 py-3 rounded-lg outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
              placeholder="http://192.168.x.x:3000/api/dicom-receiver"
            />
            <div className="mt-3 bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg text-xs text-gray-300 leading-relaxed">
                <strong className="text-blue-400 block mb-1">How to connect over the network:</strong>
                Replace <code className="bg-black px-1 py-0.5 rounded text-orange-400 font-mono">localhost</code> in the URL above with the actual IPv4 address of the Doctor's/Interpreter's computer (e.g., <code className="bg-black px-1 py-0.5 rounded text-orange-400 font-mono">192.168.1.5</code> or looks something similar).<br/><br/>
                <strong className="text-orange-400 block mb-1">How to find the Doctor's IP address:</strong>
                1. Go to the <strong>Doctor's computer</strong> (where the Viewer is running).<br/>
                2. <strong>Windows:</strong> Press <code className="bg-black px-1 py-0.5 rounded font-mono text-white">Win + R</code>, type <code className="bg-black px-1 py-0.5 rounded font-mono text-white">cmd</code>, and press Enter. Then type <code className="bg-black px-1 py-0.5 rounded font-mono text-white">ipconfig</code> and press Enter.<br/>
                3. <strong>Mac/Linux:</strong> Open Terminal, type <code className="bg-black px-1 py-0.5 rounded font-mono text-white">ifconfig</code> or <code className="bg-black px-1 py-0.5 rounded font-mono text-white">ip a</code> and press Enter.<br/>
                4. Look for the line that says <strong>IPv4 Address</strong> (e.g., 192.168.X.X or looks something similar) and type that number here instead of localhost.
              </div>
          </div>

          {/* Metadata Section */}
          <div className="p-6 border-b border-orange-800 bg-[#1e293b]/20">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Patient/Worker/Employee's Name</label>
                <input 
                  type="text" 
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full bg-[#020617] border border-orange-500 text-white px-3 py-2 rounded outline-none focus:border-emerald-500 transition-colors text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Patient/Worker/Employee ID</label>
                <input 
                  type="text" 
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  className="w-full bg-[#020617] border border-orange-500 text-white px-3 py-2 rounded outline-none focus:border-emerald-500 transition-colors text-sm"
                  placeholder="e.g. P-12345"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Radiograph</label>
                <input 
                  type="date" 
                  value={radiographDate}
                  onChange={e => setRadiographDate(e.target.value)}
                  className="w-full bg-[#020617] border border-orange-500 text-white px-3 py-2 rounded outline-none focus:border-emerald-500 transition-colors text-sm uppercase"
                />
              </div>
            </div>
          </div>

          <div className="p-8">
            {!file ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-orange-500 hover:border-emerald-500 hover:bg-[#1e293b]/30 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="bg-[#1e293b] group-hover:bg-emerald-900/30 p-4 rounded-full mb-4 transition-colors">
                  <UploadCloud size={32} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Select Radiograph File</h3>
                <p className="text-gray-500 text-sm text-center mb-2">Drag and drop a .dcm file here, or click to browse your computer.</p>
                <p className="text-gray-600 text-xs text-center border-t border-orange-700 pt-2 w-full">(JPEG/PNG files are also supported for training purposes)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".dcm,application/dicom,image/jpeg,image/png" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#1e293b] border border-orange-700 rounded-xl p-6 relative">
                  <button 
                    onClick={clearFile} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-[#0f172a] rounded-full p-1 border border-orange-700"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center space-x-4">
                    <div className="bg-emerald-900/30 p-3 rounded-lg">
                      <CheckCircle size={24} className="text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg line-clamp-1 pr-8">{file.name}</h4>
                      <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>

                {isTrainingFormat && (
                  <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-xl flex items-start space-x-3 text-yellow-500 animate-in fade-in zoom-in duration-300">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Training Mode Only</h4>
                      <p className="text-xs text-yellow-500/80">You have selected a non-DICOM format ({file.name.split('.').pop()?.toUpperCase()}). This format should only be used for training purposes, as it may lack essential medical metadata and dynamic range.</p>
                    </div>
                  </div>
                )}

                {status === 'idle' && (
                  <button 
                    onClick={handlePush}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-orange-900/20"
                  >
                    <Send size={18} />
                    <span>Push to Interpreter</span>
                  </button>
                )}

                {status === 'uploading' && (
                  <div className="w-full bg-[#1e293b] border border-orange-700 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400 animate-pulse">
                      <UploadCloud size={18} />
                      <span>{message}</span>
                    </div>
                    <div className="w-64 h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full animate-[progress_1.5s_ease-in-out_infinite] origin-left"></div>
                    </div>
                  </div>
                )}

                {status === 'success' && (
                  <div className="w-full bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 font-bold py-4 rounded-xl flex items-center justify-center space-x-2">
                    <CheckCircle size={18} />
                    <span>{message}</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="w-full bg-red-900/20 border border-red-500/30 text-red-400 font-bold py-4 rounded-xl flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={18} />
                      <span>Push Failed</span>
                    </div>
                    <p className="text-sm font-normal text-red-300/80">{message}</p>
                  </div>
                )}
                
                {(status === 'success' || status === 'error') && (
                  <button 
                    onClick={clearFile}
                    className="w-full mt-4 bg-[#1e293b] hover:bg-[#334155] text-white font-bold py-3 rounded-xl transition-colors border border-orange-500"
                  >
                    Send Another File
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      
      {/* License Modal */}
      
            {/* Standard Footer */}
            <div className="bg-[#1e293b] border-t border-orange-700 p-4 mt-6 relative z-[50]">
              <div className="flex flex-col items-center justify-center text-xs text-gray-500 font-bold border-t border-orange-700 pt-3 space-y-2 text-center">
                <span>PulmoView (v2.0.0)</span>
                <span className="text-center my-2 md:my-0 text-gray-400">
                  Designed and Developed by <span className="text-orange-400">Dr. Arkaprabha Sau</span><br/>
                  <span className="text-[10px] font-normal">MBBS, MD (Gold Medalist), DPH, Dip. Geriatric Medicine, CCEBDM</span><br/>
                  <span className="text-[10px] font-normal">Ph.D. (Computer Science and Engineering: AI & ML in Healthcare)</span><br/>
                  <span className="text-[10px] font-normal text-blue-400">arka.doctor@gmail.com</span>
                </span>
                <span>CC BY 4.0 Attribution</span>
              </div>
            </div>
      {showLicenseModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-orange-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-orange-700 bg-[#1e293b]">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>PulmoView Legal Agreements</span>
              </h2>
              {hasAcceptedTerms && (
                <button onClick={() => setShowLicenseModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              )}
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-[#1e293b] p-4 rounded-lg border border-orange-700">
                <h3 className="text-lg font-bold text-white border-b border-orange-700 pb-2">Software Purpose & Important Acknowledgments</h3>
                <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                  This is not an AI-based tool. It is a digital tool designed to facilitate the filling of the latest ILO International Classification of Radiographs of Pneumoconioses forms. Interpretation and classification MUST be solely performed by a Medical Officer / Qualified Medical Practitioner who is appropriately trained at an ILO-recognized institute.
                </p>
                <p className="text-emerald-400 font-bold mt-3 text-sm">
                  This software is provided absolutely FREE OF COST. No paid subscription or purchase is required.
                </p>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-xl border border-orange-700">
                <h3 className="text-lg font-bold text-white border-b border-orange-700 pb-2">Privacy and Confidentiality Disclaimer & Terms of Use</h3>
                <ul className="list-disc pl-5 mt-2 text-sm text-gray-300 space-y-2">
                  <li>This software suite operates <strong>100% locally</strong> on your machine.</li>
                  <li>NO patient data, DICOM files, or reports are sent to any external server, cloud, or developer.</li>
                  <li>We do NOT collect telemetry, usage data, or crash logs.</li>
                  <li>You are responsible for ensuring compliance with the <strong>DPDP Act, HIPAA, GDPR</strong>, and local healthcare regulations regarding the security of the machine you are running this software on.</li>
                </ul>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-xl border border-orange-700">
                <h3 className="text-lg font-bold text-white border-b border-orange-700 pb-2">PULMOVIEW — Free Use and Attribution License</h3>
                <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                  Copyright © 2026 <strong>Dr. Arkaprabha Sau</strong>. PULMOVIEW is provided free of charge for academic, educational, research, institutional, professional, and other lawful purposes. Users are permitted to use, copy, distribute, modify, and adapt the software, provided that the original copyright notice and this license are retained and appropriate acknowledgement is given to the developer.
                </p>
                <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                  Any publication, research article, thesis, dissertation, presentation, report, website, software, or other work that uses or incorporates PULMOVIEW or a substantial portion of its code, algorithms, functionality, or outputs must acknowledge:<br/><br/>
                  <span className="text-orange-400 font-bold block mb-1">Designed and Developed by Dr. Arkaprabha Sau</span>
                  MBBS, MD (Gold Medalist), DPH, Dip. Geriatric Medicine, CCEBDM<br/>
                  Ph.D. (Computer Science and Engineering: AI & ML in Healthcare)
                </p>
                <p className="text-gray-300 mt-2 text-sm">
                  For any suggestion, query, help, bug or any issue, report to: <a href="mailto:arka.doctor@gmail.com" className="text-blue-400 hover:underline">arka.doctor@gmail.com</a>
                </p>
                <p className="text-gray-300 mt-2 text-sm">
                  Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">CC BY 4.0 Attribution</a>.
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-orange-700 bg-[#1e293b] flex justify-end">
              {!hasAcceptedTerms ? (
                <button 
                  className="bg-red-600 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-300 text-lg shadow-lg"
                  onClick={() => {
                    sessionStorage.setItem('ilo_terms_accepted', 'true');
                    setHasAcceptedTerms(true);
                    setShowLicenseModal(false);
                  }}
                >
                  I Have Read and Accept These Terms
                </button>
              ) : (
                <button onClick={() => setShowLicenseModal(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-xl transition-colors font-bold">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
  
    </main>

      {/* Global CSS for the indeterminate progress bar animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: scaleX(0); transform-origin: left; }
          50% { transform: scaleX(1); transform-origin: left; }
          50.1% { transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}} />
    </div>
  );
}
