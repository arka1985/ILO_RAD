import React from 'react';

export function FormIXReportTemplate({ reportData }: { reportData: any }) {
  // Helpers
  const isParenchymalPresent = reportData.anyParenchymal === 'Yes';
  
  // Grade calculations
  const techGrade = reportData.qualityGrade || 'Not Specified';
  const opacityGrade = (reportData.profusion && reportData.profusion !== '-') ? reportData.profusion : 'Not Specified';
  const largeOpacity = (reportData.largeOpacity && reportData.largeOpacity !== '0') ? reportData.largeOpacity : 'None';
  
  // Types calculation
  let types = [];
  
  if (reportData.zones && reportData.zones.length > 0) {
    types.push(`Zones of Involvement: ${reportData.zones.join(', ')}`);
  }
  
  if (reportData.primaryShape !== '-' || reportData.secondaryShape !== '-') {
    const p = reportData.primaryShape !== '-' ? reportData.primaryShape : '';
    const s = reportData.secondaryShape !== '-' ? reportData.secondaryShape : '';
    types.push(`Shape/Size: ${p}${s ? '/' + s : ''}`);
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

  if (types.length === 0) {
    types.push('None specified');
  }

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto font-sans break-inside-avoid">
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
        <div>Date of Examination: <span className="font-normal">{reportData.radiographDate || reportData.readingDate}</span></div>
        <div>Classifying Physician: <span className="font-normal">{reportData.classifyingPhysician}</span></div>
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
      
      <div className="mt-16 flex justify-between">
         <div className="text-center">
            <div className="border-b border-black w-48 mb-2"></div>
            <p className="font-bold text-sm">Signature of Classifying Physician</p>
         </div>
      </div>
    </div>
  );
}
