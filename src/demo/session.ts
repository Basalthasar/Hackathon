import { offers, type CartLine } from '../domain/catalog';
import { restoreOrders, type DemoOrder } from '../domain/orders';
import { type FulfillmentMode } from '../domain/checkout';
import { type Scenario } from '../domain/routing';
export const STORAGE_KEY='dronedeliver-pitch-v1';
export type View='discover'|'delivery'|'stations'|'routing';
export interface Session {version:2;cart:CartLine[];orders:DemoOrder[];activeOrderId:string|null;mode:FulfillmentMode;view:View;scenario:Scenario;target:string;stationStep:number}
export const emptySession:Session={version:2,cart:[],orders:[],activeOrderId:null,mode:'DRONE',view:'discover',scenario:'normal',target:'Z03',stationStep:0};
export function restoreSession(raw:string|null):Session{
  if(!raw)return {...emptySession};
  try{
    const value=JSON.parse(raw);
    if(value.version!==1&&value.version!==2)return {...emptySession};
    const cart:CartLine[]=Array.isArray(value.cart)?value.cart.filter((l:CartLine)=>l&&offers.some(o=>o.id===l.offerId)&&Number.isSafeInteger(l.quantity)&&l.quantity>0&&l.quantity<=99):[];
    const storeIds=new Set(cart.map(l=>offers.find(o=>o.id===l.offerId)?.storeId));
    const orders=restoreOrders(value.orders);
    return {version:2,cart:storeIds.size<=1?cart:[],orders,activeOrderId:orders.some(o=>o.id===value.activeOrderId)?value.activeOrderId:null,mode:value.mode==='PICKUP'?'PICKUP':value.version===2&&value.mode==='BICYCLE'?'BICYCLE':'DRONE',view:['discover','delivery','stations','routing'].includes(value.view)?value.view:'discover',scenario:['normal','blocked','full','offline','weather'].includes(value.scenario)?value.scenario:'normal',target:['Z01','Z02','Z03'].includes(value.target)?value.target:'Z03',stationStep:Number.isInteger(value.stationStep)&&value.stationStep>=0&&value.stationStep<=5?value.stationStep:0};
  }catch{return {...emptySession};}
}
