/** Two independent ImageGen photographs per product variant; offers share variant imagery. */
export type ProductPhoto = {src:string;view:'Hauptansicht'|'Zweite Ansicht';generated:true};
export function productPhotos(variantId:string):ProductPhoto[]{
  const id=variantId.toLowerCase();
  return [
    {src:`/products/${id}-01.webp`,view:'Hauptansicht',generated:true},
    {src:`/products/${id}-02.webp`,view:'Zweite Ansicht',generated:true},
  ];
}
