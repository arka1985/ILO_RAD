"use client";

import { useEffect, useState } from 'react';
import DicomViewer from '../components/DicomViewer';
import { Database, MonitorPlay, Upload, X, Search, Settings, Server, ShieldCheck, Wifi, Globe, Play, Download, Info } from 'lucide-react';

export default function PatientViewerPage() {
  const [standardUrl, setStandardUrl] = useState<string | undefined>('/standards/00_Normal_1.dcm');
  const [standardLabel, setStandardLabel] = useState<string>('0/0 (Normal)');
  const [patientFile, setPatientFile] = useState<File | null>(null);
  const [patientUrl, setPatientUrl] = useState<string | undefined>(undefined);
  
  // Incoming Push State
  const [incomingImage, setIncomingImage] = useState<any>(null);

  // Help Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);

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
    // Track viewer open state
    localStorage.setItem('isDualViewerOpen', 'true');
    const handleUnload = () => {
      localStorage.setItem('isDualViewerOpen', 'false');
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('unload', handleUnload);

    // Listen for messages from the Main Control Panel
    const channel = new BroadcastChannel('bviewer-sync');
    
    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'LOAD_STANDARD') {
        setStandardUrl(event.data.url);
        setStandardLabel(event.data.label || 'Selected Standard');
      }
    };

    return () => {
      localStorage.setItem('isDualViewerOpen', 'false');
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('unload', handleUnload);
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

  const handlePacsSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    try {
      const queryParams = new URLSearchParams();
      if (searchName) queryParams.append('PatientName', searchName);
      if (searchId) queryParams.append('PatientID', searchId);
      
      const headers: HeadersInit = {
        'Accept': 'application/dicom+json'
      };
      if (pacsUser || pacsPass) {
        headers['Authorization'] = 'Basic ' + btoa(pacsUser + ':' + pacsPass);
      }

      const response = await fetch(`${pacsUrl.replace(/\/$/, '')}/instances?${queryParams.toString()}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`PACS returned ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const parsedResults = data.map((item: any) => {
        const getTag = (tag: string) => {
          if (item[tag] && item[tag].Value && item[tag].Value.length > 0) {
            const val = item[tag].Value[0];
            return val.Alphabetic || val;
          }
          return '';
        };

        return {
          patientName: getTag('00100010'),
          patientId: getTag('00100020'),
          studyDate: getTag('00080020'),
          modality: getTag('00080060'),
          studyUid: getTag('0020000D'),
          seriesUid: getTag('0020000E'),
          sopUid: getTag('00080018')
        };
      });

      setSearchResults(parsedResults);
    } catch (err: any) {
      alert("Error searching PACS: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadPacsImage = (res: any) => {
    const baseUrl = pacsUrl.replace('/dicom-web', '/wado').replace(/\/$/, '');
    const wadoUrl = `${baseUrl}?requestType=WADO&studyUID=${res.studyUid}&seriesUID=${res.seriesUid}&objectUID=${res.sopUid}&contentType=application/dicom`;
    
    setPatientUrl(wadoUrl);
    setShowPacsModal(false);
  };

  const handlePatientUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPatientFile(file);
      setPatientUrl(undefined); // Clear url to ensure file is prioritized correctly
      
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
          <button 
            onClick={() => setShowHelpModal(true)} 
            className="ml-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center p-1 rounded hover:bg-[#1e293b]" 
            title="How to use Measurement Tools"
          >
            <Info size={16} />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1 cursor-pointer bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors text-white">
            <Upload size={14} />
            <span>Upload Patient X-Ray</span>
            <input type="file" accept=".dcm,application/dicom,image/jpeg,image/png" className="hidden" onChange={handlePatientUpload} />
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
              <p className="text-blue-100 text-sm mt-1">A file ({incomingImage.filename}) was just pushed to this viewer from another computer. Do you want to load it now?</p>
              <div className="flex space-x-2">
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
            <DicomViewer initialUrl={standardUrl} hideToolbar={false} />
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
              <DicomViewer key={patientUrl || patientFile?.name || 'empty_patient'} patientFile={patientFile} initialUrl={patientUrl} hideToolbar={false} />
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
                                <button onClick={() => handleLoadPacsImage(res)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center space-x-1">
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
                      <span>PACS Configuration (DICOMweb)</span>
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
                    
                    <div className="border border-[#334155] rounded-lg overflow-hidden">
                      <div className="bg-[#1e293b] p-3 border-b border-[#334155] flex items-center space-x-2">
                        <Server size={18} className="text-blue-400" />
                        <span className="font-bold text-white">1. Connecting to a PACS Server (DICOMweb)</span>
                      </div>
                      <div className="p-4 bg-[#020617] space-y-3 text-gray-300">
                        <ul className="list-disc pl-5 space-y-2">
                          <li>Ensure your PACS server has a <strong>DICOMweb endpoint</strong> enabled (QIDO-RS / WADO-RS).</li>
                          <li>The PACS server must have <strong>CORS (Cross-Origin Resource Sharing)</strong> configured to allow requests from this browser application.</li>
                          <li>Enter your PACS DICOMweb URL in the configuration box above.</li>
                          <li>Enter the Username and Password if your PACS server requires authentication.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-[#334155] rounded-lg overflow-hidden mt-4">
                      <div className="bg-[#1e293b] p-3 border-b border-[#334155] flex items-center space-x-2">
                        <Upload size={18} className="text-orange-400" />
                        <span className="font-bold text-white">2. Push Images Directly</span>
                      </div>
                      <div className="p-4 bg-[#020617] space-y-3 text-gray-300">
                        <p>Instead of querying a PACS, you can push a DICOM file directly to this screen using the included <strong>Pusher App</strong>.</p>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Find the local IP Address of this computer (<strong>Windows</strong>: <code className="bg-[#1e293b] px-1 py-0.5 rounded text-orange-300">ipconfig</code>, <strong>Mac</strong>: <code className="bg-[#1e293b] px-1 py-0.5 rounded text-orange-300">ifconfig | grep inet</code>, <strong>Linux</strong>: <code className="bg-[#1e293b] px-1 py-0.5 rounded text-orange-300">ip a</code>).</li>
                          <li>Open the Pusher App on the source computer and enter this IP address (e.g., <code className="bg-[#1e293b] px-1 py-0.5 rounded text-orange-300">http://192.168.1.50:3000/api/dicom-receiver</code>).</li>
                          <li>Drag and drop the DICOM file into the Pusher App to instantly load it here.</li>
                        </ol>
                      </div>
                    </div>

                    <div className="border border-[#334155] rounded-lg overflow-hidden mt-4">
                      <div className="bg-[#1e293b] p-3 border-b border-[#334155] flex items-center space-x-2">
                        <Globe size={18} className="text-purple-400" />
                        <span className="font-bold text-white">3. Remote Connections (via Tailscale)</span>
                      </div>
                      <div className="p-4 bg-[#020617] space-y-3 text-gray-300">
                        <p>If the Interpreter and the PACS Server (or X-Ray computer) are on DIFFERENT networks (e.g., Hospital vs Home), use <strong>Tailscale</strong> to create a secure, encrypted peer-to-peer VPN tunnel.</p>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Create a free account at <a href="https://tailscale.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">tailscale.com</a>.</li>
                          <li>Install the Tailscale client on <strong>both</strong> computers and log in.</li>
                          <li>Use the Tailscale IP address (e.g., <code className="bg-[#1e293b] px-1 py-0.5 rounded text-purple-300">100.x.x.x</code>) when entering your PACS DICOMweb URL or Pusher App target URL.</li>
                        </ol>
                        <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded flex items-start space-x-2 text-purple-200">
                          <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                          <p className="text-xs"><strong>Security Note:</strong> Tailscale end-to-end encrypts the DICOM traffic, securing your connection over the public internet.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-[#334155] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#1e293b] rounded-t-lg">
              <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                <Info size={20} className="text-blue-400" />
                <span>Measurement & Calibration Guide</span>
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">
              <div>
                <h4 className="text-emerald-400 font-bold mb-2 uppercase tracking-wide text-xs">1. Measurement Tools</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Ruler Icon:</strong> Draws a straight line to measure length or distance.</li>
                  <li><strong>Circle Icon:</strong> Draws an elliptical Region of Interest (ROI) to measure area and shape.</li>
                  <li><strong>Active Tool:</strong> Only one tool can be active for your left mouse button at a time. Select the tool from the floating toolbar above the image.</li>
                  <li><strong>Middle & Right Click:</strong> You can always pan with the middle mouse button and zoom with the right mouse button, regardless of what tool is selected.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-wide text-xs">2. Calibration System</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>If your DICOM file comes from a standard machine, it usually contains <em>Pixel Spacing</em> metadata. In this case, measurements are automatically calculated in <strong>Millimeters (mm)</strong>.</li>
                  <li>If size metadata is missing (e.g., converted JPEGs or stripped headers), measurements default to <strong>Pixels (px)</strong>.</li>
                  <li>The <strong>[ ] (Maximize) Icon</strong> on the toolbar will pulse orange and say "UNCALIBRATED" if metadata is missing.</li>
                  <li>Click the Uncalibrated button to open the Calibration popup. Enter the known physical width and height of the original film or detector in millimeters. The system will calculate the scaling factors, and your tools will instantly update to measure in exact millimeters.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-red-400 font-bold mb-2 uppercase tracking-wide text-xs">3. Erasing & Clearing</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Eraser Icon:</strong> Select this tool, then click on any specific measurement (line or circle) to delete just that item.</li>
                  <li><strong>Trash Icon:</strong> Instantly clears all drawn measurements from the image.</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#334155] bg-[#020617] rounded-b-lg flex justify-end">
              <button onClick={() => setShowHelpModal(false)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
