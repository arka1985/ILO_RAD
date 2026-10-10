import React from 'react';

export function FormIXReportTemplate({ reportData }: { reportData: any }) {
  const isAbbreviated = reportData.classificationMode === 'Abbreviated';

  // Helpers
  const isParenchymalPresent = isAbbreviated
    ? ((reportData.abbrevProfusion && reportData.abbrevProfusion !== '-' && reportData.abbrevProfusion !== '0') ||
       (reportData.largeOpacity && reportData.largeOpacity !== '0' && reportData.largeOpacity !== 'None'))
    : reportData.anyParenchymal === 'Yes';
  
  // Grade calculations
  const techGrade = reportData.qualityGrade || 'Not Specified';
  
  let opacityGrade = isAbbreviated
    ? ((reportData.abbrevProfusion && reportData.abbrevProfusion !== '-') ? reportData.abbrevProfusion : 'Not Specified')
    : ((reportData.profusion && reportData.profusion !== '-') ? reportData.profusion : 'Not Specified');

  if (!isParenchymalPresent && opacityGrade === 'Not Specified') {
    opacityGrade = 'None';
  }
    
  const largeOpacity = (reportData.largeOpacity && reportData.largeOpacity !== '0') ? reportData.largeOpacity : 'None';
  
  // Types calculation
  const isZeroProfusion = isAbbreviated 
    ? reportData.abbrevProfusion === '0' 
    : (reportData.profusion === '0/-' || reportData.profusion === '0/0');

  let types = [];
  
  if (isAbbreviated) {
    if (isZeroProfusion) {
      types.push(`Shape: Not Applicable`);
    } else if (reportData.abbrevShape && reportData.abbrevShape !== '-') {
      types.push(`Shape: ${reportData.abbrevShape}`);
    }
    
    if (reportData.abbrevThickening?.length > 0) {
      types.push(`Pleural Thickening: ${reportData.abbrevThickening.join(', ')}`);
    }
    
    if (reportData.abbrevCalcification?.length > 0) {
      types.push(`Pleural Calcification: ${reportData.abbrevCalcification.join(', ')}`);
    }
    
    if (reportData.symbols?.length > 0) {
      types.push(`Other Abnormalities: ${reportData.symbols.join(', ')}`);
    }
  } else {
    if (isZeroProfusion) {
      types.push(`Zones of Involvement: Not Applicable`);
      types.push(`Shape/Size: Not Applicable`);
    } else {
      if (reportData.zones && reportData.zones.length > 0) {
        types.push(`Zones of Involvement: ${reportData.zones.join(', ')}`);
      }
      
      if (reportData.primaryShape !== '-' || reportData.secondaryShape !== '-') {
        const p = reportData.primaryShape !== '-' ? reportData.primaryShape : '';
        const s = reportData.secondaryShape !== '-' ? reportData.secondaryShape : '';
        types.push(`Shape/Size: ${p}${s ? '/' + s : ''}`);
      }
    }

    // Pleural Plaques
    const hasPlaques = reportData.plaqueSiteProfile?.length > 0 || reportData.plaqueSiteFaceOn?.length > 0 || reportData.plaqueSiteDiaphragm?.length > 0;
    if (hasPlaques) {
      types.push('Pleural Plaques: Present');
    }

    // Costophrenic Angle
    if (reportData.costophrenicRight || reportData.costophrenicLeft) {
      const cp = [];
      if (reportData.costophrenicRight) cp.push('Right');
      if (reportData.costophrenicLeft) cp.push('Left');
      types.push(`Costophrenic Angle Obliteration: ${cp.join(', ')}`);
    }

    // Diffuse Pleural Thickening
    const hasDiffuse = reportData.diffuseSiteProfile?.length > 0 || reportData.diffuseSiteFaceOn?.length > 0;
    if (hasDiffuse) {
      types.push('Diffuse Pleural Thickening: Present');
    }

    // Any other abnormality
    if (reportData.anyOther === 'Yes' && reportData.symbols?.length > 0) {
      types.push(`Other Abnormalities: ${reportData.symbols.join(', ')}`);
    }
  }

  if (types.length === 0) {
    types.push('None specified');
  }

  return (
    <div id="form-ix-template" className="bg-white text-black p-8 max-w-4xl mx-auto font-sans break-inside-avoid">
      <div className="mb-6 border-b-2 border-black pb-4 text-center">
        <h2 className="text-xl font-bold uppercase">
          REPORT AS PER FORM IX OF OCCUPATIONAL SAFETY HEALTH AND WORKING CONDITION (CENTRAL) RULES 2026
        </h2>
        <h3 className="text-sm font-semibold mt-2 uppercase text-gray-700">
          OR ANY RULES OR REGULATION OR STANDARD UNDER THE OSHWC CODE 2020
        </h3>
      </div>
      
      {/* Basic patient info to tie the page back to the patient */}
      <div className="mb-6 grid grid-cols-2 gap-4 text-sm font-bold border-b border-gray-300 pb-4">
        <div>Patient Name: <span className="font-normal">{reportData.patientName}</span></div>
        <div>Patient ID: <span className="font-normal">{reportData.patientId}</span></div>
        <div>Radiograph Date: <span className="font-normal">{reportData.radiographDate || reportData.readingDate}</span></div>
        <div>Classifying Physician: <span className="font-normal">{reportData.classifyingPhysician}</span></div>
        <div>Reading Date: <span className="font-normal">{reportData.readingDate}</span></div>
        <div>Establishment Name: <span className="font-normal">{reportData.establishmentName || 'Not Specified'}</span></div>
          <div>Purpose: <span className="font-normal">{reportData.classificationPurpose === 'Other' ? reportData.classificationPurposeOtherText : reportData.classificationPurpose}</span></div>
          <div>Type of Examination: <span className="font-normal">{reportData.examinationType === 'Other Purpose' ? reportData.examinationTypeOtherText : reportData.examinationType}</span></div>
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-lg mb-2">ILO Classification of Chest Radiograph :</h3>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-3 text-left w-1/3">Profusion of Pneumoconiotic opacities</th>
              <th className="border border-black p-3 text-left w-1/3">Grades</th>
              <th className="border border-black p-3 text-left w-1/3">Types</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-3 font-semibold align-top">
                {isParenchymalPresent ? 'Present' : 'Absent'}
              </td>
              <td className="border border-black p-3 align-top">
                <ul className="list-disc pl-4 space-y-2">
                  <li><strong>Technical Grade:</strong> {techGrade}</li>
                  <li><strong>Opacity Grade:</strong> {opacityGrade}</li>
                  <li><strong>Large Opacity:</strong> {largeOpacity}</li>
                </ul>
              </td>
              <td className="border border-black p-3 align-top">
                <ul className="list-disc pl-4 space-y-2">
                  {types.map((type, idx) => (
                    <li key={idx}>{type}</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-16 flex justify-between items-end">
         <div>
            <div className="border-b border-black w-48 mb-2 h-8 flex items-end justify-center text-lg"></div>
            <p className="font-bold text-sm">Signature of Classifying Physician</p>
            {reportData.classifyingPhysician && (
              <p className="text-xs mt-1 font-bold">{reportData.classifyingPhysician}</p>
            )}
            {reportData.physicianQualification && (
              <p className="text-xs text-gray-700 max-w-[250px]">
                {Array.isArray(reportData.physicianQualification) 
                  ? [...reportData.physicianQualification.filter((q: string) => q !== 'Others'), ...(reportData.physicianQualification.includes('Others') && reportData.physicianQualificationOtherText ? [reportData.physicianQualificationOtherText] : [])].join(', ') 
                  : reportData.physicianQualification}
              </p>
            )}
         </div>
         <div className="text-center">
            <p className="font-bold text-sm mb-1">Reading Date</p>
            <p className="text-sm text-black">{reportData.readingDate || '_______________________'}</p>
         </div>
      </div>
    </div>
  );
}
