const fs = require('fs');
const path = require('path');

const src = 'skins-pro';
const dest = 'dist';

const dirs = fs.readdirSync(src, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

dirs.forEach(dir => {
  fs.cpSync(path.join(src, dir), path.join(dest, dir), { recursive: true, force: true });
});

fs.writeFileSync(path.join(dest, 'skins.json'), JSON.stringify(dirs) + '\n');
