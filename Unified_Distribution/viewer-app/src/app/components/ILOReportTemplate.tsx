import React from 'react';

// Interface matching the relevant wizardData structure
export interface ILOReportProps {
  data: any;
}

export const ILOReportTemplate: React.FC<ILOReportProps> = ({ data }) => {
  return (
    <div id="ilo-report-template" className="bg-white text-black p-6 font-sans text-xs" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div className="text-center border-b-2 border-black pb-2 mb-4">
        <h1 className="text-lg font-bold uppercase tracking-wider">ILO International Classification of Radiographs of Pneumoconioses</h1>
        <h2 className="text-sm font-bold mt-1">Radiograph Reading Report</h2>
      </div>

      {data.isNonDicom && (
        <div className="mb-4 text-center font-black border-2 border-black p-2 uppercase text-sm">
          WARNING: A NON-DICOM IMAGE FORMAT WAS USED FOR INTERPRETATION. THIS REPORT IS FOR TRAINING PURPOSES ONLY.
        </div>
      )}

      {/* METADATA */}
      <div className="grid grid-cols-2 gap-4 mb-4 border-b border-gray-300 pb-3">
        <div>
          <p><span className="font-bold">Patient/Worker/Employee Name:</span> {data.patientName || 'N/A'}</p>
          <p><span className="font-bold">Patient/Worker/Employee ID:</span> {data.patientId || 'N/A'}</p>
          <p><span className="font-bold">Date of Radiograph:</span> {data.radiographDate || 'N/A'}</p>
          <p><span className="font-bold">Reading Date:</span> {data.readingDate || 'N/A'}</p>
        </div>
        <div>
          <p><span className="font-bold">Reader Name:</span> {data.classifyingPhysician || 'N/A'}</p>
          <p><span className="font-bold">Reader Qualification:</span> {data.physicianQualification || 'N/A'}</p>
          <p><span className="font-bold">Classification Mode:</span> {data.classificationMode}</p>
          <p><span className="font-bold">Classification Purpose:</span> {data.classificationPurpose === 'Other' ? data.classificationPurposeOtherText : data.classificationPurpose}</p>
          <p><span className="font-bold">Working Place:</span> {data.workingPlace === 'Other' ? data.workingPlaceOtherText : data.workingPlace}</p>
          <p><span className="font-bold">Establishment:</span> {data.establishmentName || 'N/A'}</p>
          <p><span className="font-bold">Examination Type:</span> {data.examinationType === 'Other' ? data.examinationTypeOtherText : data.examinationType}</p>
        </div>
      </div>

      {/* 1. QUALITY */}
      <div className="mb-4">
        <h3 className="font-bold bg-gray-200 p-1 mb-1 text-sm">1. Image Quality</h3>
        <p className="ml-2"><span className="font-bold">Grade:</span> {data.qualityGrade || 'N/A'}</p>
        {data.classificationMode === 'Abbreviated' ? (
          data.qualityGrade && data.qualityGrade !== '1' && (
            <p className="ml-2 italic text-xs">Comment: {data.abbrevQualityComment}</p>
          )
        ) : (
          <>
            {data.qualityGrade !== '1' && data.qualityDefects.length > 0 && (
              <p className="ml-2">Defects: {data.qualityDefects.join(', ')}</p>
            )}
            {data.qualityDefects.includes('Other') && data.qualityDefectsOtherText && (
              <p className="ml-2 italic text-xs">Other defect: {data.qualityDefectsOtherText}</p>
            )}
          </>
        )}
      </div>

      {/* 2. PARENCHYMAL */}
      <div className="mb-4">
        <h3 className="font-bold bg-gray-200 p-1 mb-1 text-sm">2. Parenchymal Abnormalities</h3>
        <p className="ml-2 mb-2"><span className="font-bold">Any Small Opacities?</span> {data.anyParenchymal}</p>
        
        {data.anyParenchymal === 'Yes' && (
          <div className="ml-4 border-l-2 border-gray-300 pl-4">
            {data.classificationMode === 'Abbreviated' ? (
              <>
                <p><span className="font-bold">Profusion (4-point):</span> {data.abbrevProfusion}</p>
                <p><span className="font-bold">Primary Shape/Size:</span> {data.abbrevShape}</p>
              </>
            ) : (
              <>
                <p><span className="font-bold">Shape/Size (Primary/Secondary):</span> {data.primaryShape} / {data.secondaryShape}</p>
                <p><span className="font-bold">Zones Involved:</span> {data.zones.length > 0 ? data.zones.join(', ') : 'None'}</p>
                <p><span className="font-bold">Profusion (12-point scale):</span> {data.profusion}</p>
              </>
            )}
            <p className="mt-2"><span className="font-bold">Large Opacities (Size):</span> {data.largeOpacity}</p>
          </div>
        )}
      </div>

      {/* 3. PLEURAL */}
      <div className="mb-4">
        <h3 className="font-bold bg-gray-200 p-1 mb-1 text-sm">3. Pleural Abnormalities</h3>
        <p className="ml-2 mb-2"><span className="font-bold">Any Classifiable Pleural Abnormalities?</span> {data.anyPleural}</p>

        {data.anyPleural === 'Yes' && data.classificationMode === 'Abbreviated' && (
          <div className="ml-4 border-l-2 border-gray-300 pl-4">
            <p><span className="font-bold">Pleural Thickening (PT):</span> {data.abbrevThickening.length > 0 ? data.abbrevThickening.join(', ') : '0'}</p>
            <p><span className="font-bold">Pleural Calcification (PC):</span> {data.abbrevCalcification.length > 0 ? data.abbrevCalcification.join(', ') : '0'}</p>
          </div>
        )}

        {data.anyPleural === 'Yes' && data.classificationMode === 'Full' && (
          <div className="ml-4 text-xs">
            {/* PLAQUES SUMMARY */}
            <div className="mb-2">
              <p className="font-bold underline mb-1">3B. Pleural Plaques</p>
              <div className="grid grid-cols-2 gap-2 ml-2">
                <div>
                  <span className="font-bold">Site:</span> Profile ({data.plaqueSiteProfile.join(',') || 'O'}), Face on ({data.plaqueSiteFaceOn.join(',') || 'O'}), Diaphragm ({data.plaqueSiteDiaphragm.join(',') || 'O'}), Other ({data.plaqueSiteOther.join(',') || 'O'})
                </div>
                <div>
                  <span className="font-bold">Calcification:</span> Profile ({data.plaqueCalcProfile.join(',') || 'O'}), Face on ({data.plaqueCalcFaceOn.join(',') || 'O'}), Diaphragm ({data.plaqueCalcDiaphragm.join(',') || 'O'}), Other ({data.plaqueCalcOther.join(',') || 'O'})
                </div>
                <div><span className="font-bold">Extent (R/L):</span> {data.plaqueExtentRight}/{data.plaqueExtentLeft}</div>
                <div><span className="font-bold">Width (R/L):</span> {data.plaqueWidthRight}/{data.plaqueWidthLeft}</div>
              </div>
            </div>

            {/* COSTO */}
            <div className="mb-2">
              <p className="font-bold underline mb-1">3C. Costophrenic Angle Obliteration</p>
              <p className="ml-2">Right: {data.costophrenicRight ? 'Yes' : 'No'}, Left: {data.costophrenicLeft ? 'Yes' : 'No'}</p>
            </div>

            {/* DIFFUSE */}
            <div>
              <p className="font-bold underline mb-1">3D. Diffuse Pleural Thickening</p>
              <div className="grid grid-cols-2 gap-2 ml-2">
                <div>
                  <span className="font-bold">Site:</span> Profile ({data.diffuseSiteProfile.join(',') || 'O'}), Face on ({data.diffuseSiteFaceOn.join(',') || 'O'})
                </div>
                <div>
                  <span className="font-bold">Calcification:</span> Profile ({data.diffuseCalcProfile.join(',') || 'O'}), Face on ({data.diffuseCalcFaceOn.join(',') || 'O'})
                </div>
                <div><span className="font-bold">Extent (R/L):</span> {data.diffuseExtentRight}/{data.diffuseExtentLeft}</div>
                <div><span className="font-bold">Width (R/L):</span> {data.diffuseWidthRight}/{data.diffuseWidthLeft}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. OTHER */}
      <div className="mb-6">
        <h3 className="font-bold bg-gray-200 p-1 mb-1 text-sm">4. Symbols & Comments</h3>
        <div className="ml-2">
          {data.classificationMode === 'Abbreviated' ? (
            <>
              <p className="mb-2"><span className="font-bold">Symbols Present?</span> {data.abbrevSymbolsPresent}</p>
              {data.abbrevSymbolsPresent === 'Yes' && (
                <p className="mb-2"><span className="font-bold">Symbols:</span> {data.symbols.length > 0 ? data.symbols.join(', ') : 'None'}</p>
              )}
            </>
          ) : (
            <>
              <p className="mb-2"><span className="font-bold">Any Other Abnormalities?</span> {data.anyOther}</p>
              {data.anyOther === 'Yes' && (
                <>
                  <p className="mb-2"><span className="font-bold">Obligatory Symbols:</span> {data.symbols.length > 0 ? data.symbols.join(', ') : 'None'}</p>
                  <p className="mb-2"><span className="font-bold">Refer to Physician?</span> {data.seePhysician}</p>
                </>
              )}
            </>
          )}
          
          <p className="mt-4"><span className="font-bold">Comments Present?</span> {data.hasComments}</p>
          {data.hasComments === 'Yes' && (
            <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-50 text-gray-800 whitespace-pre-wrap">
              {data.commentsText || 'No comment text provided.'}
            </div>
          )}
        </div>
      </div>

      {/* SIGNATURE BLOCK */}
      <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end">
        <div>
          <p className="mb-2 text-lg">_______________________________________</p>
          <p className="font-bold">Signature of Reader</p>
          <p className="text-sm font-bold mt-1">{data.classifyingPhysician || 'Reader Name'}</p>
          {data.physicianQualification && (
            <p className="text-xs italic text-gray-600">{data.physicianQualification}</p>
          )}
        </div>
        <div>
          <p className="mb-4 text-xl">_______________________</p>
          <p className="font-bold text-center">Date</p>
        </div>
      </div>

    </div>
  );
};
