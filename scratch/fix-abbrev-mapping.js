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
    
    // Replace the problematic dependency on anyParenchymal, anyPleural, anyOther
    // Since isEssentiallyNormal is already extracted: `const isEssentiallyNormal = data.isEssentiallyNormal === 'Yes';`
    code = code.replace(
      "const profusion = isUnreadable || anyParenchymal === 'No' ? null : data.abbrevProfusion;",
      "const profusion = isUnreadable || isEssentiallyNormal ? null : data.abbrevProfusion;"
    );
    code = code.replace(
      "const shape = isUnreadable || anyParenchymal === 'No' ? null : data.abbrevShape;",
      "const shape = isUnreadable || isEssentiallyNormal ? null : data.abbrevShape;"
    );
    code = code.replace(
      "const largeOpacity = isUnreadable || anyParenchymal === 'No' ? null : data.largeOpacity;",
      "const largeOpacity = isUnreadable || isEssentiallyNormal ? null : data.largeOpacity;"
    );
    code = code.replace(
      "const thickening = isUnreadable || anyPleural === 'No' ? [] : (data.abbrevThickening || []);",
      "const thickening = isUnreadable || isEssentiallyNormal ? [] : (data.abbrevThickening || []);"
    );
    code = code.replace(
      "const calcification = isUnreadable || anyPleural === 'No' ? [] : (data.abbrevCalcification || []);",
      "const calcification = isUnreadable || isEssentiallyNormal ? [] : (data.abbrevCalcification || []);"
    );
    code = code.replace(
      "const symbols = isUnreadable || anyOther === 'No' ? [] : (data.symbols || []);",
      "const symbols = isUnreadable || isEssentiallyNormal ? [] : (data.symbols || []);"
    );
    
    fs.writeFileSync(abbrevPath, code);
    console.log('Updated ' + abbrevPath);
  }
}
