import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const directory=path.join(process.cwd(),'public/products');
const files=(await fs.readdir(directory)).filter(name=>/^v\d{2}-0[12]\.png$/.test(name)).sort();
let written=0;
for(const filename of files){
  const source=path.join(directory,filename);
  const destination=source.replace(/\.png$/,'.webp');
  const sourceStat=await fs.stat(source);
  const targetStat=await fs.stat(destination).catch(()=>null);
  if(targetStat&&targetStat.mtimeMs>=sourceStat.mtimeMs)continue;
  await sharp(source).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).webp({quality:85,effort:5}).toFile(destination);
  written++;
}
const outputs=(await fs.readdir(directory)).filter(name=>/^v\d{2}-0[12]\.webp$/.test(name));
console.log(`${files.length} PNG sources; ${written} WebP files optimized; ${outputs.length} WebP images available.`);
if(process.argv.includes('--check')){
  const missing=[];
  for(let variant=1;variant<=36;variant++)for(let view=1;view<=2;view++){
    const file=`v${String(variant).padStart(2,'0')}-0${view}.webp`;
    if(!outputs.includes(file))missing.push(file);
  }
  if(missing.length){console.error(`Missing ${missing.length} images: ${missing.join(', ')}`);process.exitCode=1;}
}
