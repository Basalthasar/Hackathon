import { describe, expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { offers } from '../domain/catalog';
import { productPhotos } from './products';

describe('complete generated catalogue photography',()=>{
  test('every unique product has two different, locally available final photos',()=>{
    const variants=new Set(offers.map(offer=>offer.variantId));
    expect(variants.size).toBe(36);
    const files=new Set<string>();
    for(const id of variants){
      const photos=productPhotos(id);
      expect(photos).toHaveLength(2);
      expect(photos[0].src).not.toBe(photos[1].src);
      for(const photo of photos){
        expect(photo.generated).toBe(true);
        expect(existsSync(join(process.cwd(),'public',photo.src))).toBe(true);
        files.add(photo.src);
      }
    }
    expect(files.size).toBe(72);
  });
});
