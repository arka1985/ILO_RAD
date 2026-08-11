const fs = require('fs');
const path = require('path');

const root = 'c:/Users/arkad/OneDrive/Documents/ILO_RAD';
const dirs = [
  `${root}/viewer-app`,
  `${root}/Unified_Distribution/viewer-app`,
  `${root}/Viewer_Distribution/viewer-app`
];

for (const dir of dirs) {
  // 1. Fix ILOReportTemplate.tsx
  const fullPath = `${dir}/src/app/components/ILOReportTemplate.tsx`;
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf8');
    
    // Replace ['O','R','L'] with ['0','R','L']
    code = code.replace(/\['O','R','L'\]/g, "['0','R','L']");
    // Replace v === 'O' with v === '0'
    code = code.replace(/v === 'O'/g, "v === '0'");
    
    // Replace label="O" with label="0" ONLY in the extent/width sections (which have O and R adjacent in code or similar)
    // Actually, looking at the code, large opacities uses ['O', 'A', 'B', 'C']. So we can safely just do a regex for label="O" that are next to label="R" or label="L"
    // Wait, the extent/width 'O' boxes are rendered explicitly:
    code = code.replace(/label="O"(.*?)<LetterBox(.*?)label="R"/g, 'label="0"$1<LetterBox$2label="R"');
    code = code.replace(/label="O"(.*?)<LetterBox(.*?)label="L"/g, 'label="0"$1<LetterBox$2label="L"');
    
    // Add legend to 3A
    code = code.replace(
      /<h3 className="text-\[13px\] text-black font-bold">3A. ANY CLASSIFIABLE PLEURAL ABNORMALITIES\?<\/h3>/g,
      '<h3 className="text-[13px] text-black font-bold">3A. ANY CLASSIFIABLE PLEURAL ABNORMALITIES? <span className="italic font-normal text-[10px] ml-4">(0 = None, R = Right, L = Left)</span></h3>'
    );
    
    fs.writeFileSync(fullPath, code);
    console.log('Updated ' + fullPath);
  }

  // 2. Fix ILOAbbreviatedReportTemplate.tsx
  const abbrevPath = `${dir}/src/app/components/ILOAbbreviatedReportTemplate.tsx`;
  if (fs.existsSync(abbrevPath)) {
    let code = fs.readFileSync(abbrevPath, 'utf8');
    
    // Title
    code = code.replace(
      'ABBREVIATED RECORD OF CLASSIFICATION OF RADIOGRAPHS FOR PNEUMOCONIOSES',
      'ABBREVIATED RECORD OF ILO TERMINOLOGY CLASSIFICATION OF RADIOGRAPHS FOR PNEUMOCONIOSES'
    );
    
    // Pleural section
    const pleuralStart = code.indexOf('{/* 3. PLEURAL ABNORMALITIES */}');
    const symbolsStart = code.indexOf('{/* 4. OTHER ABNORMALITIES (SYMBOLS) */}');
    
    if (pleuralStart !== -1 && symbolsStart !== -1) {
      const newPleural = `{/* 3. PLEURAL ABNORMALITIES */}
        <div className="mb-6 border-b border-gray-300 pb-4">
          <h3 className="font-bold mb-4">3. Pleural Abnormalities <span className="italic font-normal text-xs ml-4">(0 = None, R = Right, L = Left)</span></h3>
          <div className={\`grid grid-cols-2 gap-4 \${isEssentiallyNormal || isUnreadable ? 'opacity-30' : ''}\`}>
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

        `;
      code = code.substring(0, pleuralStart) + newPleural + code.substring(symbolsStart);
    }
    
    fs.writeFileSync(abbrevPath, code);
    console.log('Updated ' + abbrevPath);
  }
}
