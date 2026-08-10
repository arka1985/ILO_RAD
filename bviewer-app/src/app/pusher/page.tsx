"use client";

import { useState, useRef } from 'react';
import { UploadCloud, Server, CheckCircle, AlertCircle, X, Send } from 'lucide-react';

export default function PusherPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default to relative local API when mounted on client
  if (typeof window !== 'undefined' && targetUrl === '') {
    setTargetUrl(`${window.location.protocol}//${window.location.host}/api/dicom-receiver`);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePush = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('Pushing DICOM file to interpreter...');

    const formData = new FormData();
    formData.append('file', file);

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
      <header className="bg-[#0f172a] border-b border-[#1e293b] p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3 text-white">
          <UploadCloud className="text-orange-500" size={24} />
          <h1 className="font-bold text-xl tracking-wider">DICOM Push Utility</h1>
        </div>
        <div className="text-xs text-gray-500">
          Source X-Ray Sender
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#0f172a] border border-[#334155] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <div className="p-6 border-b border-[#1e293b] bg-[#1e293b]/50">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center space-x-2">
              <Server size={14} />
              <span>Target Interpreter URL</span>
            </label>
            <input 
              type="text" 
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              className="w-full bg-[#020617] border border-[#475569] text-white px-4 py-3 rounded-lg outline-none focus:border-orange-500 transition-colors font-mono text-sm"
              placeholder="http://192.168.x.x:3000/api/dicom-receiver"
            />
            <p className="text-xs text-gray-500 mt-2">
              This is the IP address of the Interpreter's computer. It defaults to the local server.
            </p>
          </div>

          <div className="p-8">
            {!file ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#475569] hover:border-orange-500 hover:bg-[#1e293b]/30 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="bg-[#1e293b] group-hover:bg-orange-900/30 p-4 rounded-full mb-4 transition-colors">
                  <UploadCloud size={32} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Select DICOM File</h3>
                <p className="text-gray-500 text-sm text-center">Drag and drop a .dcm file here, or click to browse your computer.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".dcm,application/dicom" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 relative">
                  <button 
                    onClick={clearFile} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-[#0f172a] rounded-full p-1 border border-[#334155]"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-900/30 p-3 rounded-lg">
                      <CheckCircle size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg line-clamp-1 pr-8">{file.name}</h4>
                      <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>

                {status === 'idle' && (
                  <button 
                    onClick={handlePush}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-orange-900/20"
                  >
                    <Send size={18} />
                    <span>Push to Interpreter</span>
                  </button>
                )}

                {status === 'uploading' && (
                  <div className="w-full bg-[#1e293b] border border-[#334155] text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center space-y-3">
                    <div className="flex items-center space-x-2 text-orange-400 animate-pulse">
                      <UploadCloud size={18} />
                      <span>{message}</span>
                    </div>
                    <div className="w-64 h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-full animate-[progress_1.5s_ease-in-out_infinite] origin-left"></div>
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
                    className="w-full mt-4 bg-[#1e293b] hover:bg-[#334155] text-white font-bold py-3 rounded-xl transition-colors border border-[#475569]"
                  >
                    Send Another File
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
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
