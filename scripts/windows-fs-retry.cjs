// Next's parallel export writes can hit transient EPERM from Windows file scanners.
// Retry directory creation only; preserve real errors and bound the retry window.
const fs = require('node:fs');
const original = fs.promises.mkdir.bind(fs.promises);
fs.promises.mkdir = async function mkdirWithRetry(path, options) {
 for (let attempt = 0; ; attempt++) {
  try { return await original(path, options); }
  catch (error) {
   if (error.code !== 'EPERM' || attempt >= 12) throw error;
   await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
  }
 }
};
