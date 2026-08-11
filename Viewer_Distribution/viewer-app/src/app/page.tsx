"use client";

import { useEffect, useState } from 'react';
import { ExternalLink, LayoutGrid, ClipboardList, ChevronRight, ChevronLeft, Save, Search, X, Info, AlertTriangle , Trash2, RefreshCw} from 'lucide-react';
import { ILOReportTemplate } from './components/ILOReportTemplate';

type InterpretationStep = '1_quality' | '2_parenchymal' | '3_pleural' | '4_other';

const INTERPRETATION_STEPS: { id: InterpretationStep, label: string }[] = [
  { id: '1_quality', label: '1. Quality' },
  { id: '2_parenchymal', label: '2. Parenchymal' },
  { id: '3_pleural', label: '3. Pleural' },
  { id: '4_other', label: '4. Other' }
];

export default function Home() {
  const [activeStandard, setActiveStandard] = useState<string>('0/0');
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [pendingPush, setPendingPush] = useState<any>(null);

  // Global State for the entire classification form
  const [wizardData, setWizardData] = useState({
    stage: 1, // 1 = Metadata (Doctor/Patient), 2 = Interpretation
    classificationMode: '', // 'Full' or 'Abbreviated'
    currentInterpStep: 0,
    
    // DOCTOR
    classifyingPhysician: '',
    readingDate: '',
    physicianQualification: ['MBBS'],
    physicianQualificationOtherText: '',
    facility: '',
    orderingPhysician: '',
    isTrained: '', // 'Yes' or 'No'
    trainingInstitute: '',
    trainingDate: '',
    classificationPurpose: '',
    classificationPurposeOtherText: '',
    designation: '',
    
    // PATIENT
    patientName: '',
    patientId: '',
    dob: '',
    radiographDate: '',
    workingPlace: '',
    establishmentName: '',
    establishmentAddress: '',
    examinationType: '',
    examinationTypeOtherText: '',
    workingPlaceOtherText: '',
    
    // 1. QUALITY
    qualityGrade: '',
    qualityDefects: [] as string[],
    qualityDefectsOtherText: '',
    isEssentiallyNormal: 'No', // 'Yes' or 'No'
    
    // 2. PARENCHYMAL
    anyParenchymal: '', // 'Yes' or 'No'
    profusion: '-',
    primaryShape: '-',
    secondaryShape: '-',
    zones: [] as string[],
    largeOpacity: '0',
    
    // 3. PLEURAL
    anyPleural: '', // 'Yes' or 'No'
    
    // 3B. PLAQUES
    plaqueSiteProfile: [] as string[],
    plaqueSiteFaceOn: [] as string[],
    plaqueSiteDiaphragm: [] as string[],
    plaqueSiteOther: [] as string[],
    plaqueCalcProfile: [] as string[],
    plaqueCalcFaceOn: [] as string[],
    plaqueCalcDiaphragm: [] as string[],
    plaqueCalcOther: [] as string[],
    plaqueExtentRight: '0',
    plaqueExtentLeft: '0',
    plaqueWidthRight: '0',
    plaqueWidthLeft: '0',
    
    // 3C. COSTOPHRENIC
    costophrenicRight: false,
    costophrenicLeft: false,

    // 3D. DIFFUSE
    diffuseSiteProfile: [] as string[],
    diffuseSiteFaceOn: [] as string[],
    diffuseCalcProfile: [] as string[],
    diffuseCalcFaceOn: [] as string[],
    diffuseExtentRight: '0',
    diffuseExtentLeft: '0',
    diffuseWidthRight: '0',
    diffuseWidthLeft: '0',

    // 4. OTHER
    anyOther: '', // 'Yes' or 'No'
    symbols: [] as string[],
    seePhysician: '', // 'Yes' or 'No'
    
    // Abbreviated fields
    abbrevQualityComment: '',
    abbrevProfusion: '-',
    abbrevShape: '-',
    abbrevThickening: [] as string[],
    abbrevCalcification: [] as string[],
    abbrevSymbolsPresent: '', // Yes/No
    hasComments: '',
    commentsText: '',
    isNonDicom: false
  });

  const QUALITY_DEFECTS = ['Overexposed (dark)', 'Underexposed (light)', 'Artifacts', 'Improper position', 'Poor contrast', 'Poor processing', 'Underinflation', 'Mottle', 'Excessive Edge Enhancement', 'Scapula Overlay', 'Other'];
  const OBLIGATORY_SYMBOLS = ['aa', 'at', 'ax', 'bu', 'ca', 'cg', 'cn', 'co', 'cp', 'cv', 'di', 'ef', 'em', 'es', 'fr', 'hi', 'ho', 'id', 'ih', 'kl', 'me', 'pa', 'pb', 'pi', 'px', 'ra', 'rp', 'tb', 'od'];
  const OBLIGATORY_SYMBOLS_FULL: Record<string, string> = { 'aa': 'Atherosclerotic aorta', 'at': 'Significant apical pleural thickening', 'ax': 'Coalescence of small pneumoconiotic opacities', 'bu': 'Bulla(e)', 'ca': 'Cancer of lung or pleura', 'cg': 'Calcified non-pneumoconiotic nodules', 'cn': 'Calcification in small pneumoconiotic opacities', 'co': 'Abnormality of cardiac shape or size', 'cp': 'Cor pulmonale', 'cv': 'Cavity', 'di': 'Marked distortion of the intrathoracic organs', 'ef': 'Effusion', 'em': 'Emphysema', 'es': 'Eggshell calcification of hilar or mediastinal lymph nodes', 'fr': 'Fractured rib(s)', 'hi': 'Enlargement of hilar or mediastinal lymph nodes', 'ho': 'Honeycomb lung', 'id': 'Ill-defined diaphragm', 'ih': 'Ill-defined heart border', 'kl': 'Septal (Kerley) lines', 'me': 'Mesothelioma', 'pa': 'Plate atelectasis', 'pb': 'Parenchymal bands', 'pi': 'Pleural thickening of an interlobar fissure', 'px': 'Pneumothorax', 'ra': 'Rounded atelectasis', 'rp': 'Rheumatoid pneumoconiosis', 'tb': 'Tuberculosis', 'od': 'Other significant abnormality' };

  useEffect(() => {
    const saved = localStorage.getItem('ilo_doctor_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWizardData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/dicom-check?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'pending' && data.filename) {
            setPendingPush(data);
          } else {
            setPendingPush(null);
          }
        }
      } catch (err) {}
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    const bc = new BroadcastChannel('bviewer-sync');
    bc.onmessage = (event) => {
      if (event.data && event.data.type === 'PUSH_ACCEPTED') {
        setWizardData(prev => ({
          ...prev,
          patientName: event.data.patientName || prev.patientName,
          patientId: event.data.patientId || prev.patientId,
          radiographDate: event.data.radiographDate || prev.radiographDate,
          isNonDicom: event.data.isNonDicom || false
        }));
      } else if (event.data && event.data.type === 'LOCAL_IMAGE_UPLOADED') {
        setWizardData(prev => ({
          ...prev,
          isNonDicom: event.data.isNonDicom || false
        }));
      }
    };
    setChannel(bc);
    return () => bc.close();
  }, []);

  const saveDoctorProfile = () => {
    const profile = {
      classifyingPhysician: wizardData.classifyingPhysician,
      facility: wizardData.facility,
      orderingPhysician: wizardData.orderingPhysician,
      isTrained: wizardData.isTrained,
      trainingInstitute: wizardData.trainingInstitute,
      trainingDate: wizardData.trainingDate,
      classificationPurpose: wizardData.classificationPurpose,
      designation: wizardData.designation
    };
    localStorage.setItem('ilo_doctor_profile', JSON.stringify(profile));
    alert('Doctor profile saved as default for future classifications.');
  };

  const openHistoryModal = () => {
    const existingHistoryStr = localStorage.getItem('ilo_reports_history');
    if (existingHistoryStr) {
      setHistoryData(JSON.parse(existingHistoryStr));
    }
    setHistorySearch('');
    setShowHistoryModal(true);
  };

  const deleteHistoricalPatient = (historyId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this patient's history?")) return;
    const existingHistoryStr = localStorage.getItem('ilo_reports_history');
    if (existingHistoryStr) {
      let history = JSON.parse(existingHistoryStr);
      history = history.filter((r: any) => r.historyId !== historyId);
      localStorage.setItem('ilo_reports_history', JSON.stringify(history));
      setHistoryData(history);
    }
  };

  const loadHistoricalPatient = (report: any) => {
    updateData({
      patientName: report.patientName || '',
      patientId: report.patientId || '',
      dob: report.dob || '',
      radiographDate: report.radiographDate || '',
      workingPlace: report.workingPlace || '',
      workingPlaceOtherText: report.workingPlaceOtherText || '',
      establishmentName: report.establishmentName || '',
      establishmentAddress: report.establishmentAddress || '',
      examinationType: report.examinationType || '',
      examinationTypeOtherText: report.examinationTypeOtherText || '',
    });
    setShowHistoryModal(false);
  };

  const handleOpenPatientViewer = () => {
    window.open('/patient-viewer', '_blank', 'width=1600,height=900,menubar=no,toolbar=no,location=no,status=no');
  };

  const loadStandard = (url: string, label: string) => {
    const isViewerOpen = localStorage.getItem('isDualViewerOpen') === 'true';
    if (!isViewerOpen) {
      alert("Please open the 'POP OUT DUAL VIEWER PANEL' first before selecting a standard.");
      return;
    }
    setActiveStandard(label);
    if (channel) {
      channel.postMessage({ type: 'LOAD_STANDARD', url, label });
    }
  };

  const updateData = (updates: Partial<typeof wizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (key: 'physicianQualification' | 'qualityDefects' | 'symbols' | 'abbrevThickening' | 'abbrevCalcification' | 'zones' | 'plaqueSiteProfile' | 'plaqueSiteFaceOn' | 'plaqueSiteDiaphragm' | 'plaqueSiteOther' | 'plaqueCalcProfile' | 'plaqueCalcFaceOn' | 'plaqueCalcDiaphragm' | 'plaqueCalcOther' | 'diffuseSiteProfile' | 'diffuseSiteFaceOn' | 'diffuseCalcProfile' | 'diffuseCalcFaceOn', item: string) => {
    if (key === 'physicianQualification') {
      const arr = wizardData.physicianQualification;
      const isChecking = !arr.includes(item);
      const isBase = item === 'MBBS' || item === 'MD-Physician : Equivalent to MBBS';
      
      if (isChecking && !isBase) {
        if (!arr.includes('MBBS') && !arr.includes('MD-Physician : Equivalent to MBBS')) {
          alert('Selecting at least MBBS or MD-Physician : Equivalent to MBBS is mandatory before selecting other qualifications.');
          return;
        }
      }
      
      if (!isChecking && isBase) {
        const otherBase = item === 'MBBS' ? 'MD-Physician : Equivalent to MBBS' : 'MBBS';
        if (!arr.includes(otherBase)) {
          alert('Selecting at least MBBS or MD-Physician : Equivalent to MBBS is mandatory.');
          return;
        }
      }

      if (isChecking && isBase) {
        const otherBase = item === 'MBBS' ? 'MD-Physician : Equivalent to MBBS' : 'MBBS';
        if (arr.includes(otherBase)) {
          setWizardData(prev => ({
            ...prev,
            [key]: [...prev[key].filter(i => i !== otherBase), item]
          }));
          return;
        }
      }
    }
    setWizardData(prev => {
      const arr = prev[key];
      if (arr.includes(item)) return { ...prev, [key]: arr.filter(i => i !== item) };
      return { ...prev, [key]: [...arr, item] };
    });
  };

  const generatePDF = async () => {
    try {
      const existingHistoryStr = localStorage.getItem('ilo_reports_history');
      const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      const newReport = { ...wizardData, historyId: Date.now(), historyDate: new Date().toLocaleDateString() };
      existingHistory.unshift(newReport); // Add to beginning of array
      localStorage.setItem('ilo_reports_history', JSON.stringify(existingHistory));
    } catch (e) {
      console.error('Failed to save history', e);
    }
    // Rely on native browser print dialog, which perfectly handles all modern CSS, Lab colors, and CORS fonts.
    // The @media print CSS in globals.css ensures only the report is visible.
    window.print();
  };

  // Stage 1 Validation
  const canStartInterpretation = () => {
    const doctorOk = !!wizardData.classifyingPhysician && !!wizardData.readingDate && !!wizardData.physicianQualification &&
                    (wizardData.isTrained === 'No' || (wizardData.isTrained === 'Yes' && !!wizardData.trainingInstitute && !!wizardData.trainingDate));
    const patientOk = !!wizardData.patientName && !!wizardData.patientId;
    const modeOk = !!wizardData.classificationMode;
    return doctorOk && patientOk && modeOk;
  };

  // Derive visible steps based on mode
  const visibleSteps = wizardData.isEssentiallyNormal === 'Yes' 
    ? INTERPRETATION_STEPS.filter(s => s.id === '1_quality') 
    : INTERPRETATION_STEPS;

  // Stage 2 Validation
  const canProceedInterp = (stepIndex: number) => {
    const stepId = visibleSteps[stepIndex].id;
    if (stepId === '1_quality') {
      if (!wizardData.qualityGrade) return false;
      if (wizardData.classificationMode === 'Abbreviated' && wizardData.qualityGrade !== '1') {
        return !!wizardData.abbrevQualityComment;
      }
      if (wizardData.classificationMode !== 'Abbreviated' && wizardData.qualityGrade !== '1') {
        if (!wizardData.qualityDefects || wizardData.qualityDefects.length === 0) return false;
        if (wizardData.qualityDefects.includes('Other') && !wizardData.qualityDefectsOtherText) return false;
      }
      return true;
    }
    if (stepId === '2_parenchymal') {
      if (wizardData.classificationMode === 'Abbreviated') {
        if (!wizardData.largeOpacity || wizardData.abbrevProfusion === '-') return false;
        if (wizardData.abbrevProfusion !== '0' && wizardData.abbrevShape === '-') return false;
        return true;
      } else {
        if (!wizardData.anyParenchymal) return false;
        if (wizardData.anyParenchymal === 'Yes') {
          if (wizardData.profusion === '0/-' || wizardData.profusion === '0/0') return !!wizardData.largeOpacity;
          return wizardData.profusion !== '-' && !!wizardData.largeOpacity && wizardData.primaryShape !== '-' && wizardData.zones.length > 0;
        }
        return true;
      }
    }
    if (stepId === '3_pleural') {
      if (!wizardData.anyPleural) return false;
      if (wizardData.classificationMode === 'Abbreviated' && wizardData.anyPleural === 'Yes') {
        if (wizardData.abbrevThickening.length === 0) return false;
        if (wizardData.abbrevCalcification.length === 0) return false;
      }
      return true; // detailed checkboxes are optional if Yes in Full mode
    }
    if (stepId === '4_other') {
      if (wizardData.classificationMode === 'Abbreviated') {
        if (!wizardData.abbrevSymbolsPresent) return false;
        if (!wizardData.hasComments) return false;
        return true;
      } else {
        if (!wizardData.anyOther) return false;
        if (wizardData.anyOther === 'Yes') return !!wizardData.seePhysician; // see physician is required if Yes
        return true;
      }
    }
    return false;
  };

  const isStepAccessible = (index: number) => {
    if (index === 0) return true;
    for (let i = 0; i < index; i++) {
      if (!canProceedInterp(i)) return false;
    }
    return true;
  };

  const nextStep = () => {
    if (wizardData.currentInterpStep < visibleSteps.length - 1 && canProceedInterp(wizardData.currentInterpStep)) {
      updateData({ currentInterpStep: wizardData.currentInterpStep + 1 });
    }
  };

  const prevStep = () => {
    if (wizardData.currentInterpStep > 0) {
      updateData({ currentInterpStep: wizardData.currentInterpStep - 1 });
    } else if (wizardData.currentInterpStep === 0) {
      updateData({ stage: 1 });
    }
  };

  return (
    <>
      <div className="flex h-screen bg-[#0f172a] text-gray-300 font-sans overflow-hidden print:hidden">
      
      {/* Left Subpanel: Global Standard Library */}
      <div className="w-[400px] flex flex-col border-r border-[#1e293b] bg-[#1e293b] z-10 shadow-xl">
        <div className="bg-[#020617] text-blue-400 p-3 border-b border-[#334155] flex items-center space-x-2 shadow-md">
          <LayoutGrid size={16} />
          <div className="font-bold tracking-widest text-xs">ILO STANDARD LIBRARY</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          <div>
            <h3 className="font-bold text-gray-400 mb-2 border-b border-[#334155] pb-1">Normal</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => loadStandard('/standards/00_Normal_1.dcm', '0/0 (Normal 1)')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-xs font-bold transition-colors">0/0 (Normal 1)</button>
              <button onClick={() => loadStandard('/standards/00_Normal_2.dcm', '0/0 (Normal 2)')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-xs font-bold transition-colors">0/0 (Normal 2)</button>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-400 mb-1 border-b border-[#334155] pb-1 flex flex-col">
              <span>Small Opacities</span>
              <span className="text-[10px] font-normal text-gray-500 mt-0.5">(opacity having the longest dimension not exceeding 10mm)</span>
            </h3>
            
            <div className="mt-2 mb-3">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Regular</h4>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => loadStandard('/standards/11_pp.dcm', '1/1 p/p')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">1/1 p/p</button>
                <button onClick={() => loadStandard('/standards/11_qq.dcm', '1/1 q/q')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">1/1 q/q</button>
                <button onClick={() => loadStandard('/standards/11_rr.dcm', '1/1 r/r')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">1/1 r/r</button>
                
                <button onClick={() => loadStandard('/standards/22_pp.dcm', '2/2 p/p')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">2/2 p/p</button>
                <button onClick={() => loadStandard('/standards/22_qq.dcm', '2/2 q/q')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">2/2 q/q</button>
                <button onClick={() => loadStandard('/standards/22_rr.dcm', '2/2 r/r')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">2/2 r/r</button>
                
                <button onClick={() => loadStandard('/standards/33_pp.dcm', '3/3 p/p')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">3/3 p/p</button>
                <button onClick={() => loadStandard('/standards/33_qq.dcm', '3/3 q/q')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">3/3 q/q</button>
                <button onClick={() => loadStandard('/standards/33_rr.dcm', '3/3 r/r')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">3/3 r/r</button>
              </div>
            </div>

            <div className="mb-2">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Irregular</h4>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => loadStandard('/standards/11_ss.dcm', '1/1 s/s')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">1/1 s/s</button>
                <button onClick={() => loadStandard('/standards/11_tt.dcm', '1/1 t/t')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">1/1 t/t</button>
                <button onClick={() => loadStandard('/standards/22_ss.dcm', '2/2 s/s')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">2/2 s/s</button>
                <button onClick={() => loadStandard('/standards/22_tt.dcm', '2/2 t/t')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">2/2 t/t</button>
                <button onClick={() => loadStandard('/standards/33_ss.dcm', '3/3 s/s')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">3/3 s/s</button>
                <button onClick={() => loadStandard('/standards/33_ts.dcm', '3/3 t/s')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">3/3 t/s</button>
                <button onClick={() => loadStandard('/standards/123u.dcm', '123 u')} className="p-2 bg-[#334155] hover:bg-blue-600 border border-[#475569] hover:border-blue-400 rounded text-center text-xs font-bold">123 u</button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-400 mb-2 border-b border-[#334155] pb-1 flex flex-col">
              <span>Large Opacities</span>
              <span className="text-[10px] font-normal text-gray-500 mt-0.5">(opacity having the longest dimension exceeding 10mm)</span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => loadStandard('/standards/A_22_qq.dcm', 'Size A (2/2 q/q)')} className="p-2 bg-[#334155] hover:bg-emerald-600 border border-[#475569] hover:border-emerald-400 rounded text-xs font-bold">Size A (2/2 q/q)</button>
              <button onClick={() => loadStandard('/standards/B_23_qr.dcm', 'Size B (2/3 q/r)')} className="p-2 bg-[#334155] hover:bg-emerald-600 border border-[#475569] hover:border-emerald-400 rounded text-xs font-bold">Size B (2/3 q/r)</button>
              <button onClick={() => loadStandard('/standards/C_3+_rr.dcm', 'Size C (3/+ r/r)')} className="p-2 bg-[#334155] hover:bg-emerald-600 border border-[#475569] hover:border-emerald-400 rounded text-xs font-bold">Size C (3/+ r/r)</button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-400 mb-2 border-b border-[#334155] pb-1">Pleural</h3>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => loadStandard('/standards/Pleural.dcm', 'Pleural Standard')} className="p-2 bg-[#334155] hover:bg-purple-600 border border-[#475569] hover:border-purple-400 rounded text-xs font-bold">Pleural Plaques Standard</button>
              <button onClick={() => loadStandard('/standards/CPangle.dcm', 'Costophrenic Angle')} className="p-2 bg-[#334155] hover:bg-purple-600 border border-[#475569] hover:border-purple-400 rounded text-xs font-bold">C/P Angle Obliteration</button>
            </div>
          </div>
        </div>
        <div className="bg-[#020617] p-2 text-[10px] text-center border-t border-[#334155] text-gray-500">
          Click any standard above to instantly load it into the Viewer Panel.
        </div>
      </div>

      {/* Right Panel: Data Entry Wizard */}
      <div className="flex-1 flex flex-col bg-[#0f172a] relative overflow-y-auto">
        
        {/* Header & Window Controls */}
        <div className="bg-[#020617] text-white p-3 border-b border-[#1e293b] flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <ClipboardList size={18} className="text-emerald-400" />
            <div className="font-bold tracking-widest text-xs text-orange-400">ILO RAD Suite: ILO Radiography System for Pneumoconiosis Classification</div>
          </div>
          <div className="flex items-center space-x-4">
            {pendingPush && (
              <div className="flex items-center space-x-2 bg-blue-900/50 border border-blue-500 text-blue-300 px-3 py-1.5 rounded animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-white shadow-black drop-shadow-md">New X-Ray Waiting</span>
              </div>
            )}
            <button 
              onClick={handleOpenPatientViewer}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded shadow text-xs font-bold transition-colors"
            >
              <ExternalLink size={14} />
              <span>POP OUT DUAL VIEWER PANEL</span>
            </button>
          </div>
        </div>

        {wizardData.isNonDicom && (
          <div className="bg-red-900/40 border-l-4 border-red-500 p-4 m-8 mb-0 rounded shadow-lg animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="text-red-400" size={20} />
              </div>
              <div className="ml-3">
                <h3 className="text-red-400 font-bold text-sm tracking-widest uppercase">NON-DICOM IMAGE LOADED</h3>
                <p className="text-red-200 mt-1 text-xs">
                  A non-DICOM format image (e.g. JPG/PNG) is currently loaded in the viewer. According to official guidelines, non-DICOM images are <strong>strictly for training and educational purposes only</strong> and are not legally accepted for primary medical diagnosis or official ILO classification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 1: METADATA */}
        {wizardData.stage === 1 && (
          <div className="flex-1 p-8 max-w-4xl mx-auto w-full text-sm overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg mb-8">
              <h2 className="text-blue-400 font-bold mb-1">STAGE 1: Metadata Setup</h2>
              <p className="text-gray-400 text-xs">Please provide the interpreting doctor and patient details to begin the official ILO classification sequence.</p>
            </div>

            {/* Doctor Form */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-bold border-b border-[#334155] pb-2 text-white flex justify-between items-center">
                <span>Details of Interpreting Doctor and Purpose</span>
                <button onClick={saveDoctorProfile} className="flex items-center space-x-2 text-xs bg-[#334155] hover:bg-blue-600 px-3 py-1.5 rounded transition-colors text-white font-bold">
                  <Save size={14} />
                  <span>Save as Default</span>
                </button>
              </h2>
              <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Classifying Physician's Name *</label>
                  <input type="text" value={wizardData.classifyingPhysician} onChange={e => updateData({ classifyingPhysician: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" placeholder="Required" />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs uppercase mb-2">Physician Qualification *</label>
                  <div className="flex flex-wrap gap-4 bg-[#0f172a] border border-[#475569] p-3 rounded">
                    {['MBBS', 'MD-Physician : Equivalent to MBBS'].map(opt => (
                      <label key={opt} className="flex items-center space-x-2 text-emerald-400 text-sm cursor-pointer hover:text-emerald-300 transition-colors">
                        <input type="checkbox" checked={wizardData.physicianQualification.includes(opt)} onChange={() => toggleArrayItem('physicianQualification', opt)} className="accent-emerald-500 w-4 h-4" />
                        <span className="font-bold">{opt}</span>
                      </label>
                    ))}
                    {['DIH', 'DPH', 'AFIH', 'Diploma', 'MPH', 'MD', 'MS', 'DNB', 'FNB', 'DM', 'MCH', 'PhD'].map(opt => (
                      <label key={opt} className="flex items-center space-x-2 text-white text-sm cursor-pointer hover:text-emerald-400 transition-colors">
                        <input type="checkbox" checked={wizardData.physicianQualification.includes(opt)} onChange={() => toggleArrayItem('physicianQualification', opt)} className="accent-emerald-500 w-4 h-4" />
                        <span>{opt}</span>
                      </label>
                    ))}
                    <label className="flex items-center space-x-2 text-white text-sm cursor-pointer hover:text-emerald-400 transition-colors">
                      <input type="checkbox" checked={wizardData.physicianQualification.includes('Others')} onChange={() => toggleArrayItem('physicianQualification', 'Others')} className="accent-emerald-500 w-4 h-4" />
                      <span>Others</span>
                    </label>
                  </div>
                  {wizardData.physicianQualification.includes('Others') && (
                    <input 
                      type="text" 
                      value={wizardData.physicianQualificationOtherText || ""} 
                      onChange={e => updateData({ physicianQualificationOtherText: e.target.value })} 
                      className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500 mt-2" 
                      placeholder="Please specify other qualification" 
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase mb-1">Reading Date *</label>
                  <input type="date" value={wizardData.readingDate} onChange={e => updateData({ readingDate: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Designation of Examining Physician</label>
                  <select value={wizardData.designation} onChange={e => updateData({ designation: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500">
                    <option value="">- Select Designation -</option>
                    <option value="Registered Medical Practitioners or Medical Specialist">Registered Medical Practitioners or Medical Specialist</option>
                    <option value="Medical Officer under OSHWC Code 2020">Medical Officer under OSHWC Code 2020</option>
                    <option value="Qualified Medical Practitioner under OHSWC Code 2020">Qualified Medical Practitioner under OHSWC Code 2020</option>
                    <option value="Examining Authority in Mines">Examining Authority in Mines</option>
                    <option value="Factory Medical Officer">Factory Medical Officer</option>
                    <option value="Any other Qualified Medical Practitioner under OHSWC Code 2020 or Rules/Regulations/Standard there under">Any other Qualified Medical Practitioner under OHSWC Code 2020 or Rules/Regulations/Standard there under</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-xs uppercase mb-1">Radiology Facility</label>
                  <input type="text" value={wizardData.facility} onChange={e => updateData({ facility: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase mb-1">Ordering Physician</label>
                  <input type="text" value={wizardData.orderingPhysician} onChange={e => updateData({ orderingPhysician: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Classification Purpose</label>
                  <select value={wizardData.classificationPurpose} onChange={e => updateData({ classificationPurpose: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500">
                    <option value="">- Select Purpose -</option>
                    <option value="Screening and Surveillance for Pneumoconesis under OSHWC Code 2020">Screening and Surveillance for Pneumoconesis under OSHWC Code 2020</option>
                    <option value="Epidemiological Studies">Epidemiological Studies</option>
                    <option value="Other">Other</option>
                  </select>
                  {wizardData.classificationPurpose === 'Other' && (
                    <div className="mt-2 animate-in fade-in duration-300">
                      <textarea maxLength={1500} value={wizardData.classificationPurposeOtherText} onChange={e => updateData({ classificationPurposeOtherText: e.target.value })} placeholder="Please specify (max 250 words)..." className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500 min-h-[80px]"></textarea>
                    </div>
                  )}
                </div>

                <div className="col-span-2 border-t border-[#334155] pt-4 mt-2">
                  <label className="block text-gray-400 text-xs uppercase mb-2">Trained in ILO Radiography?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="isTrained" checked={wizardData.isTrained === 'Yes'} onChange={() => updateData({ isTrained: 'Yes' })} className="accent-emerald-500 w-4 h-4" />
                      <span className="text-white">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="isTrained" checked={wizardData.isTrained === 'No'} onChange={() => updateData({ isTrained: 'No' })} className="accent-emerald-500 w-4 h-4" />
                      <span className="text-white">No</span>
                    </label>
                  </div>
                </div>

                {wizardData.isTrained === 'Yes' && (
                  <>
                    <div className="col-span-2 md:col-span-1 animate-in fade-in duration-300">
                      <label className="block text-gray-400 text-xs uppercase mb-1">Trained from Which Institute *</label>
                      <input type="text" value={wizardData.trainingInstitute} onChange={e => updateData({ trainingInstitute: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" placeholder="Required" />
                    </div>
                    <div className="col-span-2 md:col-span-1 animate-in fade-in duration-300">
                      <label className="block text-gray-400 text-xs uppercase mb-1">Date of Training/Refresher *</label>
                      <input type="date" value={wizardData.trainingDate} onChange={e => updateData({ trainingDate: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Patient Form */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-bold border-b border-[#334155] pb-2 text-white flex justify-between items-center">
                <span>Patient/Worker/Employee Details</span>
                <button onClick={openHistoryModal} className="flex items-center space-x-2 text-xs bg-[#334155] hover:bg-emerald-600 px-3 py-1.5 rounded transition-colors text-white font-bold">
                  <Search size={14} />
                  <span>Search History</span>
                </button>
              </h2>
              <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Patient/Worker/Employee's Name *</label>
                  <input type="text" value={wizardData.patientName} onChange={e => updateData({ patientName: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" placeholder="Required" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase mb-1">Patient/Worker/Employee ID *</label>
                  <input type="text" value={wizardData.patientId} onChange={e => updateData({ patientId: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" placeholder="Required" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase mb-1">Birth Date</label>
                  <input type="date" value={wizardData.dob} onChange={e => updateData({ dob: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Radiograph Date</label>
                  <input type="date" value={wizardData.radiographDate} onChange={e => updateData({ radiographDate: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" />
                </div>

                <div className="col-span-2 border-t border-[#334155] pt-4 mt-2">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Working Place</label>
                  <select value={wizardData.workingPlace} onChange={e => updateData({ workingPlace: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500">
                    <option value="">- Select Working Place -</option>
                    <option value="Factory">Factory</option>
                    <option value="Mines">Mines</option>
                    <option value="Building and Other Construction Works">Building and Other Construction Works</option>
                    <option value="Dock Works">Dock Works</option>
                    <option value="Plantation">Plantation</option>
                    <option value="Any Other Establishment">Any Other Establishment</option>
                  </select>
                  {wizardData.workingPlace === 'Any Other Establishment' && (
                    <div className="mt-2 animate-in fade-in duration-300">
                      <textarea maxLength={1500} value={wizardData.workingPlaceOtherText} onChange={e => updateData({ workingPlaceOtherText: e.target.value })} placeholder="Please specify working place (max 250 words)..." className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500 min-h-[80px]"></textarea>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Name of The Establishment</label>
                  <input type="text" value={wizardData.establishmentName} onChange={e => updateData({ establishmentName: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Address</label>
                  <input type="text" value={wizardData.establishmentAddress} onChange={e => updateData({ establishmentAddress: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500" />
                </div>

                <div className="col-span-2 border-t border-[#334155] pt-4 mt-2">
                  <label className="block text-gray-400 text-xs uppercase mb-1">Type of Examination</label>
                  <select value={wizardData.examinationType} onChange={e => updateData({ examinationType: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500">
                    <option value="">- Select Type of Examination -</option>
                    <option value="Initial Medical Examination in Mines">Initial Medical Examination in Mines</option>
                    <option value="Pre Employment Medical Examination">Pre Employment Medical Examination</option>
                    <option value="Periodical Medical Examination">Periodical Medical Examination</option>
                    <option value="Exit Medical Examination">Exit Medical Examination</option>
                    <option value="Other Purpose">Other Purpose</option>
                  </select>
                  {wizardData.examinationType === 'Other Purpose' && (
                    <div className="mt-2 animate-in fade-in duration-300">
                      <textarea maxLength={1500} value={wizardData.examinationTypeOtherText} onChange={e => updateData({ examinationTypeOtherText: e.target.value })} placeholder="Please specify type of examination (max 250 words)..." className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500 min-h-[80px]"></textarea>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg mb-8">
              <p className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs">Classification Mode *</p>
              <div className="flex space-x-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="classificationMode" checked={wizardData.classificationMode === 'Full'} onChange={() => updateData({ classificationMode: 'Full' })} className="peer hidden" />
                  <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors">
                    Full Classification
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="classificationMode" checked={wizardData.classificationMode === 'Abbreviated'} onChange={() => updateData({ classificationMode: 'Abbreviated' })} className="peer hidden" />
                  <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors">
                    Abbreviated Classification
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-8 border-t border-[#334155] pt-6 pb-8">
              <button 
                suppressHydrationWarning
                onClick={() => updateData({ stage: 2, currentInterpStep: 0 })}
                disabled={!canStartInterpretation()}
                className={`flex items-center space-x-2 px-8 py-3 rounded font-bold transition-colors shadow-lg ${!canStartInterpretation() ? 'bg-emerald-900/50 text-emerald-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900'}`}
              >
                <span>Start Classification</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: INTERPRETATION */}
        {wizardData.stage === 2 && (
          <div className="flex-1 flex flex-col relative animate-in slide-in-from-right duration-300">
            {/* Wizard Navigation */}
            <div className="flex bg-[#1e293b] p-1 border-b border-[#334155] text-xs">
              <button
                onClick={() => updateData({ stage: 1 })}
                className="px-4 py-3 font-bold text-gray-400 hover:bg-[#0f172a] border-r border-[#334155] flex items-center space-x-1"
              >
                <ChevronLeft size={14} /> <span>Metadata</span>
              </button>
              {visibleSteps.map((step, idx) => {
                const isAccessible = isStepAccessible(idx);
                const isActive = wizardData.currentInterpStep === idx;
                return (
                  <button
                    key={step.id}
                    onClick={() => isAccessible && updateData({ currentInterpStep: idx })}
                    disabled={!isAccessible}
                    className={`px-2 py-3 font-bold flex-1 text-center transition-colors rounded-sm 
                      ${isActive ? 'bg-[#334155] text-emerald-400 border-b-2 border-emerald-500' : ''}
                      ${!isActive && isAccessible ? 'text-gray-400 hover:bg-[#0f172a] cursor-pointer' : ''}
                      ${!isAccessible ? 'text-gray-600 cursor-not-allowed opacity-50' : ''}
                    `}
                  >
                    {step.label}
                  </button>
                );
              })}
            </div>
                <div className="flex-1 p-8 max-w-4xl mx-auto w-full text-sm overflow-y-auto">
              {visibleSteps[wizardData.currentInterpStep]?.id === '1_quality' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold border-b border-[#334155] pb-2 text-white">1. IMAGE QUALITY</h2>
                  <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg flex flex-col justify-between">
                    <div>
                      <p className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs">TECHNICAL QUALITY *</p>
                      <div className="grid grid-cols-4 gap-4">
                        {['1', '2', '3', '4'].map(grade => (
                          <label key={grade} className="flex-1 cursor-pointer">
                            <input type="radio" name="quality" checked={wizardData.qualityGrade === grade} onChange={() => updateData({ qualityGrade: grade })} className="peer hidden" />
                            <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors shadow-sm">
                              Grade {grade}
                            </div>
                          </label>
                        ))}
                      </div>

                      {wizardData.classificationMode === 'Abbreviated' && wizardData.qualityGrade && wizardData.qualityGrade !== '1' && (
                        <div className="mt-6 animate-in fade-in duration-300">
                          <p className="mb-2 text-emerald-400 font-bold uppercase tracking-widest text-xs">Comment on technical quality *</p>
                          <textarea maxLength={1500} value={wizardData.abbrevQualityComment} onChange={e => updateData({ abbrevQualityComment: e.target.value })} placeholder="Comments required here..." className="w-full bg-[#0f172a] border border-[#475569] rounded p-3 text-white outline-none focus:border-emerald-500 min-h-[100px]"></textarea>
                        </div>
                      )}

                      {wizardData.classificationMode === 'Full' && wizardData.qualityGrade && wizardData.qualityGrade !== '1' && (
                        <div className="mt-6 animate-in fade-in duration-300">
                          <p className="mb-2 text-emerald-400 font-bold uppercase tracking-widest text-xs">SELECT ALL DEFECTS THAT APPLY</p>
                          <div className="grid grid-cols-3 gap-2">
                            {QUALITY_DEFECTS.map(defect => (
                              <label key={defect} className="flex items-center space-x-2 cursor-pointer bg-[#0f172a] p-3 rounded border border-[#475569] hover:border-emerald-500 transition-colors">
                                <input type="checkbox" checked={wizardData.qualityDefects.includes(defect)} onChange={() => toggleArrayItem('qualityDefects', defect)} className="accent-emerald-500 w-4 h-4" />
                                <span className="text-gray-300 text-xs">{defect}</span>
                              </label>
                            ))}
                          </div>
                          {wizardData.qualityDefects.includes('Other') && (
                            <div className="mt-4 animate-in fade-in duration-300">
                              <textarea maxLength={1500} value={wizardData.qualityDefectsOtherText} onChange={e => updateData({ qualityDefectsOtherText: e.target.value })} placeholder="Please specify other defects (max 250 words)..." className="w-full bg-[#0f172a] border border-[#475569] rounded p-2 text-white outline-none focus:border-emerald-500 min-h-[80px]"></textarea>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ESSENTIALLY NORMAL OVERRIDE */}
                  {wizardData.qualityGrade && wizardData.qualityGrade !== '4' && (
                    <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg mt-6 animate-in fade-in duration-300">
                      <p className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs">OVERALL ASSESSMENT</p>
                      <p className="mb-4 text-sm text-gray-300">Based on history, signs, symptoms, and your best clinical judgment, is this essentially a normal X-ray? (No parenchymal, pleural, or other abnormalities)</p>
                      <div className="flex space-x-4">
                        <label className="flex-1 cursor-pointer">
                          <div className={`border rounded-lg p-4 flex items-center space-x-3 transition-colors ${wizardData.isEssentiallyNormal === 'Yes' ? 'border-emerald-500 bg-emerald-900/20' : 'border-[#475569] bg-[#0f172a] hover:border-gray-400'}`}>
                            <input type="radio" name="isEssentiallyNormal" checked={wizardData.isEssentiallyNormal === 'Yes'} onChange={() => updateData({ isEssentiallyNormal: 'Yes', anyParenchymal: 'No', anyPleural: 'No', anyOther: 'No' })} className="accent-emerald-500 w-5 h-5" />
                            <span className={`font-bold ${wizardData.isEssentiallyNormal === 'Yes' ? 'text-emerald-400' : 'text-gray-300'}`}>Yes</span>
                          </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <div className={`border rounded-lg p-4 flex items-center space-x-3 transition-colors ${wizardData.isEssentiallyNormal === 'No' ? 'border-emerald-500 bg-emerald-900/20' : 'border-[#475569] bg-[#0f172a] hover:border-gray-400'}`}>
                            <input type="radio" name="isEssentiallyNormal" checked={wizardData.isEssentiallyNormal === 'No'} onChange={() => updateData({ isEssentiallyNormal: 'No' })} className="accent-emerald-500 w-5 h-5" />
                            <span className={`font-bold ${wizardData.isEssentiallyNormal === 'No' ? 'text-emerald-400' : 'text-gray-300'}`}>No</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {visibleSteps[wizardData.currentInterpStep]?.id === '2_parenchymal' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold border-b border-[#334155] pb-2 text-white">2. PARENCHYMAL ABNORMALITIES</h2>
                  
                  {/* 2A (Full Mode Only) */}
                  {wizardData.classificationMode === 'Full' && (
                    <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg">
                      <p className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs">2A. ANY CLASSIFIABLE PARENCHYMAL ABNORMALITIES? *</p>
                      <div className="flex space-x-4">
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" name="anyParenchymal" checked={wizardData.anyParenchymal === 'Yes'} onChange={() => updateData({ anyParenchymal: 'Yes' })} className="peer hidden" />
                          <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors">Yes (Proceed to 2B & 2C)</div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" name="anyParenchymal" checked={wizardData.anyParenchymal === 'No'} onChange={() => updateData({ anyParenchymal: 'No' })} className="peer hidden" />
                          <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-gray-600 peer-checked:text-white peer-checked:border-gray-400 font-bold hover:bg-[#334155] transition-colors">No (Skip to Section 3A)</div>
                        </label>
                      </div>
                    </div>
                  )}

                  {(wizardData.classificationMode === 'Abbreviated' || wizardData.anyParenchymal === 'Yes') && (
                    <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                      {/* 2B */}
                      <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg">
                        <p className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs">{wizardData.classificationMode === 'Abbreviated' ? 'SMALL OPACITIES' : '2B. SMALL OPACITIES'}</p>
                        
                        {wizardData.classificationMode === 'Abbreviated' ? (
                          <div className="space-y-4">
                            <div>
                              <span className="block text-gray-400 mb-1 text-xs">PROFUSION CATEGORY (4-point scale) *</span>
                              <select value={wizardData.abbrevProfusion} onChange={e => updateData({ abbrevProfusion: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] text-white p-2 rounded outline-none focus:border-emerald-500">
                                <option value="-">- Select -</option>
                                <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                              </select>
                            </div>
                            <div>
                              <span className="block text-gray-400 mb-1 text-xs">PREDOMINANT SHAPE AND SIZE *</span>
                              <select value={wizardData.abbrevShape} onChange={e => updateData({ abbrevShape: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] text-white p-2 rounded outline-none focus:border-emerald-500">
                                <option value="-">- Select -</option>
                                <option value="p">p</option><option value="q">q</option><option value="r">r</option>
                                <option value="s">s</option><option value="t">t</option><option value="u">u</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">

                            <div>
                              <span className="block text-gray-400 mb-1 text-xs">a. SHAPE/SIZE *</span>
                              <div className="flex space-x-2">
                                <div className="flex-1">
                                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Primary</label>
                                  <select value={wizardData.primaryShape} onChange={e => updateData({ primaryShape: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] text-white p-2 rounded outline-none focus:border-emerald-500">
                                    <option value="-">- Select -</option><option value="p">p</option><option value="q">q</option><option value="r">r</option><option value="s">s</option><option value="t">t</option><option value="u">u</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Secondary</label>
                                  <select value={wizardData.secondaryShape} onChange={e => updateData({ secondaryShape: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] text-white p-2 rounded outline-none focus:border-emerald-500">
                                    <option value="-">- Select -</option><option value="p">p</option><option value="q">q</option><option value="r">r</option><option value="s">s</option><option value="t">t</option><option value="u">u</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-end mb-2">
                                <span className="block text-gray-400 text-xs">b. ZONES (Area of Involvement) {wizardData.profusion !== '0/-' && wizardData.profusion !== '0/0' ? '*' : ''}</span>
                                <button onClick={() => updateData({ zones: ['RU', 'RM', 'RL', 'LU', 'LM', 'LL'] })} className="text-[10px] bg-[#334155] hover:bg-emerald-600 px-2 py-1 rounded text-white transition-colors font-bold">Select All Zones</button>
                              </div>
                              <div className="flex space-x-6 text-gray-300">
                                {/* Right Lung */}
                                <div className="space-y-2 flex-1 bg-[#0f172a] p-2 rounded border border-[#475569]">
                                  <div className="text-[10px] text-gray-500 uppercase tracking-widest text-center border-b border-[#334155] pb-1 mb-2">Right Lung</div>
                                  <div className="flex flex-col items-center space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-[#1e293b] p-1.5 rounded w-24">
                                      <input type="checkbox" checked={wizardData.zones.includes('RU')} onChange={() => toggleArrayItem('zones', 'RU')} className="accent-emerald-500 w-4 h-4" />
                                      <span className="text-xs font-bold">Upper</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-[#1e293b] p-1.5 rounded w-24">
                                      <input type="checkbox" checked={wizardData.zones.includes('RM')} onChange={() => toggleArrayItem('zones', 'RM')} className="accent-emerald-500 w-4 h-4" />
                                      <span className="text-xs font-bold">Middle</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-[#1e293b] p-1.5 rounded w-24">
                                      <input type="checkbox" checked={wizardData.zones.includes('RL')} onChange={() => toggleArrayItem('zones', 'RL')} className="accent-emerald-500 w-4 h-4" />
                                      <span className="text-xs font-bold">Lower</span>
                                    </label>
                                  </div>
                                </div>
                                {/* Left Lung */}
                                <div className="space-y-2 flex-1 bg-[#0f172a] p-2 rounded border border-[#475569]">
                                  <div className="text-[10px] text-gray-500 uppercase tracking-widest text-center border-b border-[#334155] pb-1 mb-2">Left Lung</div>
                                  <div className="flex flex-col items-center space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-[#1e293b] p-1.5 rounded w-24">
                                      <input type="checkbox" checked={wizardData.zones.includes('LU')} onChange={() => toggleArrayItem('zones', 'LU')} className="accent-emerald-500 w-4 h-4" />
                                      <span className="text-xs font-bold">Upper</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-[#1e293b] p-1.5 rounded w-24">
                                      <input type="checkbox" checked={wizardData.zones.includes('LM')} onChange={() => toggleArrayItem('zones', 'LM')} className="accent-emerald-500 w-4 h-4" />
                                      <span className="text-xs font-bold">Middle</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-[#1e293b] p-1.5 rounded w-24">
                                      <input type="checkbox" checked={wizardData.zones.includes('LL')} onChange={() => toggleArrayItem('zones', 'LL')} className="accent-emerald-500 w-4 h-4" />
                                      <span className="text-xs font-bold">Lower</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <span className="block text-gray-400 mb-1 text-xs">c. PROFUSION (12-point scale) *</span>
                              <select value={wizardData.profusion} onChange={e => updateData({ profusion: e.target.value })} className="w-full bg-[#0f172a] border border-[#475569] text-white p-2 rounded outline-none focus:border-emerald-500">
                                <option value="-">- Select -</option>
                                <option value="0/-">0/-</option><option value="0/0">0/0</option><option value="0/1">0/1</option>
                                <option value="1/0">1/0</option><option value="1/1">1/1</option><option value="1/2">1/2</option>
                                <option value="2/1">2/1</option><option value="2/2">2/2</option><option value="2/3">2/3</option>
                                <option value="3/2">3/2</option><option value="3/3">3/3</option><option value="3/+">3/+</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* 2C */}
                      <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg flex flex-col">
                        <p className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs">{wizardData.classificationMode === 'Abbreviated' ? 'LARGE OPACITIES' : '2C. LARGE OPACITIES'}</p>
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          {['0', 'A', 'B', 'C'].map(size => (
                            <label key={size} className="flex-1 cursor-pointer">
                              <input type="radio" name="large_opacity" checked={wizardData.largeOpacity === size} onChange={() => updateData({ largeOpacity: size })} className="peer hidden" />
                              <div className="h-full flex items-center justify-center p-2 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors">
                                Size {size}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {visibleSteps[wizardData.currentInterpStep]?.id === '3_pleural' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold border-b border-[#334155] pb-2 text-white">3. PLEURAL ABNORMALITIES</h2>
                  
                  {/* 3A */}
                  {/* 3A */}
                  <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg">
                    <p className="mb-4 text-purple-400 font-bold uppercase tracking-widest text-xs">{wizardData.classificationMode === 'Abbreviated' ? 'PLEURAL ABNORMALITIES *' : '3A. ANY CLASSIFIABLE PLEURAL ABNORMALITIES? *'}</p>
                    <div className="flex space-x-4">
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="anyPleural" checked={wizardData.anyPleural === 'Yes'} onChange={() => updateData({ anyPleural: 'Yes' })} className="peer hidden" />
                        <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors">{wizardData.classificationMode === 'Abbreviated' ? 'Yes' : 'Yes (Proceed to 3B, 3C, 3D)'}</div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="anyPleural" checked={wizardData.anyPleural === 'No'} onChange={() => updateData({ anyPleural: 'No' })} className="peer hidden" />
                        <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-gray-600 peer-checked:text-white peer-checked:border-gray-400 font-bold hover:bg-[#334155] transition-colors">{wizardData.classificationMode === 'Abbreviated' ? 'No' : 'No (Skip to Section 4A)'}</div>
                      </label>
                    </div>
                  </div>

                  {wizardData.anyPleural === 'Yes' && (
                    <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg animate-in slide-in-from-top-4 duration-300">
                      
                      {wizardData.classificationMode === 'Abbreviated' ? (
                        <div className="space-y-6">
                          <div>
                            <p className="mb-3 text-emerald-400 font-bold uppercase tracking-widest text-xs border-b border-[#334155] pb-2">PLEURAL THICKENING - PT</p>
                            <div className="flex space-x-4">
                              {['0', 'R', 'L'].map(opt => (
                                <label key={`pt-${opt}`} className="flex items-center space-x-2 cursor-pointer bg-[#0f172a] px-4 py-2 rounded border border-[#475569] hover:border-purple-500 transition-colors">
                                  <input type="checkbox" checked={wizardData.abbrevThickening.includes(opt)} onChange={() => toggleArrayItem('abbrevThickening', opt)} className="accent-emerald-500 w-4 h-4" />
                                  <span className="text-gray-300 font-bold">{opt === '0' ? '0=None' : opt === 'R' ? 'R=Right' : 'L=Left'}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="mb-3 text-emerald-400 font-bold uppercase tracking-widest text-xs border-b border-[#334155] pb-2">PLEURAL CALCIFICATION - PC</p>
                            <div className="flex space-x-4">
                              {['0', 'R', 'L'].map(opt => (
                                <label key={`pc-${opt}`} className="flex items-center space-x-2 cursor-pointer bg-[#0f172a] px-4 py-2 rounded border border-[#475569] hover:border-purple-500 transition-colors">
                                  <input type="checkbox" checked={wizardData.abbrevCalcification.includes(opt)} onChange={() => toggleArrayItem('abbrevCalcification', opt)} className="accent-emerald-500 w-4 h-4" />
                                  <span className="text-gray-300 font-bold">{opt === '0' ? '0=None' : opt === 'R' ? 'R=Right' : 'L=Left'}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* 3B. PLEURAL PLAQUES */}
                          <div className="bg-[#0f172a] p-4 rounded border border-[#475569]">
                            <p className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs border-b border-[#334155] pb-2">3B. PLEURAL PLAQUES</p>
                            
                            <div className="grid grid-cols-4 gap-6">
                              {/* SITE */}
                              <div>
                                <span className="block text-gray-400 font-bold text-[10px] mb-2 uppercase text-center">Site</span>
                                <div className="space-y-2">
                                  {[{l:'Profile', k:'plaqueSiteProfile'}, {l:'Face on', k:'plaqueSiteFaceOn'}, {l:'Diaphragm', k:'plaqueSiteDiaphragm'}, {l:'Other', k:'plaqueSiteOther'}].map(row => (
                                    <div key={`site-${row.k}`} className="flex items-center justify-between bg-[#1e293b] p-1.5 rounded">
                                      <span className="text-[10px] text-gray-400 w-16">{row.l}</span>
                                      <div className="flex space-x-1">
                                        <button onClick={() => updateData({ [row.k]: [] })} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).length === 0 ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>O</button>
                                        <button onClick={() => toggleArrayItem(row.k as any, 'R')} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).includes('R') ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>R</button>
                                        <button onClick={() => toggleArrayItem(row.k as any, 'L')} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).includes('L') ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>L</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* CALCIFICATION */}
                              <div>
                                <span className="block text-gray-400 font-bold text-[10px] mb-2 uppercase text-center">Calcification</span>
                                <div className="space-y-2">
                                  {[{l:'Profile', k:'plaqueCalcProfile'}, {l:'Face on', k:'plaqueCalcFaceOn'}, {l:'Diaphragm', k:'plaqueCalcDiaphragm'}, {l:'Other', k:'plaqueCalcOther'}].map(row => (
                                    <div key={`calc-${row.k}`} className="flex items-center justify-between bg-[#1e293b] p-1.5 rounded">
                                      <span className="text-[10px] text-gray-400 w-16">{row.l}</span>
                                      <div className="flex space-x-1">
                                        <button onClick={() => updateData({ [row.k]: [] })} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).length === 0 ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>O</button>
                                        <button onClick={() => toggleArrayItem(row.k as any, 'R')} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).includes('R') ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>R</button>
                                        <button onClick={() => toggleArrayItem(row.k as any, 'L')} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).includes('L') ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>L</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* EXTENT */}
                              <div>
                                <span className="block text-gray-400 font-bold text-[10px] mb-2 uppercase text-center">Extent (1,2,3)</span>
                                <div className="flex justify-around bg-[#1e293b] p-2 rounded h-full">
                                  <div className="space-y-3">
                                    <div className="text-[10px] text-gray-500 font-bold text-center">R</div>
                                    {['0', '1', '2', '3'].map(val => (
                                      <label key={`extR-${val}`} className="flex flex-col items-center cursor-pointer group">
                                        <input type="radio" checked={wizardData.plaqueExtentRight === val} onChange={() => updateData({ plaqueExtentRight: val })} className="hidden" />
                                        <div className={`w-6 h-6 rounded-full border border-[#475569] flex items-center justify-center text-xs ${wizardData.plaqueExtentRight === val ? 'bg-emerald-600 text-white border-blue-500' : 'text-gray-500 group-hover:border-blue-400'}`}>
                                          {val === '0' ? 'O' : val}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="space-y-3">
                                    <div className="text-[10px] text-gray-500 font-bold text-center">L</div>
                                    {['0', '1', '2', '3'].map(val => (
                                      <label key={`extL-${val}`} className="flex flex-col items-center cursor-pointer group">
                                        <input type="radio" checked={wizardData.plaqueExtentLeft === val} onChange={() => updateData({ plaqueExtentLeft: val })} className="hidden" />
                                        <div className={`w-6 h-6 rounded-full border border-[#475569] flex items-center justify-center text-xs ${wizardData.plaqueExtentLeft === val ? 'bg-emerald-600 text-white border-blue-500' : 'text-gray-500 group-hover:border-blue-400'}`}>
                                          {val === '0' ? 'O' : val}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* WIDTH */}
                              <div>
                                <span className="block text-gray-400 font-bold text-[10px] mb-2 uppercase text-center">Width (a,b,c)</span>
                                <div className="flex justify-around bg-[#1e293b] p-2 rounded h-full">
                                  <div className="space-y-3">
                                    <div className="text-[10px] text-gray-500 font-bold text-center">R</div>
                                    {['0', 'a', 'b', 'c'].map(val => (
                                      <label key={`widR-${val}`} className="flex flex-col items-center cursor-pointer group">
                                        <input type="radio" checked={wizardData.plaqueWidthRight === val} onChange={() => updateData({ plaqueWidthRight: val })} className="hidden" />
                                        <div className={`w-6 h-6 rounded border border-[#475569] flex items-center justify-center text-xs ${wizardData.plaqueWidthRight === val ? 'bg-emerald-600 text-white border-emerald-500' : 'text-gray-500 group-hover:border-emerald-400'}`}>
                                          {val === '0' ? 'O' : val}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="space-y-3">
                                    <div className="text-[10px] text-gray-500 font-bold text-center">L</div>
                                    {['0', 'a', 'b', 'c'].map(val => (
                                      <label key={`widL-${val}`} className="flex flex-col items-center cursor-pointer group">
                                        <input type="radio" checked={wizardData.plaqueWidthLeft === val} onChange={() => updateData({ plaqueWidthLeft: val })} className="hidden" />
                                        <div className={`w-6 h-6 rounded border border-[#475569] flex items-center justify-center text-xs ${wizardData.plaqueWidthLeft === val ? 'bg-emerald-600 text-white border-emerald-500' : 'text-gray-500 group-hover:border-emerald-400'}`}>
                                          {val === '0' ? 'O' : val}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 3C. COSTOPHRENIC */}
                          <div className="bg-[#0f172a] p-4 rounded border border-[#475569] flex items-center justify-between">
                            <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">3C. COSTOPHRENIC ANGLE OBLITERATION</p>
                            <div className="flex space-x-6">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={wizardData.costophrenicRight} onChange={e => updateData({ costophrenicRight: e.target.checked })} className="w-5 h-5 accent-emerald-500" />
                                <span className="text-gray-300 font-bold">Right (R)</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={wizardData.costophrenicLeft} onChange={e => updateData({ costophrenicLeft: e.target.checked })} className="w-5 h-5 accent-emerald-500" />
                                <span className="text-gray-300 font-bold">Left (L)</span>
                              </label>
                            </div>
                          </div>

                          {/* 3D. DIFFUSE */}
                          {(wizardData.costophrenicRight || wizardData.costophrenicLeft) && (
                            <div className="bg-[#0f172a] p-4 rounded border border-[#475569]">
                            <p className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs border-b border-[#334155] pb-2">3D. DIFFUSE PLEURAL THICKENING</p>
                            
                            <div className="grid grid-cols-4 gap-6">
                              {/* SITE */}
                              <div>
                                <span className="block text-gray-400 font-bold text-[10px] mb-2 uppercase text-center">Site</span>
                                <div className="space-y-2">
                                  {[{l:'Profile', k:'diffuseSiteProfile'}, {l:'Face on', k:'diffuseSiteFaceOn'}].map(row => (
                                    <div key={`dsite-${row.k}`} className="flex items-center justify-between bg-[#1e293b] p-1.5 rounded">
                                      <span className="text-[10px] text-gray-400 w-16">{row.l}</span>
                                      <div className="flex space-x-1">
                                        <button onClick={() => updateData({ [row.k]: [] })} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).length === 0 ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>O</button>
                                        <button onClick={() => toggleArrayItem(row.k as any, 'R')} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).includes('R') ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>R</button>
                                        <button onClick={() => toggleArrayItem(row.k as any, 'L')} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).includes('L') ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>L</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* CALCIFICATION */}
                              <div>
                                <span className="block text-gray-400 font-bold text-[10px] mb-2 uppercase text-center">Calcification</span>
                                <div className="space-y-2">
                                  {[{l:'Profile', k:'diffuseCalcProfile'}, {l:'Face on', k:'diffuseCalcFaceOn'}].map(row => (
                                    <div key={`dcalc-${row.k}`} className="flex items-center justify-between bg-[#1e293b] p-1.5 rounded">
                                      <span className="text-[10px] text-gray-400 w-16">{row.l}</span>
                                      <div className="flex space-x-1">
                                        <button onClick={() => updateData({ [row.k]: [] })} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).length === 0 ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>O</button>
                                        <button onClick={() => toggleArrayItem(row.k as any, 'R')} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).includes('R') ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>R</button>
                                        <button onClick={() => toggleArrayItem(row.k as any, 'L')} className={`w-5 h-5 rounded border border-[#475569] flex items-center justify-center text-[10px] font-bold ${(wizardData[row.k as keyof typeof wizardData] as string[]).includes('L') ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-[#334155]'}`}>L</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* EXTENT */}
                              <div>
                                <span className="block text-gray-400 font-bold text-[10px] mb-2 uppercase text-center">Extent (1,2,3)</span>
                                <div className="flex justify-around bg-[#1e293b] p-2 rounded h-full">
                                  <div className="space-y-3">
                                    <div className="text-[10px] text-gray-500 font-bold text-center">R</div>
                                    {['0', '1', '2', '3'].map(val => (
                                      <label key={`dextR-${val}`} className="flex flex-col items-center cursor-pointer group">
                                        <input type="radio" checked={wizardData.diffuseExtentRight === val} onChange={() => updateData({ diffuseExtentRight: val })} className="hidden" />
                                        <div className={`w-6 h-6 rounded-full border border-[#475569] flex items-center justify-center text-xs ${wizardData.diffuseExtentRight === val ? 'bg-emerald-600 text-white border-blue-500' : 'text-gray-500 group-hover:border-blue-400'}`}>
                                          {val === '0' ? 'O' : val}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="space-y-3">
                                    <div className="text-[10px] text-gray-500 font-bold text-center">L</div>
                                    {['0', '1', '2', '3'].map(val => (
                                      <label key={`dextL-${val}`} className="flex flex-col items-center cursor-pointer group">
                                        <input type="radio" checked={wizardData.diffuseExtentLeft === val} onChange={() => updateData({ diffuseExtentLeft: val })} className="hidden" />
                                        <div className={`w-6 h-6 rounded-full border border-[#475569] flex items-center justify-center text-xs ${wizardData.diffuseExtentLeft === val ? 'bg-emerald-600 text-white border-blue-500' : 'text-gray-500 group-hover:border-blue-400'}`}>
                                          {val === '0' ? 'O' : val}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* WIDTH */}
                              <div>
                                <span className="block text-gray-400 font-bold text-[10px] mb-2 uppercase text-center">Width (a,b,c)</span>
                                <div className="flex justify-around bg-[#1e293b] p-2 rounded h-full">
                                  <div className="space-y-3">
                                    <div className="text-[10px] text-gray-500 font-bold text-center">R</div>
                                    {['0', 'a', 'b', 'c'].map(val => (
                                      <label key={`dwidR-${val}`} className="flex flex-col items-center cursor-pointer group">
                                        <input type="radio" checked={wizardData.diffuseWidthRight === val} onChange={() => updateData({ diffuseWidthRight: val })} className="hidden" />
                                        <div className={`w-6 h-6 rounded border border-[#475569] flex items-center justify-center text-xs ${wizardData.diffuseWidthRight === val ? 'bg-emerald-600 text-white border-emerald-500' : 'text-gray-500 group-hover:border-emerald-400'}`}>
                                          {val === '0' ? 'O' : val}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="space-y-3">
                                    <div className="text-[10px] text-gray-500 font-bold text-center">L</div>
                                    {['0', 'a', 'b', 'c'].map(val => (
                                      <label key={`dwidL-${val}`} className="flex flex-col items-center cursor-pointer group">
                                        <input type="radio" checked={wizardData.diffuseWidthLeft === val} onChange={() => updateData({ diffuseWidthLeft: val })} className="hidden" />
                                        <div className={`w-6 h-6 rounded border border-[#475569] flex items-center justify-center text-xs ${wizardData.diffuseWidthLeft === val ? 'bg-emerald-600 text-white border-emerald-500' : 'text-gray-500 group-hover:border-emerald-400'}`}>
                                          {val === '0' ? 'O' : val}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {visibleSteps[wizardData.currentInterpStep]?.id === '4_other' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold border-b border-[#334155] pb-2 text-white">4. OTHER ABNORMALITIES</h2>
                  
                  {/* 4A (Full Mode Only) */}
                  {wizardData.classificationMode === 'Full' && (
                    <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg">
                      <p className="mb-4 text-blue-400 font-bold uppercase tracking-widest text-xs">4A. ANY OTHER ABNORMALITIES? *</p>
                      <div className="flex space-x-4">
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" name="anyOther" checked={wizardData.anyOther === 'Yes'} onChange={() => updateData({ anyOther: 'Yes' })} className="peer hidden" />
                          <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors">Yes (Proceed to 4B, 4C)</div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" name="anyOther" checked={wizardData.anyOther === 'No'} onChange={() => updateData({ anyOther: 'No' })} className="peer hidden" />
                          <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-gray-600 peer-checked:text-white peer-checked:border-gray-400 font-bold hover:bg-[#334155] transition-colors">No (Complete Classification)</div>
                        </label>
                      </div>
                    </div>
                  )}

                  {wizardData.classificationMode === 'Abbreviated' && (
                    <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg animate-in slide-in-from-top-4 duration-300 mb-6">
                      <p className="mb-4 text-blue-400 font-bold uppercase tracking-widest text-xs border-b border-[#334155] pb-2">SYMBOLS *</p>
                      <div className="flex space-x-4 mb-6">
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" name="abbrevSymbolsPresent" checked={wizardData.abbrevSymbolsPresent === 'Yes'} onChange={() => updateData({ abbrevSymbolsPresent: 'Yes' })} className="peer hidden" />
                          <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors">Yes</div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" name="abbrevSymbolsPresent" checked={wizardData.abbrevSymbolsPresent === 'No'} onChange={() => { updateData({ abbrevSymbolsPresent: 'No', symbols: [] }); }} className="peer hidden" />
                          <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-gray-600 peer-checked:text-white peer-checked:border-gray-400 font-bold hover:bg-[#334155] transition-colors">No</div>
                        </label>
                      </div>
                      
                      {wizardData.abbrevSymbolsPresent === 'Yes' && (
                        <div className="grid grid-cols-8 gap-2 animate-in fade-in duration-300">
                          {OBLIGATORY_SYMBOLS.map(sym => (
                            <label key={sym} className="flex items-center justify-center border border-[#475569] p-2 rounded hover:bg-[#334155] cursor-pointer transition-colors">
                              <input type="checkbox" checked={wizardData.symbols.includes(sym)} onChange={() => toggleArrayItem('symbols', sym)} className="hidden peer" />
                              <span className="font-mono font-bold uppercase text-gray-400 peer-checked:text-emerald-400">{sym}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(wizardData.classificationMode === 'Full' && wizardData.anyOther === 'Yes') && (
                    <>
                      {/* 4B */}
                      <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg animate-in slide-in-from-top-4 duration-300">
                        <p className="mb-4 text-blue-400 font-bold uppercase tracking-widest text-xs border-b border-[#334155] pb-2">4B. OTHER SYMBOLS (OBLIGATORY)</p>
                        <div className="grid grid-cols-8 gap-2">
                          {OBLIGATORY_SYMBOLS.map(sym => (
                            <label key={sym} title={OBLIGATORY_SYMBOLS_FULL[sym]} className="flex items-center justify-center border border-[#475569] p-2 rounded hover:bg-[#334155] cursor-pointer transition-colors">
                              <input type="checkbox" checked={wizardData.symbols.includes(sym)} onChange={() => toggleArrayItem('symbols', sym)} className="hidden peer" />
                              <span className="font-mono font-bold uppercase text-gray-400 peer-checked:text-emerald-400">{sym}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* 4C */}
                      {wizardData.classificationMode === 'Full' && (
                        <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg animate-in slide-in-from-top-4 duration-300">
                          <p className="mb-4 text-gray-400 font-bold uppercase tracking-widest text-xs">4C. Should Patient/Worker/Employee see personal physician because of findings in section 4? *</p>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="seePhys" checked={wizardData.seePhysician === 'Yes'} onChange={() => updateData({ seePhysician: 'Yes' })} className="accent-emerald-500 w-5 h-5" />
                              <span className="text-white font-bold">Yes</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="seePhys" checked={wizardData.seePhysician === 'No'} onChange={() => updateData({ seePhysician: 'No' })} className="accent-emerald-500 w-5 h-5" />
                              <span className="text-white font-bold">No</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* COMMENTS (Always visible at bottom of Step 4) */}
                  <div className="bg-[#1e293b] p-6 border border-[#334155] shadow-sm rounded-lg">
                    <p className="mb-4 text-blue-400 font-bold uppercase tracking-widest text-xs">COMMENTS</p>
                    <div className="flex space-x-4 mb-4">
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="hasComments" checked={wizardData.hasComments === 'Yes'} onChange={() => updateData({ hasComments: 'Yes' })} className="peer hidden" />
                        <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 font-bold hover:bg-[#334155] transition-colors">Yes</div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="hasComments" checked={wizardData.hasComments === 'No'} onChange={() => updateData({ hasComments: 'No' })} className="peer hidden" />
                        <div className="p-4 border border-[#475569] text-center rounded peer-checked:bg-gray-600 peer-checked:text-white peer-checked:border-gray-400 font-bold hover:bg-[#334155] transition-colors">No</div>
                      </label>
                    </div>
                    {wizardData.hasComments === 'Yes' && (
                      <div className="animate-in fade-in duration-300">
                        <textarea maxLength={1500} value={wizardData.commentsText} onChange={e => updateData({ commentsText: e.target.value })} placeholder="Enter comments here (max 250 words)..." className="w-full bg-[#0f172a] border border-[#475569] rounded p-3 text-white outline-none focus:border-emerald-500 min-h-[120px]"></textarea>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Controls */}
            <div className="p-8 border-t border-[#334155] flex justify-between bg-[#0f172a]">
              <button 
                onClick={prevStep}
                className="flex items-center space-x-2 px-6 py-2 rounded font-bold transition-colors bg-[#334155] hover:bg-[#475569] text-white"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              
              {wizardData.currentInterpStep < visibleSteps.length - 1 && wizardData.qualityGrade !== '4' ? (
                <button 
                  onClick={nextStep}
                  disabled={!canProceedInterp(wizardData.currentInterpStep)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded font-bold transition-colors ${!canProceedInterp(wizardData.currentInterpStep) ? 'bg-emerald-900/50 text-emerald-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                >
                  <span>Next Step</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  disabled={!canProceedInterp(wizardData.currentInterpStep)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded font-bold transition-colors ${!canProceedInterp(wizardData.currentInterpStep) ? 'bg-blue-900/50 text-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'}`}
                  onClick={async () => {
                    await generatePDF();
                  }}
                >
                  <Save size={16} />
                  <span>Save & Generate PDF</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Developer & Documentation Footer Box (Compact) */}
        <div className="mt-6 bg-[#1e293b] border border-[#334155] p-3 rounded-lg shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pl-3">
            <div className="text-gray-300 text-xs flex-1">
              <p className="font-bold text-gray-400 text-xs mb-1">Version: 1.0.0</p>
              <p className="font-bold text-blue-300 text-sm mb-0.5">Developed by Dr. Arkaprabha Sau</p>
              <p className="font-medium text-gray-200">MBBS, MD (Gold Medalist), DPH, Dip. Geriatric Medicine, CCEBDM</p>
              <p className="font-medium text-gray-200 mt-0.5 text-[10px] md:text-xs">Ph.D. (Computer Science and Engineering: AI & ML in Healthcare)</p>
              <p className="font-medium text-blue-200 mt-1 text-[10px] md:text-xs">If any bug or any issue please email to: arka.doctor@gmail.com</p>
            </div>
            
            <div className="flex flex-row space-x-2 w-full md:w-auto">
              <a href="/ILO-2022.pdf" target="_blank" rel="noreferrer" className="bg-[#0f172a] hover:bg-blue-600 border border-[#334155] hover:border-blue-500 text-gray-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-md flex-1 md:flex-none">
                <ExternalLink size={12} />
                <span>ILO_2022</span>
              </a>
              <a href="/ILO_2022-28-29.pdf" target="_blank" rel="noreferrer" className="bg-[#0f172a] hover:bg-blue-600 border border-[#334155] hover:border-blue-500 text-gray-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-md flex-1 md:flex-none">
                <ExternalLink size={12} />
                <span>ILO_2020 (28-29)</span>
              </a>
              <a href="https://arka1985.github.io/ILO_RAD/" target="_blank" rel="noreferrer" className="bg-[#0f172a] hover:bg-gray-700 border border-[#334155] hover:border-gray-500 text-gray-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-md flex-1 md:flex-none" title="Check GitHub for Updates">
                <RefreshCw size={12} />
                <span>Updates</span>
              </a>
            </div>
          </div>
        </div>

        {/* History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#0f172a] border border-[#334155] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#1e293b] rounded-t-lg">
                <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                  <Search size={18} />
                  <span>Search Previous Patients</span>
                </h3>
                <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 border-b border-[#334155]">
                <input 
                  type="text" 
                  placeholder="Search by Patient Name or ID..." 
                  value={historySearch} 
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#475569] text-white px-4 py-3 rounded outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {historyData.filter(r => 
                  (r.patientName || '').toLowerCase().includes(historySearch.toLowerCase()) || 
                  (r.patientId || '').toLowerCase().includes(historySearch.toLowerCase())
                ).map((report, idx) => (
                  <div key={idx} className="bg-[#1e293b] border border-[#334155] p-4 rounded hover:border-emerald-500 transition-colors flex justify-between items-center group">
                    <div>
                      <p className="text-white font-bold text-lg">{report.patientName} <span className="text-gray-400 text-sm font-normal">({report.patientId})</span></p>
                      <p className="text-gray-400 text-sm mt-1">Report Date: {report.historyDate || 'Unknown'} | Mode: {report.classificationMode}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteHistoricalPatient(report.historyId); }}
                        className="bg-red-900/50 hover:bg-red-600 text-red-200 px-3 py-2 rounded transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Delete this record"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => loadHistoricalPatient(report)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      >
                        Load Demographics
                      </button>
                    </div>
                  </div>
                ))}
                {historyData.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No previous reports found on this device.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* HIDDEN REPORT TEMPLATE FOR PDF */}
    <div id="pdf-report-container" className="hidden print:block print:w-[210mm] print:mx-auto print:bg-white print:text-black">
      <ILOReportTemplate data={wizardData} />
    </div>
  </>
);
}
