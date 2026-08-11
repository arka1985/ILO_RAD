const fs = require('fs');
const path = require('path');

const root = 'c:/Users/arkad/OneDrive/Documents/ILO_RAD';
const dirs = [
  `${root}/viewer-app`,
  `${root}/Unified_Distribution/viewer-app`,
  `${root}/Viewer_Distribution/viewer-app`
];

for (const dir of dirs) {
  const filePath = `${dir}/src/app/components/ILOReportTemplate.tsx`;
  if (!fs.existsSync(filePath)) continue;
  
  let code = fs.readFileSync(filePath, 'utf8');

  const target = `  const isEssentiallyNormal = data.isEssentiallyNormal === 'Yes';
  const isUnreadable = data.qualityGrade === '4';
  const pData = isUnreadable ? {} : data;
  
  // Abnormalities override
  const anyParenchymal = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyParenchymal);
  const anyPleural = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyPleural);
  const anyOther = isUnreadable ? '' : (isEssentiallyNormal ? 'No' : data.anyOther);
  
  const showPleuralDetails = !isUnreadable && anyPleural === 'Yes';
  const showParenchymalDetails = !isUnreadable && anyParenchymal === 'Yes';`;

  const replacement = `  const isEssentiallyNormal = data.isEssentiallyNormal === 'Yes';
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
  }`;

  if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync(filePath, code);
    console.log('Updated ' + filePath);
  }
}
