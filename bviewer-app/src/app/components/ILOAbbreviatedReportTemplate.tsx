import React from 'react';

// The data structure based on WizardData from page.tsx
export interface ILOReportProps {
  data: any;
}

const Checkbox = ({ checked, label, className = "", boxClass = "w-4 h-4", style }: { checked: boolean, label?: string, className?: string, boxClass?: string, style?: React.CSSProperties }) => (
  <span className={`inline-block whitespace-nowrap align-middle ${className}`} style={{ lineHeight: '1', ...style }}>
    <span className={`inline-block ${boxClass} border ${checked ? 'border-black text-black font-extrabold' : 'border-[#ef4444] text-transparent'} text-center text-[12px] align-middle bg-white overflow-hidden`} style={{ lineHeight: boxClass.includes('22px') ? '20px' : '14px' }}>
      {checked ? 'X' : '\u00A0'}
    </span>
    {label && <span className="align-middle ml-1.5 text-black text-[11px] whitespace-normal">{label}</span>}
  </span>
);

const LetterBox = ({ checked, label, className = "" }: { checked: boolean, label: string, className?: string }) => (
  <span className={`relative inline-block w-[22px] h-[22px] border ${checked ? 'border-black text-black' : 'border-[#ef4444] text-[#ef4444]'} bg-white text-center text-[12px] align-middle overflow-hidden ${className}`} style={{ lineHeight: '20px' }}>
    <span className="relative z-10">{label}</span>
    {checked && (
      <span className="absolute text-black font-normal" style={{ fontSize: '22px', left: 0, top: 0, width: '100%', height: '100%', lineHeight: '20px', textAlign: 'center', zIndex: 20 }}>
        X
      </span>
    )}
  </span>
);

