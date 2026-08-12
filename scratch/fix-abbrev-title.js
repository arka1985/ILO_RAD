const fs = require('fs');

const root = 'c:/Users/arkad/OneDrive/Documents/ILO_RAD';
const dirs = [
  `${root}/viewer-app`,
  `${root}/Unified_Distribution/viewer-app`,
  `${root}/Viewer_Distribution/viewer-app`
];

for (const dir of dirs) {
  const abbrevPath = `${dir}/src/app/components/ILOAbbreviatedReportTemplate.tsx`;
  if (fs.existsSync(abbrevPath)) {
    let code = fs.readFileSync(abbrevPath, 'utf8');
    
    // Replace the title block
    const oldTitleBlock = `<div className="text-center font-bold text-lg mb-4 text-black border-b-2 border-black pb-2">
        ABBREVIATED RECORD OF ILO TERMINOLOGY CLASSIFICATION OF RADIOGRAPHS FOR PNEUMOCONIOSES
      </div>`;
    
    const newTitleBlock = `<div className="text-center mb-4 border-b-2 border-black pb-2">
        <div className="font-bold text-xl text-black">ILO TERMINOLOGY</div>
        <div className="font-bold text-lg text-black mt-1">ABBREVIATED RECORD OF CLASSIFICATION OF RADIOGRAPHS FOR PNEUMOCONIOSES</div>
      </div>`;
      
    code = code.replace(oldTitleBlock, newTitleBlock);
    
    fs.writeFileSync(abbrevPath, code);
    console.log('Updated ' + abbrevPath);
  }
}
