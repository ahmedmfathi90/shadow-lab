import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('docs');
const oldPath = path.join(docsDir, 'index.html');
const newPath = path.join(docsDir, 'mymovie.html');

if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath);
  console.log('Successfully renamed index.html to mymovie.html inside docs folder!');
} else {
  console.error('index.html not found inside docs folder!');
}
