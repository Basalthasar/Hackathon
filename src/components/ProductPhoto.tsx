'use client';
import Image from 'next/image';
import { productPhotos } from '../media/products';
export default function ProductPhoto({variantId,name,index=0,priority=false,sizes='(max-width: 760px) 45vw, (max-width: 1020px) 30vw, 24vw'}:{variantId:string;name:string;index?:number;priority?:boolean;sizes?:string}){
  const photo=productPhotos(variantId)[index]??productPhotos(variantId)[0];
  return <Image src={photo.src} alt={`KI-generiertes Produktfoto: ${name} · ${photo.view}`} fill sizes={sizes} preload={priority} style={{objectFit:'cover'}}/>;
}
