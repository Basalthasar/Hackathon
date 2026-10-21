import { getStore } from '../domain/catalog';
export type Coordinate = [number,number];
export const demoDestination={id:'demo-home',name:'Beispielort Haspel',detail:'Hauseingang · fiktiver Empfangsort',lat:51.2584,lng:7.1749};
/** Prepared illustrative paths; no navigation or current traffic data. */
export function bikeRoute(storeId:string):Coordinate[]{
  const store=getStore(storeId)!;
  if(store.lng>7.17)return [[store.lat,store.lng],[store.lat-.0008,store.lng-.0012],[51.2638,7.1852],[51.2615,7.1781],[demoDestination.lat,demoDestination.lng]];
  return [[store.lat,store.lng],[51.2578,store.lng],[51.2566,7.1540],[51.2572,7.1638],[51.2580,7.1701],[demoDestination.lat,demoDestination.lng]];
}
export function positionOnRoute(points:Coordinate[],progress:number):Coordinate|null{
  if(!points.length)return null;
  const index=Math.max(0,Math.min(1,progress))*(points.length-1);
  const from=points[Math.floor(index)],to=points[Math.min(points.length-1,Math.ceil(index))];
  const part=index-Math.floor(index);
  return [from[0]+(to[0]-from[0])*part,from[1]+(to[1]-from[1])*part];
}
