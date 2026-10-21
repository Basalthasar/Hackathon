export function euro(minor: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(minor / 100);
}

export function km(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} km`;
}

export function weightKg(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} kg`;
}

export function minutesLabel(minutes: number): string {
  return `${minutes} Min.`;
}

export function clockNow(): string {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}
