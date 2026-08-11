const fs = require('fs');

const root = 'c:/Users/arkad/OneDrive/Documents/ILO_RAD';
const dirs = [
  `${root}/viewer-app`,
  `${root}/Unified_Distribution/viewer-app`,
  `${root}/Viewer_Distribution/viewer-app`
];

for (const dir of dirs) {
  const pageFile = `${dir}/src/app/page.tsx`;
  if (fs.existsSync(pageFile)) {
    let code = fs.readFileSync(pageFile, 'utf8');
    
    const newButton = `              <a href="https://arka1985.github.io/ILO_RAD/" target="_blank" rel="noreferrer" className="bg-[#0f172a] hover:bg-gray-700 border border-[#334155] hover:border-gray-500 text-gray-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-md flex-1 md:flex-none" title="Check GitHub for Updates">
                <Github size={12} />
                <span>Updates</span>
              </a>`;

    const targetChunk = `              <a href="/ILO_2022-28-29.pdf" target="_blank" rel="noreferrer" className="bg-[#0f172a] hover:bg-blue-600 border border-[#334155] hover:border-blue-500 text-gray-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-md flex-1 md:flex-none">
                <ExternalLink size={12} />
                <span>ILO_2020 (28-29)</span>
              </a>
            </div>`;

    const replacementChunk = `              <a href="/ILO_2022-28-29.pdf" target="_blank" rel="noreferrer" className="bg-[#0f172a] hover:bg-blue-600 border border-[#334155] hover:border-blue-500 text-gray-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-md flex-1 md:flex-none">
                <ExternalLink size={12} />
                <span>ILO_2020 (28-29)</span>
              </a>
${newButton}
            </div>`;
    
    if (code.includes(targetChunk) && !code.includes('https://arka1985.github.io/ILO_RAD/')) {
      code = code.replace(targetChunk, replacementChunk);
      fs.writeFileSync(pageFile, code);
      console.log('Updated ' + pageFile);
    } else {
      console.log('Skipped ' + pageFile + ' (target not found or already has link)');
    }
  }
}