export const ILOAbbreviatedReportTemplate: React.FC<ILOReportProps> = ({ data }) => {
  const isEssentiallyNormal = data.isEssentiallyNormal === 'Yes';
  const isUnreadable = data.qualityGrade === '4';
  
  // Abnormalities override
  const anyParenchymal = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyParenchymal);
  const anyPleural = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyPleural);
  const anyOther = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyOther);
  
  const OBLIGATORY_SYMBOLS = ['aa', 'at', 'ax', 'bu', 'ca', 'cg', 'cn', 'co', 'cp', 'cv', 'di', 'ef', 'em', 'es', 'fr', 'hi', 'ho', 'id', 'ih', 'kl', 'me', 'pa', 'pb', 'pi', 'px', 'ra', 'rp', 'tb'];

  // Handle abbreviated specific mappings
  const profusion = isUnreadable || isEssentiallyNormal ? null : data.abbrevProfusion;
  const shape = isUnreadable || isEssentiallyNormal ? null : data.abbrevShape;
  const largeOpacity = isUnreadable || isEssentiallyNormal ? null : data.largeOpacity;
  const thickening = isUnreadable || isEssentiallyNormal ? [] : (data.abbrevThickening || []);
  const calcification = isUnreadable || isEssentiallyNormal ? [] : (data.abbrevCalcification || []);
  const symbols = isUnreadable || isEssentiallyNormal ? [] : (data.symbols || []);

  return (
    <div id="ilo-abbrev-report-template" className="bg-white text-[#1e1b4b] p-4 font-sans text-xs mx-auto" style={{ width: '210mm', boxSizing: 'border-box' }}>
      
      <div className="text-center font-bold text-lg mb-4 text-black border-b-2 border-black pb-2">
        ILO ABBREVIATED RECORD FORM OF CLASSIFICATION OF RADIOGRAPHS FOR PNEUMOCONIOSES
      </div>

      {/* Header Info Block */}
      <div className="mb-4 text-[10px] grid grid-cols-2 gap-4 border-b-2 border-[#1e1b4b] pb-2 text-black">
        <div>
          <p><span className="font-bold">Patient ID:</span> {data.patientId || 'N/A'}</p>
          <p><span className="font-bold">Patient Name:</span> {data.patientName || 'N/A'}</p>
          <p><span className="font-bold">Address/PIN:</span> {data.patientAddress || 'N/A'}</p>
          <p><span className="font-bold">Radiograph Date:</span> {data.radiographDate || 'N/A'} &nbsp; | &nbsp; <span className="font-bold">Reading Date:</span> {data.readingDate || 'N/A'}</p>
        </div>
        <div>
          <p><span className="font-bold">Reader Name:</span> {data.classifyingPhysician || 'N/A'}</p>
          <p><span className="font-bold">Classification Mode:</span> {data.classificationMode} &nbsp; | &nbsp; <span className="font-bold">Purpose:</span> {data.classificationPurpose === 'Other' ? data.classificationPurposeOtherText : data.classificationPurpose}</p>
        </div>
      </div>

      <div className="border-2 border-[#1e1b4b] p-4 text-black text-sm mb-4">
        
        {/* 1. IMAGE QUALITY */}
        <div className="mb-6 border-b border-gray-300 pb-4">
          <h3 className="font-bold mb-2">1. Radiograph Quality</h3>
          <div className="flex space-x-6 items-center mb-2">
            <div className="flex items-center space-x-2">
              <span>Grade:</span>
              <LetterBox checked={data.qualityGrade === '1'} label="1" className="w-6 h-6" />
              <LetterBox checked={data.qualityGrade === '2'} label="2" className="w-6 h-6" />
              <LetterBox checked={data.qualityGrade === '3'} label="3" className="w-6 h-6" />
              <LetterBox checked={data.qualityGrade === '4'} label="4" className="w-6 h-6" />
            </div>
            {data.qualityGrade && data.qualityGrade !== '1' && (
              <div className="flex-1 ml-4 text-xs">
                <span className="font-bold">Defects:</span> {data.abbrevQualityComment}
              </div>
            )}
          </div>
        </div>

        {/* ESSENTIALLY NORMAL OVERALL ASSESSMENT */}
        <div className="mb-6 border-b border-gray-300 pb-4 bg-gray-50/50 p-2 rounded">
          <div className="flex items-center space-x-6">
            <span className="font-bold text-[13px] text-black uppercase">Based on history, signs, and symptoms, and best of your clinical judgement is this essentially a normal X-ray?</span>
            <div className="flex space-x-4">
              <span className="flex items-center font-bold text-black text-sm"><Checkbox checked={data.isEssentiallyNormal === 'Yes'} boxClass="w-5 h-5 mr-1" /> Yes</span>
              <span className="flex items-center font-bold text-black text-sm"><Checkbox checked={data.isEssentiallyNormal === 'No'} boxClass="w-5 h-5 mr-1" /> No</span>
            </div>
          </div>
        </div>

        {/* 2. PARENCHYMAL ABNORMALITIES */}
        <div className="mb-6 border-b border-gray-300 pb-4">
          <h3 className="font-bold mb-4">2. Parenchymal Abnormalities</h3>
          <div className={`grid grid-cols-2 gap-6 ${isEssentiallyNormal || isUnreadable ? 'opacity-30' : ''}`}>
            <div>
              <p className="font-bold mb-1 text-xs uppercase">Small Opacities</p>
              <div className="flex space-x-4 mb-2">
                <span>Profusion:</span>
                <LetterBox checked={profusion === '0'} label="0" />
                <LetterBox checked={profusion === '1'} label="1" />
                <LetterBox checked={profusion === '2'} label="2" />
                <LetterBox checked={profusion === '3'} label="3" />
              </div>
              <div className="flex space-x-4">
                <span>Predominant Shape:</span>
                <LetterBox checked={shape === 'p'} label="p" />
                <LetterBox checked={shape === 'q'} label="q" />
                <LetterBox checked={shape === 'r'} label="r" />
                <LetterBox checked={shape === 's'} label="s" />
                <LetterBox checked={shape === 't'} label="t" />
                <LetterBox checked={shape === 'u'} label="u" />
              </div>
            </div>
            <div>
              <p className="font-bold mb-1 text-xs uppercase">Large Opacities</p>
              <div className="flex space-x-2">
                <LetterBox checked={largeOpacity === 'O'} label="O" />
                <LetterBox checked={largeOpacity === 'A'} label="A" />
                <LetterBox checked={largeOpacity === 'B'} label="B" />
                <LetterBox checked={largeOpacity === 'C'} label="C" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. PLEURAL ABNORMALITIES */}
        <div className="mb-6 border-b border-gray-300 pb-4">
          <h3 className="font-bold mb-4">3. Pleural Abnormalities <span className="italic font-normal text-xs ml-4">(0 = None, R = Right, L = Left)</span></h3>
          <div className={`grid grid-cols-2 gap-4 ${isEssentiallyNormal || isUnreadable ? 'opacity-30' : ''}`}>
            <div>
              <p className="font-bold mb-2">PLEURAL THICKENING - PT</p>
              <div className="flex space-x-4">
                <span className="flex items-center"><Checkbox checked={thickening.includes('0')} boxClass="w-5 h-5 mr-1" /> 0</span>
                <span className="flex items-center"><Checkbox checked={thickening.includes('R')} boxClass="w-5 h-5 mr-1" /> R</span>
                <span className="flex items-center"><Checkbox checked={thickening.includes('L')} boxClass="w-5 h-5 mr-1" /> L</span>
              </div>
            </div>
            <div>
              <p className="font-bold mb-2">PLEURAL CALCIFICATION - PC</p>
              <div className="flex space-x-4">
                <span className="flex items-center"><Checkbox checked={calcification.includes('0')} boxClass="w-5 h-5 mr-1" /> 0</span>
                <span className="flex items-center"><Checkbox checked={calcification.includes('R')} boxClass="w-5 h-5 mr-1" /> R</span>
                <span className="flex items-center"><Checkbox checked={calcification.includes('L')} boxClass="w-5 h-5 mr-1" /> L</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. OTHER ABNORMALITIES (SYMBOLS) */}
        <div>
          <h3 className="font-bold mb-2">4. Other Abnormalities</h3>
          <div className={`flex flex-wrap gap-1 ${isEssentiallyNormal || isUnreadable ? 'opacity-30' : ''}`}>
            {OBLIGATORY_SYMBOLS.map(sym => (
              <LetterBox key={sym} checked={symbols.includes(sym)} label={sym} className="w-auto px-1" />
            ))}
            <LetterBox checked={symbols.includes('OD')} label="OD" className="w-auto px-1" />
          </div>
        </div>
      </div>

      {/* COMMENTS */}
      {data.hasComments === 'Yes' && data.commentsText && (
        <div className="mt-2 mb-4">
          <h3 className="text-[12px] text-black font-bold mb-0.5">COMMENTS:</h3>
          <div className="p-2 border border-gray-300 rounded min-h-[40px] text-xs text-gray-800 whitespace-pre-wrap">
            {data.commentsText}
          </div>
        </div>
      )}
      
      {isUnreadable && (
        <div className="mt-4 mb-2 p-2 border-2 border-red-500 bg-red-50 text-red-900 font-bold text-[14px] text-center rounded">
          ADVICE: The radiograph is Unacceptable for classification purposes (Grade 4). A re-Xray is required.
        </div>
      )}

      {/* SIGNATURE BLOCK (SECTION 5) */}
      <div className="mt-4 border border-[#1e1b4b]">
        <div className="bg-gray-50/50 p-1.5 border-b border-[#1e1b4b]">
          <h3 className="text-[13px] text-black font-bold">5. CLASSIFYING PHYSICIAN DETAILS</h3>
        </div>
        <div className="p-2 grid grid-cols-2 gap-4">
          <div>
            <p className="mb-3 text-base text-black">_______________________________________</p>
            <p className="font-bold text-black text-[10px]">Signature of Classifying Physician</p>
            <p className="text-[11px] font-bold text-black mt-1">{data.classifyingPhysician || 'Reader Name'}</p>
            {data.physicianQualification && (
              <p className="text-[9px] text-gray-600 max-w-[250px] leading-tight mt-0.5">
                {Array.isArray(data.physicianQualification) 
                  ? [...data.physicianQualification.filter((q: string) => q !== 'Others'), ...(data.physicianQualification.includes('Others') && data.physicianQualificationOtherText ? [data.physicianQualificationOtherText] : [])].join(', ') 
                  : data.physicianQualification}
              </p>
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="font-bold text-black mb-0.5">Radiology Facility:</p>
                <p className="text-gray-800">{data.facility || '_______________________'}</p>
              </div>
              <div>
                <p className="font-bold text-black mb-0.5">Ordering Physician:</p>
                <p className="text-gray-800">{data.orderingPhysician || '_______________________'}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-1 text-base text-black">_______________________</p>
              <p className="font-bold text-black text-[10px]">Date</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
