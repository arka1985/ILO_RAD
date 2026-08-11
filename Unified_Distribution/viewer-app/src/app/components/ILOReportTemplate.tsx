import React from 'react';

export interface ILOReportProps {
  data: any;
}

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

const Checkbox = ({ checked, label, className = "", boxClass = "w-4 h-4", style }: { checked: boolean, label?: string, className?: string, boxClass?: string, style?: React.CSSProperties }) => (
  <span className={`inline-block whitespace-nowrap align-middle ${className}`} style={{ lineHeight: '1', ...style }}>
    <span className={`inline-block ${boxClass} border ${checked ? 'border-black text-black font-extrabold' : 'border-[#ef4444] text-transparent'} text-center text-[12px] align-middle bg-white overflow-hidden`} style={{ lineHeight: boxClass.includes('22px') ? '20px' : '14px' }}>
      {checked ? 'X' : '\u00A0'}
    </span>
    {label && <span className="align-middle ml-1.5 text-black text-[11px] whitespace-normal">{label}</span>}
  </span>
);

export const ILOReportTemplate: React.FC<ILOReportProps> = ({ data }) => {
  const isEssentiallyNormal = data.isEssentiallyNormal === 'Yes';
  const isUnreadable = data.qualityGrade === '4';
  
  // Abnormalities override
  const anyParenchymal = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyParenchymal);
  const anyPleural = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyPleural);
  const anyOther = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyOther);
  
  const showPleuralDetails = !isUnreadable && anyPleural === 'Yes';
  const showParenchymalDetails = !isUnreadable && anyParenchymal === 'Yes';
  
  const pData = { ...data };
  if (isUnreadable || anyParenchymal === 'No') {
      pData.primaryShape = null;
      pData.secondaryShape = null;
      pData.zones = [];
      pData.profusion = null;
      pData.largeOpacity = null;
  }
  if (isUnreadable || anyPleural === 'No') {
      pData.plaqueSiteProfile = [];
      pData.plaqueSiteFaceOn = [];
      pData.plaqueSiteDiaphragm = [];
      pData.plaqueSiteOther = [];
      pData.plaqueCalcProfile = [];
      pData.plaqueCalcFaceOn = [];
      pData.plaqueCalcDiaphragm = [];
      pData.plaqueCalcOther = [];
      pData.plaqueExtentRight = null;
      pData.plaqueExtentLeft = null;
      pData.plaqueWidthRight = null;
      pData.plaqueWidthLeft = null;
      pData.costophrenicRight = false;
      pData.costophrenicLeft = false;
      pData.diffuseSiteProfile = [];
      pData.diffuseSiteFaceOn = [];
      pData.diffuseCalcProfile = [];
      pData.diffuseCalcFaceOn = [];
      pData.diffuseExtentRight = null;
      pData.diffuseExtentLeft = null;
      pData.diffuseWidthRight = null;
      pData.diffuseWidthLeft = null;
  }
  if (isUnreadable || anyOther === 'No') {
      pData.obligatorySymbols = [];
      pData.otherComments = '';
  }
  
  const OBLIGATORY_SYMBOLS = ['aa', 'at', 'ax', 'bu', 'ca', 'cg', 'cn', 'co', 'cp', 'cv', 'di', 'ef', 'em', 'es', 'fr', 'hi', 'ho', 'id', 'ih', 'kl', 'me', 'pa', 'pb', 'pi', 'px', 'ra', 'rp', 'tb'];

  return (
    <div id="ilo-report-template" className="bg-white text-[#1e1b4b] p-3 font-sans text-xs mx-auto" style={{ width: '210mm', boxSizing: 'border-box' }}>
      
      {/* Header Info Block (Not in standard image but needed for reporting) */}
      <div className="mb-2 text-[10px] grid grid-cols-2 gap-4 border-b-2 border-[#1e1b4b] pb-2">
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

      <div className="border border-[#1e1b4b]">
        
        {/* 1. IMAGE QUALITY */}
        <div className="flex border-b border-[#1e1b4b] p-1.5">
          <div className="w-[30%]">
            <h3 className="text-[13px] mb-1 text-black font-bold">1. IMAGE QUALITY</h3>
            <div className="flex space-x-2 mb-1 ml-4">
              {['1', '2', '3', '4'].map(g => (
                <div key={g} className="flex flex-col items-center">
                  <span className={`inline-flex w-5 h-5 border ${data.qualityGrade === g ? 'border-black text-black font-extrabold' : 'border-[#ef4444] text-transparent'} text-center text-sm items-center justify-center bg-white`}>
                    {data.qualityGrade === g ? 'X' : '\u00A0'}
                  </span>
                  <span className="text-[10px] mt-1 text-black font-bold">{g}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] mt-1 leading-tight text-black ml-1">(If not grade 1, mark<br/>all boxes that apply)</p>
          </div>
          <div className="w-[70%] grid grid-cols-4 gap-y-1 gap-x-2 content-start">
            <Checkbox checked={data.qualityDefects?.includes('Overexposed (dark)')} label="Overexposed (dark)" />
            <Checkbox checked={data.qualityDefects?.includes('Improper position')} label="Improper position" />
            <Checkbox checked={data.qualityDefects?.includes('Underinflation')} label="Underinflation" />
            <Checkbox checked={data.qualityDefects?.includes('Scapula Overlay')} label="Scapula Overlay"  />
            
            <Checkbox checked={data.qualityDefects?.includes('Underexposed (light)')} label="Underexposed (light)" />
            <Checkbox checked={data.qualityDefects?.includes('Poor contrast')} label="Poor contrast" />
            <Checkbox checked={data.qualityDefects?.includes('Mottle')} label="Mottle" />
            <div className="flex items-start" >
              <Checkbox checked={data.qualityDefects?.includes('Other')} label="Other" />
              <div className="flex flex-col ml-1">
                <span className="text-[9px] leading-tight">(please specify)</span>
                <span className="border-b border-black text-[9px] mt-1 h-3">{data.qualityDefectsOtherText || '\u00A0'}</span>
              </div>
            </div>

            <Checkbox checked={data.qualityDefects?.includes('Artifacts')} label="Artifacts" />
            <Checkbox checked={data.qualityDefects?.includes('Poor processing')} label="Poor processing" />
            <Checkbox checked={data.qualityDefects?.includes('Excessive edge enhancement')} label="Excessive edge enhancement" />
          </div>
        </div>

        {/* 2A. ANY CLASSIFIABLE PARENCHYMAL ABNORMALITIES? */}
        <div className="flex justify-between items-center border-b border-[#1e1b4b] p-1.5 bg-gray-50/50">
          <h3 className="text-[13px] text-black font-bold">2A. ANY CLASSIFIABLE PARENCHYMAL ABNORMALITIES?</h3>
          <div className="flex items-center space-x-6 mr-4">
            <div className="flex items-center space-x-2">
              <span className="text-black">Yes</span>
              <Checkbox checked={anyParenchymal === 'Yes'} boxClass="w-5 h-5" />
              <span className="text-[9px] leading-tight w-24 text-black">Complete Sections<br/>2B and 2C</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-black">No</span>
              <Checkbox checked={anyParenchymal === 'No'} boxClass="w-5 h-5" />
              <span className="text-[9px] leading-tight w-20 text-black">Proceed to<br/>Section 3A</span>
            </div>
          </div>
        </div>

        {/* 2B. SMALL OPACITIES & 2C. LARGE OPACITIES */}
        <div className="flex border-b border-[#1e1b4b]">
          {/* 2B */}
          <div className="w-[65%] border-r border-[#1e1b4b] p-1.5">
            <h3 className="text-[13px] mb-2 text-black font-bold">2B. SMALL OPACITIES</h3>
            <div className="flex justify-around items-start">
              
              {/* SHAPE/SIZE */}
              <div className="flex flex-col items-center">
                <p className="text-[10px] mb-1 text-black uppercase">a. SHAPE/SIZE</p>
                <div className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    <p className="text-[9px] mb-1 text-black uppercase">PRIMARY</p>
                    <div className="grid grid-cols-2 gap-[2px]">
                      {['p','s','q','t','r','u'].map(s => (
                        <LetterBox key={`pri-${s}`} checked={pData.primaryShape === s} label={s} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-[9px] mb-1 text-black uppercase">SECONDARY</p>
                    <div className="grid grid-cols-2 gap-[2px]">
                      {['p','s','q','t','r','u'].map(s => (
                        <LetterBox key={`sec-${s}`} checked={pData.secondaryShape === s} label={s} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ZONES */}
              <div className="flex flex-col items-center">
                <p className="text-[10px] mb-1 text-black uppercase">b. ZONES</p>
                <div className="grid grid-cols-3 gap-x-1 gap-y-1 items-center">
                  <div className="col-start-2 text-center text-[10px] font-bold text-black">R</div>
                  <div className="col-start-3 text-center text-[10px] font-bold text-black">L</div>
                  
                  <div className="text-right text-[9px] pr-1 text-black uppercase">UPPER</div>
                  <Checkbox checked={pData.zones?.includes('RU')} boxClass="w-[22px] h-[22px]" />
                  <Checkbox checked={pData.zones?.includes('LU')} boxClass="w-[22px] h-[22px]" />
                  
                  <div className="text-right text-[9px] pr-1 text-black uppercase">MIDDLE</div>
                  <Checkbox checked={pData.zones?.includes('RM')} boxClass="w-[22px] h-[22px]" />
                  <Checkbox checked={pData.zones?.includes('LM')} boxClass="w-[22px] h-[22px]" />

                  <div className="text-right text-[9px] pr-1 text-black uppercase">LOWER</div>
                  <Checkbox checked={pData.zones?.includes('RL')} boxClass="w-[22px] h-[22px]" />
                  <Checkbox checked={pData.zones?.includes('LL')} boxClass="w-[22px] h-[22px]" />
                </div>
              </div>

              {/* PROFUSION */}
              <div className="flex flex-col items-center">
                <p className="text-[10px] mb-1 text-black uppercase">c. PROFUSION</p>
                <div className="grid grid-cols-3 gap-[2px]">
                  {['0/-', '0/0', '0/1', '1/0', '1/1', '1/2', '2/1', '2/2', '2/3', '3/2', '3/3', '3/+'].map(p => (
                    <LetterBox key={p} className="w-7 h-6" checked={pData.profusion === p} label={p} />
                  ))}
                </div>
              </div>

            </div>
          </div>
          
          {/* 2C */}
          <div className="w-[35%] p-1.5">
            <h3 className="text-[13px] mb-6 text-black font-bold">2C. LARGE OPACITIES</h3>
            <div className="flex items-center space-x-2 pl-4">
              <span className="text-[10px] text-black">SIZE</span>
              {['O', 'A', 'B', 'C'].map(o => (
                <LetterBox key={o} checked={pData.largeOpacity === o && showParenchymalDetails} label={o} />
              ))}
              <span className="text-[9px] ml-2 text-black leading-tight">Proceed to<br/>Section 3A</span>
            </div>
          </div>
        </div>

        {/* 3A. ANY CLASSIFIABLE PLEURAL ABNORMALITIES? */}
        <div className="flex justify-between items-center border-b border-[#1e1b4b] p-1.5 bg-gray-50/50">
          <h3 className="text-[13px] text-black font-bold">3A. ANY CLASSIFIABLE PLEURAL ABNORMALITIES?</h3>
          <div className="flex items-center space-x-6 mr-4">
            <div className="flex items-center space-x-2">
              <span className="text-black">Yes</span>
              <Checkbox checked={anyPleural === 'Yes'} boxClass="w-5 h-5" />
              <span className="text-[9px] leading-tight w-24 text-black">Complete Sections<br/>3B and 3C</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-black">No</span>
              <Checkbox checked={anyPleural === 'No'} boxClass="w-5 h-5" />
              <span className="text-[9px] leading-tight w-20 text-black">Proceed to<br/>Section 4A</span>
            </div>
          </div>
        </div>

        {/* 3B. PLEURAL PLAQUES */}
        <div className="border-b border-[#1e1b4b] p-1.5">
          <h3 className="text-[13px] text-black mb-1 font-bold">3B. PLEURAL PLAQUES <span className="italic text-[11px] font-normal">(mark site, calcification, extent, and width)</span></h3>
          <div className="flex mt-1 ml-2">
            {/* Chest Wall / Site */}
            <div className="w-[20%] border-r border-[#1e1b4b] pr-2">
              <div className="flex justify-between text-[10px] italic text-black mb-1">
                <span>Chest wall</span><span>Site</span>
              </div>
              <div className="space-y-[2px]">
                <div className="flex justify-between items-center text-[10px] text-black">
                  <span>In profile</span>
                  <div className="flex space-x-[2px]">
                    {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.plaqueSiteProfile?.length) || pData.plaqueSiteProfile?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-black">
                  <span>Face on</span>
                  <div className="flex space-x-[2px]">
                    {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.plaqueSiteFaceOn?.length) || pData.plaqueSiteFaceOn?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-black">
                  <span>Diaphragm</span>
                  <div className="flex space-x-[2px]">
                    {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.plaqueSiteDiaphragm?.length) || pData.plaqueSiteDiaphragm?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-black">
                  <span>Other site(s)</span>
                  <div className="flex space-x-[2px]">
                    {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.plaqueSiteOther?.length) || pData.plaqueSiteOther?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Calcification */}
            <div className="w-[18%] border-r border-[#1e1b4b] px-4">
              <div className="text-center text-[10px] italic text-black mb-1">
                <span>Calcification</span>
              </div>
              <div className="space-y-[2px] flex flex-col items-center">
                <div className="flex space-x-[2px]">
                  {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.plaqueCalcProfile?.length) || pData.plaqueCalcProfile?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                </div>
                <div className="flex space-x-[2px]">
                  {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.plaqueCalcFaceOn?.length) || pData.plaqueCalcFaceOn?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                </div>
                <div className="flex space-x-[2px]">
                  {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.plaqueCalcDiaphragm?.length) || pData.plaqueCalcDiaphragm?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                </div>
                <div className="flex space-x-[2px]">
                  {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.plaqueCalcOther?.length) || pData.plaqueCalcOther?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                </div>
              </div>
            </div>

            {/* Extent */}
            <div className="w-[30%] border-r border-[#1e1b4b] px-2">
              <div className="text-center text-[9px] italic text-black mb-1 leading-tight">
                <span>Extent (chest wall; combined<br/>for in profile and face on)</span>
              </div>
              <div className="text-[9px] text-black flex flex-col items-center leading-tight mb-1">
                <p>Up to 1/4 of lateral chest wall = 1</p>
                <p>1/4 to 1/2 of lateral chest wall = 2</p>
                <p>&gt; 1/2 of lateral chest wall = 3</p>
              </div>
              <div className="flex justify-center space-x-6 mt-1">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-[2px]">
                    <LetterBox checked={showPleuralDetails && (!pData.plaqueExtentRight || pData.plaqueExtentRight === '0')} label="O" className="w-5 h-5 text-[9px]" />
                    <LetterBox checked={(!!pData.plaqueExtentRight && pData.plaqueExtentRight !== '0')} label="R" className="w-5 h-5 text-[9px]" />
                  </div>
                  <div className="flex space-x-[2px]">
                    {['1','2','3'].map(v => <LetterBox key={v} checked={pData.plaqueExtentRight === v} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-[2px]">
                    <LetterBox checked={showPleuralDetails && (!pData.plaqueExtentLeft || pData.plaqueExtentLeft === '0')} label="O" className="w-5 h-5 text-[9px]" />
                    <LetterBox checked={(!!pData.plaqueExtentLeft && pData.plaqueExtentLeft !== '0')} label="L" className="w-5 h-5 text-[9px]" />
                  </div>
                  <div className="flex space-x-[2px]">
                    {['1','2','3'].map(v => <LetterBox key={v} checked={pData.plaqueExtentLeft === v} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Width */}
            <div className="w-[32%] px-2">
              <div className="text-center text-[9px] italic text-black mb-1 leading-tight">
                <span>Width (in profile only)<br/>(3mm minimum width required)</span>
              </div>
              <div className="text-[9px] text-black flex flex-col items-center leading-tight mb-1">
                <p>3 to 5 mm = a</p>
                <p>5 to 10 mm = b</p>
                <p>&gt; 10 mm = c</p>
              </div>
              <div className="flex justify-center space-x-4 mt-1">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-[2px]">
                    <LetterBox checked={showPleuralDetails && (!pData.plaqueWidthRight || pData.plaqueWidthRight === '0')} label="O" className="w-5 h-5 text-[9px]" />
                    <LetterBox checked={(!!pData.plaqueWidthRight && pData.plaqueWidthRight !== '0')} label="R" className="w-5 h-5 text-[9px]" />
                  </div>
                  <div className="flex space-x-[2px]">
                    {['a','b','c'].map(v => <LetterBox key={v} checked={pData.plaqueWidthRight === v} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-[2px]">
                    <LetterBox checked={showPleuralDetails && (!pData.plaqueWidthLeft || pData.plaqueWidthLeft === '0')} label="O" className="w-5 h-5 text-[9px]" />
                    <LetterBox checked={(!!pData.plaqueWidthLeft && pData.plaqueWidthLeft !== '0')} label="L" className="w-5 h-5 text-[9px]" />
                  </div>
                  <div className="flex space-x-[2px]">
                    {['a','b','c'].map(v => <LetterBox key={v} checked={pData.plaqueWidthLeft === v} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* 3C. COSTOPHRENIC ANGLE OBLITERATION */}
        <div className="flex justify-between items-center border-b border-[#1e1b4b] p-1.5 bg-gray-50/50">
          <h3 className="text-[13px] text-black font-bold">3C. COSTOPHRENIC ANGLE OBLITERATION</h3>
          <div className="flex items-center space-x-6 mr-4">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <LetterBox checked={!!pData.costophrenicRight} label="R" className="w-5 h-5 text-[10px]" />
                <LetterBox checked={!!pData.costophrenicLeft} label="L" className="w-5 h-5 text-[10px]" />
              </div>
              <span className="text-[9px] leading-tight w-16 text-black">Proceed to<br/>Section 3D</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-black">No</span>
              <Checkbox checked={showPleuralDetails && !pData.costophrenicRight && !pData.costophrenicLeft} boxClass="w-5 h-5" />
              <span className="text-[9px] leading-tight w-20 text-black">Proceed to<br/>Section 4A</span>
            </div>
          </div>
        </div>

        {/* 3D. DIFFUSE PLEURAL THICKENING */}
        <div className="border-b border-[#1e1b4b] p-1.5">
          <h3 className="text-[13px] text-black mb-1 font-bold">3D. DIFFUSE PLEURAL THICKENING <span className="italic text-[11px] font-normal">(mark site, calcification, extent, and width)</span></h3>
          <div className="flex mt-1 ml-2">
            {/* Chest Wall / Site */}
            <div className="w-[20%] border-r border-[#1e1b4b] pr-2">
              <div className="flex justify-between text-[10px] italic text-black mb-1">
                <span>Chest wall</span><span>Site</span>
              </div>
              <div className="space-y-[2px] mt-6">
                <div className="flex justify-between items-center text-[10px] text-black">
                  <span>In profile</span>
                  <div className="flex space-x-[2px]">
                    {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.diffuseSiteProfile?.length) || pData.diffuseSiteProfile?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-black">
                  <span>Face on</span>
                  <div className="flex space-x-[2px]">
                    {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.diffuseSiteFaceOn?.length) || pData.diffuseSiteFaceOn?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Calcification */}
            <div className="w-[18%] border-r border-[#1e1b4b] px-4">
              <div className="text-center text-[10px] italic text-black mb-1">
                <span>Calcification</span>
              </div>
              <div className="space-y-[2px] flex flex-col items-center mt-6">
                <div className="flex space-x-[2px]">
                  {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.diffuseCalcProfile?.length) || pData.diffuseCalcProfile?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                </div>
                <div className="flex space-x-[2px]">
                  {['O','R','L'].map(v => <LetterBox key={v} checked={(v === 'O' && showPleuralDetails && !pData.diffuseCalcFaceOn?.length) || pData.diffuseCalcFaceOn?.includes(v)} label={v} className="w-5 h-5 text-[9px]" />)}
                </div>
              </div>
            </div>

            {/* Extent */}
            <div className="w-[30%] border-r border-[#1e1b4b] px-2">
              <div className="text-center text-[9px] italic text-black mb-1 leading-tight">
                <span>Extent (chest wall; combined<br/>for in profile and face on)</span>
              </div>
              <div className="text-[9px] text-black flex flex-col items-center leading-tight mb-1">
                <p>Up to 1/4 of lateral chest wall = 1</p>
                <p>1/4 to 1/2 of lateral chest wall = 2</p>
                <p>&gt; 1/2 of lateral chest wall = 3</p>
              </div>
              <div className="flex justify-center space-x-6 mt-1">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-[2px]">
                    <LetterBox checked={showPleuralDetails && (!pData.diffuseExtentRight || pData.diffuseExtentRight === '0')} label="O" className="w-5 h-5 text-[9px]" />
                    <LetterBox checked={(!!pData.diffuseExtentRight && pData.diffuseExtentRight !== '0')} label="R" className="w-5 h-5 text-[9px]" />
                  </div>
                  <div className="flex space-x-[2px]">
                    {['1','2','3'].map(v => <LetterBox key={v} checked={pData.diffuseExtentRight === v} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-[2px]">
                    <LetterBox checked={showPleuralDetails && (!pData.diffuseExtentLeft || pData.diffuseExtentLeft === '0')} label="O" className="w-5 h-5 text-[9px]" />
                    <LetterBox checked={(!!pData.diffuseExtentLeft && pData.diffuseExtentLeft !== '0')} label="L" className="w-5 h-5 text-[9px]" />
                  </div>
                  <div className="flex space-x-[2px]">
                    {['1','2','3'].map(v => <LetterBox key={v} checked={pData.diffuseExtentLeft === v} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Width */}
            <div className="w-[32%] px-2">
              <div className="text-center text-[9px] italic text-black mb-1 leading-tight">
                <span>Width (in profile only)<br/>(3mm minimum width required)</span>
              </div>
              <div className="text-[9px] text-black flex flex-col items-center leading-tight mb-1">
                <p>3 to 5 mm = a</p>
                <p>5 to 10 mm = b</p>
                <p>&gt; 10 mm = c</p>
              </div>
              <div className="flex justify-center space-x-4 mt-1">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-[2px]">
                    <LetterBox checked={showPleuralDetails && (!pData.diffuseWidthRight || pData.diffuseWidthRight === '0')} label="O" className="w-5 h-5 text-[9px]" />
                    <LetterBox checked={(!!pData.diffuseWidthRight && pData.diffuseWidthRight !== '0')} label="R" className="w-5 h-5 text-[9px]" />
                  </div>
                  <div className="flex space-x-[2px]">
                    {['a','b','c'].map(v => <LetterBox key={v} checked={pData.diffuseWidthRight === v} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-[2px]">
                    <LetterBox checked={showPleuralDetails && (!pData.diffuseWidthLeft || pData.diffuseWidthLeft === '0')} label="O" className="w-5 h-5 text-[9px]" />
                    <LetterBox checked={(!!pData.diffuseWidthLeft && pData.diffuseWidthLeft !== '0')} label="L" className="w-5 h-5 text-[9px]" />
                  </div>
                  <div className="flex space-x-[2px]">
                    {['a','b','c'].map(v => <LetterBox key={v} checked={pData.diffuseWidthLeft === v} label={v} className="w-5 h-5 text-[9px]" />)}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* 4A. ANY OTHER ABNORMALITIES? */}
        <div className="flex justify-between items-center border-b border-[#1e1b4b] p-1.5 bg-gray-50/50">
          <h3 className="text-[13px] text-black font-bold">4A. ANY OTHER ABNORMALITIES?</h3>
          <div className="flex items-center space-x-6 mr-4">
            <div className="flex items-center space-x-2">
              <span className="text-black">Yes</span>
              <Checkbox checked={anyOther === 'Yes'} boxClass="w-5 h-5" />
              <span className="text-[9px] leading-tight w-24 text-black">Complete Sections<br/>4B, 4C</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-black">No</span>
              <Checkbox checked={anyOther === 'No'} boxClass="w-5 h-5" />
              <span className="text-[9px] leading-tight w-20 text-black">Proceed to<br/>Section 5</span>
            </div>
          </div>
        </div>

        {/* 4B & 4C */}
        <div className="p-1.5">
          <h3 className="text-[13px] text-black mb-1 font-bold">4B. OTHER SYMBOLS (OBLIGATORY)</h3>
          <div className="flex flex-wrap gap-[2px] mb-1">
            {OBLIGATORY_SYMBOLS.map(sym => (
              <LetterBox key={sym} checked={pData.symbols?.includes(sym)} label={sym} className="w-auto px-[3px] h-4 text-[9px]" />
            ))}
            <LetterBox checked={pData.symbols?.includes('OD')} label="OD" className="w-auto px-[3px] h-4 text-[9px]" />
          </div>
          
          <div className="flex justify-between items-center mt-2 border-t border-gray-300 pt-1">
            <div className="text-[10px] text-black">
              If other diseases or significant abnormalities, <span className="font-bold">findings must be recorded on reverse.</span>
            </div>
            <div className="text-[9px] text-black text-right leading-tight">
              Date Physician or Worker<br/>notified? ______________
            </div>
          </div>

          <div className="mt-2 flex items-center space-x-4">
            <h3 className="text-[12px] text-black font-bold">4C. Should worker see personal physician because of findings in section 4?</h3>
            <span className="text-black ml-4">Yes</span>
            <Checkbox checked={pData.seePhysician === 'Yes'} boxClass="w-4 h-4" />
            <span className="text-black">No</span>
            <Checkbox checked={pData.seePhysician === 'No'} boxClass="w-4 h-4" />
            <div className="border border-[#1e1b4b] w-24 h-5 ml-4 bg-gray-50"></div>
          </div>
        </div>

      </div>

      {/* COMMENTS */}
      {data.hasComments === 'Yes' && data.commentsText && (
        <div className="mt-2">
          <h3 className="text-[12px] text-black font-bold mb-0.5">COMMENTS:</h3>
          <div className="p-1.5 border border-gray-300 rounded min-h-[30px] text-[10px] text-gray-800 whitespace-pre-wrap">
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
