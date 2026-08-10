"use client";

import { useEffect, useState } from 'react';
import DicomViewer from '../components/DicomViewer';
import { Database, MonitorPlay, Upload, X, Search, Settings, Server, ShieldCheck, Wifi, Globe, Play, Download } from 'lucide-react';

export default function PatientViewerPage() {
  const [standardUrl, setStandardUrl] = useState<string | undefined>('/standards/00_Normal_1.dcm');
  const [standardLabel, setStandardLabel] = useState<string>('0/0 (Normal)');
  const [patientFile, setPatientFile] = useState<File | null>(null);
  const [patientUrl, setPatientUrl] = useState<string | undefined>(undefined);
  
  // Incoming Push State
  const [incomingImage, setIncomingImage] = useState<any>(null);

  const isImageFormat = (url?: string, file?: File | null) => {
    if (file) {
      if (file.type && file.type.startsWith('image/') && !file.type.includes('dicom')) return true;
      if (file.name && file.name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) return true;
      return false;
    }
    if (url) {
      if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) return true;
    }
    return false;
  };

  // PACS Modal State
  const [showPacsModal, setShowPacsModal] = useState(false);
  const [pacsTab, setPacsTab] = useState<'search' | 'setup'>('search');
  const [pacsUrl, setPacsUrl] = useState('http://192.168.1.100:8042/dicom-web');
  const [pacsUser, setPacsUser] = useState('');
  const [pacsPass, setPacsPass] = useState('');
  
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    // Listen for messages from the Main Control Panel
    const channel = new BroadcastChannel('bviewer-sync');
    
    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'LOAD_STANDARD') {
        setStandardUrl(event.data.url);
        setStandardLabel(event.data.label || 'Selected Standard');
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Polling for incoming pushed images
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/dicom-check?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'pending' && data.filename) {
            setIncomingImage(data);
          } else {
            setIncomingImage(null);
          }
        }
      } catch (err) {
        console.error('Failed to poll DICOM pushes');
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  const acceptIncomingImage = async () => {
    if (incomingImage) {
      setPatientUrl(incomingImage.url);
      setPatientFile(null); // Clear file if loading from URL
      
      const channel = new BroadcastChannel('bviewer-sync');
      channel.postMessage({
        type: 'PUSH_ACCEPTED',
        patientName: incomingImage.patientName || '',
        patientId: incomingImage.patientId || '',
        radiographDate: incomingImage.radiographDate || '',
        isNonDicom: isImageFormat(incomingImage.url, null)
      });
      channel.close();
      
      // Clear the alert on the server
      try {
        await fetch('/api/dicom-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear' })
        });
        setIncomingImage(null);
      } catch (e) {
        console.error('Failed to clear alert');
      }
    }
  };

  const dismissIncomingImage = async () => {
    try {
      await fetch('/api/dicom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      setIncomingImage(null);
    } catch (e) {
      console.error('Failed to clear alert');
    }
  };

  const handlePacsConnect = () => {
    setShowPacsModal(true);
  };

  const handlePacsSearch = () => {
    setIsSearching(true);
    // Mocking a DICOMweb QIDO-RS search delay
    setTimeout(() => {
      setSearchResults([
        { patientName: 'John Doe', patientId: 'PT-12345', studyDate: '2023-10-15', modality: 'CR', instances: 2 },
        { patientName: 'Jane Smith', patientId: 'PT-98765', studyDate: '2023-11-02', modality: 'DX', instances: 1 },
      ]);
      setIsSearching(false);
    }, 1500);
  };

  const handleLoadMockImage = () => {
    alert("In a full implementation, this would use WADO-RS to download the selected DICOM instance and render it in the right-side viewer.");
    setShowPacsModal(false);
  };

  const handlePatientUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPatientFile(file);
      setPatientUrl(undefined);
      
      const channel = new BroadcastChannel('bviewer-sync');
      channel.postMessage({
        type: 'LOCAL_IMAGE_UPLOADED',
        isNonDicom: isImageFormat(undefined, file)
      });
      channel.close();
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black flex flex-col text-gray-300 font-sans">
      
      {/* Global Header */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] p-2 flex justify-between items-center text-xs shadow-md z-20">
        <div className="flex items-center space-x-2 text-white font-bold tracking-widest">
          <MonitorPlay size={16} className="text-blue-400" />
          <span>DICOM Viewer of Standard and Patient X Ray</span>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1 cursor-pointer bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors text-white">
            <Upload size={14} />
            <span>Upload Patient X-Ray</span>
            <input type="file" accept=".dcm,application/dicom" className="hidden" onChange={handlePatientUpload} />
          </label>
          <button 
            onClick={handlePacsConnect}
            className="flex items-center space-x-1 bg-[#1e293b] hover:bg-[#334155] border border-[#475569] px-3 py-1 rounded transition-colors"
          >
            <Database size={14} className="text-emerald-400" />
            <span>Connect to PACS</span>
          </button>
        </div>
      </div>
      {/* Floating Incoming Image Notification */}
      {incomingImage && (
        <div className="absolute top-16 right-4 z-50 bg-blue-900 border border-blue-400 text-white p-4 rounded-lg shadow-2xl animate-in slide-in-from-right-8 duration-500 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="mt-1 bg-blue-500 rounded-full p-1.5 animate-pulse">
              <Download size={16} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1 shadow-black drop-shadow-md">New Image Arrived!</h4>
              <p className="text-blue-100 text-sm mt-1">A file ({incomingImage.filename}) was just pushed to this viewer from another computer.</p>
              <div className="flex space-x-2 mt-3">
                <button onClick={acceptIncomingImage} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded transition-colors text-sm shadow-lg shadow-black/50 border border-emerald-300">
                  Accept & View
                </button>
                <button onClick={dismissIncomingImage} className="bg-blue-800 hover:bg-blue-700 text-blue-200 px-4 py-2 rounded transition-colors text-sm border border-blue-600">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dual Viewer Container */}
      <div className="flex-1 flex w-full h-full relative">
        
        {/* Left Half: ILO Standard */}
        <div className="w-1/2 h-full border-r border-[#1e293b] flex flex-col bg-black">
          <div className="bg-[#020617] text-blue-400 p-2 text-center text-xs font-bold tracking-wider uppercase border-b border-[#1e293b]">
            Standard Radiograph: {standardLabel}
          </div>
          <div className="flex-1 relative">
            <DicomViewer initialUrl={standardUrl} hideToolbar={true} />
          </div>
        </div>

        {/* Right Half: Patient Image */}
        <div className="w-1/2 h-full flex flex-col bg-black">
          <div className="bg-[#020617] text-emerald-400 p-2 text-center text-xs font-bold tracking-wider uppercase border-b border-[#1e293b]">
            Patient Radiograph
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            {isImageFormat(patientUrl, patientFile) ? (
              <img 
                src={patientUrl || (patientFile ? URL.createObjectURL(patientFile) : '')} 
                alt="Patient Radiograph" 
                className="max-w-full max-h-full object-contain" 
              />
            ) : (
              <DicomViewer key={patientUrl || patientFile?.name || 'empty_patient'} patientFile={patientFile} initialUrl={patientUrl} hideToolbar={true} />
            )}
          </div>
        </div>

      </div>

      {/* PACS Modal */}
      {showPacsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-[#334155] rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#1e293b] rounded-t-lg">
              <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                <Database size={20} className="text-emerald-400" />
                <span>PACS Connection Module</span>
              </h3>
              <button onClick={() => setShowPacsModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#334155] bg-[#020617]">
              <button 
                onClick={() => setPacsTab('search')}
                className={`flex-1 py-3 font-bold transition-colors flex items-center justify-center space-x-2 ${pacsTab === 'search' ? 'bg-[#1e293b] text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Search size={18} />
                <span>Query / Retrieve</span>
              </button>
              <button 
                onClick={() => setPacsTab('setup')}
                className={`flex-1 py-3 font-bold transition-colors flex items-center justify-center space-x-2 ${pacsTab === 'setup' ? 'bg-[#1e293b] text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Settings size={18} />
                <span>Network Setup & Instructions</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 text-sm">
              
              {/* TAB 1: SEARCH */}
              {pacsTab === 'search' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target PACS URL</label>
                      <input type="text" value={pacsUrl} readOnly className="w-full bg-[#1e293b] border border-[#334155] text-gray-500 px-3 py-2 rounded outline-none cursor-not-allowed" />
                    </div>
                  </div>
                  
                  <div className="bg-[#1e293b] border border-[#334155] p-4 rounded-lg flex space-x-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Patient Name</label>
                      <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-[#020617] border border-[#475569] text-white px-3 py-2 rounded outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Patient ID</label>
                      <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="e.g. PT-12345" className="w-full bg-[#020617] border border-[#475569] text-white px-3 py-2 rounded outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <button onClick={handlePacsSearch} disabled={isSearching} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded font-bold transition-colors h-[38px] flex items-center justify-center min-w-[120px]">
                      {isSearching ? <span className="animate-pulse">Searching...</span> : 'Search'}
                    </button>
                  </div>

                  <div className="border border-[#334155] rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#1e293b] border-b border-[#334155]">
                          <th className="p-3 font-bold text-gray-400 uppercase text-xs">Patient Name</th>
                          <th className="p-3 font-bold text-gray-400 uppercase text-xs">Patient ID</th>
                          <th className="p-3 font-bold text-gray-400 uppercase text-xs">Study Date</th>
                          <th className="p-3 font-bold text-gray-400 uppercase text-xs">Modality</th>
                          <th className="p-3 font-bold text-gray-400 uppercase text-xs text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                              {isSearching ? 'Querying PACS server...' : 'Enter search criteria to query DICOMweb server.'}
                            </td>
                          </tr>
                        ) : (
                          searchResults.map((res, i) => (
                            <tr key={i} className="border-b border-[#334155] hover:bg-[#1e293b] transition-colors">
                              <td className="p-3 text-white font-bold">{res.patientName}</td>
                              <td className="p-3 text-gray-300">{res.patientId}</td>
                              <td className="p-3 text-gray-300">{res.studyDate}</td>
                              <td className="p-3 text-gray-300">{res.modality}</td>
                              <td className="p-3 text-right">
                                <button onClick={handleLoadMockImage} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center space-x-1">
                                  <Download size={14} />
                                  <span>Load Image</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: SETUP */}
              {pacsTab === 'setup' && (
                <div className="space-y-8">
                  {/* CONFIG FORM */}
                  <div className="bg-[#1e293b] border border-[#334155] p-6 rounded-lg space-y-4">
                    <h4 className="text-white font-bold text-base flex items-center space-x-2 border-b border-[#334155] pb-2">
                      <Server size={18} className="text-emerald-400" />
                      <span>PACS Configuration (Orthanc / DICOMweb)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">DICOMweb URL Endpoint *</label>
                        <input type="text" value={pacsUrl} onChange={e => setPacsUrl(e.target.value)} placeholder="http://192.168.x.x:8042/dicom-web" className="w-full bg-[#020617] border border-[#475569] text-white px-3 py-2 rounded outline-none focus:border-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Username (Optional)</label>
                        <input type="text" value={pacsUser} onChange={e => setPacsUser(e.target.value)} className="w-full bg-[#020617] border border-[#475569] text-white px-3 py-2 rounded outline-none focus:border-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Password (Optional)</label>
                        <input type="password" value={pacsPass} onChange={e => setPacsPass(e.target.value)} className="w-full bg-[#020617] border border-[#475569] text-white px-3 py-2 rounded outline-none focus:border-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* INSTRUCTIONS */}
                  <div className="space-y-4">
                    <h4 className="text-white font-bold text-lg mb-2">Network Setup Guide</h4>
                    
                    {/* Scenario A */}
                    <div className="border border-[#334155] rounded-lg overflow-hidden">
                      <div className="bg-[#1e293b] p-3 border-b border-[#334155] flex items-center space-x-2">
                        <Wifi size={18} className="text-blue-400" />
                        <span className="font-bold text-white">Scenario A: Computers on the SAME Network (Local LAN)</span>
                      </div>
                      <div className="p-4 bg-[#020617] space-y-3 text-gray-300">
                        <p>If the Interpreter's computer and the Patient X-Ray source computer are in the same building on the same WiFi/Ethernet network:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>On the <strong>X-Ray Source Computer</strong>, open Command Prompt and type <code className="bg-[#1e293b] px-1 py-0.5 rounded text-blue-300">ipconfig</code> to find its IPv4 address (e.g. <code className="bg-[#1e293b] px-1 py-0.5 rounded text-blue-300">192.168.1.100</code>).</li>
                          <li>Ensure <strong>Orthanc</strong> is installed on the source computer and the DICOMweb plugin is enabled.</li>
                          <li>Open Orthanc's configuration file and set <code className="bg-[#1e293b] px-1 py-0.5 rounded text-blue-300">"CorsAllowedOrigins": ["*"]</code> to allow this browser app to fetch images.</li>
                          <li>Enter <code className="bg-[#1e293b] px-1 py-0.5 rounded text-blue-300">http://&lt;IPv4_ADDRESS&gt;:8042/dicom-web</code> in the Configuration box above.</li>
                        </ol>
                      </div>
                    </div>

                    {/* Scenario B */}
                    <div className="border border-[#334155] rounded-lg overflow-hidden mt-4">
                      <div className="bg-[#1e293b] p-3 border-b border-[#334155] flex items-center space-x-2">
                        <Globe size={18} className="text-purple-400" />
                        <span className="font-bold text-white">Scenario B: Computers on DIFFERENT Networks (via Tailscale)</span>
                      </div>
                      <div className="p-4 bg-[#020617] space-y-3 text-gray-300">
                        <p>If the Interpreter is remote (e.g., at home) and the X-Ray source computer is in the hospital, use <strong>Tailscale</strong> to create a secure, encrypted peer-to-peer VPN tunnel without opening firewall ports.</p>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Create a free account at <a href="https://tailscale.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">tailscale.com</a>.</li>
                          <li>Install the Tailscale client on <strong>both</strong> the X-Ray Source Computer and the Interpreter's Computer.</li>
                          <li>Log into both clients using the same Tailscale account. They are now securely connected on a virtual private network.</li>
                          <li>Open the Tailscale app on the <strong>X-Ray Source Computer</strong> and copy its assigned Tailscale IP address (it will start with <code className="bg-[#1e293b] px-1 py-0.5 rounded text-purple-300">100.x.x.x</code>).</li>
                          <li>Enter <code className="bg-[#1e293b] px-1 py-0.5 rounded text-purple-300">http://100.x.x.x:8042/dicom-web</code> in the Configuration box above.</li>
                        </ol>
                        <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded flex items-start space-x-2 text-purple-200">
                          <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                          <p className="text-xs"><strong>Security Note:</strong> Tailscale end-to-end encrypts the DICOM traffic. You do not need to set up HTTPS certificates for Orthanc when using Tailscale, as the tunnel itself provides the encryption.</p>
                        </div>
                      </div>
                    </div>

                    {/* Scenario C */}
                    <div className="border border-[#334155] rounded-lg overflow-hidden mt-4">
                      <div className="bg-[#1e293b] p-3 border-b border-[#334155] flex items-center space-x-2">
                        <Upload size={18} className="text-orange-400" />
                        <span className="font-bold text-white">Scenario C: Push Images Directly to Viewer</span>
                      </div>
                      <div className="p-4 bg-[#020617] space-y-3 text-gray-300">
                        <p>Instead of searching for images, the external computer can push a DICOM file directly to this screen, triggering a popup notification.</p>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Ensure this viewer is open on the Interpreter's computer.</li>
                          <li>Find the IP address of the Interpreter's computer (e.g. <code className="bg-[#1e293b] px-1 py-0.5 rounded text-orange-300">192.168.1.50</code>).</li>
                          <li>From the external computer, send a DICOM file via HTTP POST to the receiver endpoint:</li>
                        </ol>
                        <div className="bg-[#0f172a] p-3 rounded border border-[#334155] mt-2 font-mono text-xs text-orange-200 overflow-x-auto">
                          curl -X POST -F "file=@image.dcm" http://&lt;INTERPRETER_IP&gt;:3000/api/dicom-receiver
                        </div>
                        <p className="text-xs text-gray-500 mt-2">A popup will automatically appear here allowing you to load the pushed image instantly.</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
