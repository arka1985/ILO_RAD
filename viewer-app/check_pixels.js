const fs = require('fs');
const dicomParser = require('dicom-parser');

const dir = 'public/standards';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.dcm'));

for (const file of files) {
  const buf = fs.readFileSync(dir + '/' + file);
  try {
    const dataSet = dicomParser.parseDicom(new Uint8Array(buf));
    const pixelDataElement = dataSet.elements.x7fe00010;
    if (pixelDataElement) {
      const pixelData = new Uint16Array(buf.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2);
      
      // Calculate min and max
      let min = 65535, max = 0;
      let sum = 0;
      const step = Math.max(1, Math.floor(pixelData.length / 10000));
      let count = 0;
      for (let i = 0; i < pixelData.length; i += step) {
        if (pixelData[i] < min) min = pixelData[i];
        if (pixelData[i] > max) max = pixelData[i];
        sum += pixelData[i];
        count++;
      }
      const mean = Math.floor(sum / count);
      
      console.log(file, 'Min:', min, 'Max:', max, 'Mean:', mean);
    }
  } catch(e) {
  }
}
