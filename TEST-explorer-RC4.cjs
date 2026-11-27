const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');const html=fs.readFileSync('index.html','utf8');const ctx={window:{}};vm.createContext(ctx);vm.runInContext(html.match(/<script>\s*(\(function\(\)\{'use strict';\s*const sites=[\s\S]*?)<\/script>/)[1],ctx);const E=ctx.window.TTExplorer;assert.equal(E.sites.length,13);assert.equal(E.points.split(' ').length,14);assert.equal(E.clamp(5,1,4),4);assert.equal(E.clamp(0,1,4),1);assert.ok(E.xy(7.96,80.76).every(Number.isFinite));for(let i=0;i<10;i++)assert.ok(E.daySites([],i).length);assert.ok(html.includes('id="exHost"'));assert.ok(fs.readFileSync('sw.js','utf8').includes('tt2-v1.0.4'));console.log('17 Explorer assertions passed');

const catalog = JSON.parse(html.match(/const stagePhotos=(\[[\s\S]*?\]);/)[1]);
const worker = fs.readFileSync('sw.js', 'utf8');
const credits = fs.readFileSync('assets/tappe/ATTRIBUZIONI.md', 'utf8');
assert.equal(catalog.length, E.sites.length);
assert.equal(new Set(catalog.map(photo => photo.file)).size, E.sites.length);
for (const photo of catalog) {
  assert.match(photo.license, /^CC BY(?:-SA)? [34]\.0$/);
  assert.match(photo.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.ok(photo.author && photo.alt);
  assert.ok(credits.includes(photo.source) && credits.includes(photo.licenseUrl));
  const path = './assets/tappe/' + photo.file;
  assert.ok(worker.includes("'" + path + "'"));
  assert.equal(fs.readFileSync(path).readUInt16BE(0), 0xffd8);
}
assert.match(worker, /addAll\(\[\.\.\.SHELL,\.\.\.STAGE_PHOTOS\]\)/);
console.log('81 verifiche delle fotografie locali e delle attribuzioni passate');
