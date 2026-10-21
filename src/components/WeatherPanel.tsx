'use client';
import { useEffect, useState } from 'react';
import { CloudSun, Wind, Droplets, RefreshCw, ChevronDown, Info } from 'lucide-react';
import { WEATHER_LOCATIONS } from '../weather/locations';
import type { WeatherResponse } from '../weather/types';
import s from './PitchApp.module.css';

const time=(value:string|null|undefined)=>value?new Date(value).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'}):'nicht vorhanden';
export default function WeatherPanel({missionMinutes=30,targetId='Z03'}:{missionMinutes?:number;targetId?:string}) {
  const [results,setResults]=useState<Record<string,WeatherResponse>>({});
  const [selected,setSelected]=useState('HUB');
  const [loading,setLoading]=useState(false);
  const [failure,setFailure]=useState('');
  const [expanded,setExpanded]=useState(false);
  const [refresh,setRefresh]=useState(0);
  const locations=Array.isArray(WEATHER_LOCATIONS)?WEATHER_LOCATIONS:Object.values(WEATHER_LOCATIONS);
  useEffect(()=>{
    if(document.hidden)return;
    const controller=new AbortController(); let live=true;
    setLoading(true);setFailure('');
    Promise.allSettled(locations.map(async location=>{
      const response=await fetch(`/api/weather?locationId=${encodeURIComponent(location.id)}`,{signal:controller.signal});
      const data=await response.json() as WeatherResponse;
      if(!Array.isArray(data.hours))throw new Error('Unerwartete Wetterantwort');
      if(live)setResults(old=>({...old,[location.id]:data}));
    })).then(outcomes=>{
      if(!live)return;setLoading(false);
      if(outcomes.some(item=>item.status==='rejected'))setFailure('Mindestens ein Wetterort ist gerade nicht erreichbar. Es entsteht keine positive Bewertung.');
    });
    return()=>{live=false;controller.abort()};
    // Explicit refresh only. No hidden-tab polling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[refresh]);
  const chosen=results[selected];
  const first=chosen?.hours[0];
  const [windowStart,setWindowStart]=useState(()=>Date.now());
  useEffect(()=>{setWindowStart(Date.now())},[refresh,missionMinutes,targetId]);
  return <section className={s.weather} aria-labelledby="weather-title">
    <div className={s.row}><div className={s.iconBox}><CloudSun size={24}/></div><div className={s.grow}><h3 id="weather-title">Wetter entlang der Route</h3><p>Aktuell abgerufene Wettervorhersage</p></div><button className={s.iconButton} aria-label="Wetter neu abrufen" onClick={()=>setRefresh(v=>v+1)} disabled={loading}><RefreshCw size={18} className={loading?s.spin:undefined}/></button></div>
    <p className={s.micro}><strong>{chosen?.location.name??locations.find(l=>l.id===selected)?.name}</strong> · {loading?'Wird abgerufen …':chosen?.status==='stale'?'VERALTETER DATENSTAND':chosen?.status==='error'?'Abruf fehlgeschlagen':chosen?.provenance==='CACHED_FORECAST'?'Gespeicherte Vorhersage':chosen?.provenance==='ONLINE_FORECAST'?'Online-Vorhersage':'Nicht verfügbar'}</p>
    <div className={s.weatherValues}><span><CloudSun size={18}/><strong>{first?.temperatureC??'–'} °C</strong></span><span><Wind size={18}/><strong>{first?.windSpeedMps??'–'} m/s</strong></span><span><Droplets size={18}/><strong>{first?.precipitationMm??'–'} mm</strong></span></div>
    <div className={s.weatherState}><span className={`${s.badge} ${s.warning}`}>UNBESTIMMT</span><span>Keine Flugfreigabe</span></div>
    <p className={s.micro}>Vorhersage am Boden. Fahrzeugnachweise sowie Böen-, Sichtweiten-, Vereisungs- und Höhendaten fehlen oder sind unvollständig.</p>
    {(failure||chosen?.error?.message)&&<p role="status" className={s.error}>{failure||chosen?.error?.message}</p>}
    {loading&&!chosen&&<p role="status" className={s.micro}>Vorhersagen für Hub, Stationen und Zwischenpunkte werden abgerufen …</p>}
    <button className={s.textButton} onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>Daten & 24-Stunden-Vorschau <ChevronDown size={17}/></button>
    {expanded&&<div className={s.weatherDetails}>
      <label className={s.field}>Wetterort<select value={selected} onChange={e=>setSelected(e.target.value)}>{locations.map(location=><option key={location.id} value={location.id}>{location.name} · {results[location.id]?.status??'ausstehend'}</option>)}</select></label>
      <dl className={s.metadata}><dt>Herkunft</dt><dd>{chosen?.provenance==='ONLINE_FORECAST'?'Online-Vorhersage':chosen?.provenance==='CACHED_FORECAST'?'Gespeicherte Vorhersage':'Nicht verfügbar'}</dd><dt>Abgerufen</dt><dd>{time(chosen?.fetchedAt)}</dd><dt>Anbieter aktualisiert</dt><dd>{time(chosen?.providerUpdatedAt)}</dd><dt>Cache gültig bis</dt><dd>{time(chosen?.expiresAt)}</dd></dl>
      <p className={s.callout}><Info size={16}/>Fiktives Planfenster: {Math.ceil(missionMinutes)} Minuten einschließlich Rückweg. Markierte Prognoseintervalle überlappen dieses Fenster. Keine Live-Messung.</p>
      <div className={s.tableScroll} tabIndex={0} aria-label="Stündliche Wettervorhersage, horizontal scrollbar"><table className={s.forecast}><thead><tr><th>Zeit (Berlin)</th><th>°C</th><th>Wind m/s</th><th>Richtung °</th><th>Regen mm</th><th>Zustand</th></tr></thead><tbody>{chosen?.hours.map(hour=><tr key={hour.time} className={new Date(hour.time).getTime()<=windowStart+missionMinutes*60_000&&new Date(hour.time).getTime()+(hour.precipitationPeriodHours??1)*3_600_000>windowStart?s.inWindow:undefined}><th>{time(hour.time)}</th><td>{hour.temperatureC??'–'}</td><td>{hour.windSpeedMps??'–'}</td><td>{hour.windFromDegrees??'–'}</td><td>{hour.precipitationMm??'–'} <small>/{hour.precipitationPeriodHours??'?'}h</small></td><td>{hour.symbolCode??'fehlt'}</td></tr>)}</tbody></table></div>
      {!chosen?.hours.length&&<p className={s.micro}>Keine auswertbaren Prognosezeiten verfügbar.</p>}
      <p className={s.micro}>Temperatur: 2 m · Wind: 10 m über Modellboden. Lokale Gebäudewinde und Hindernisse werden nicht abgebildet. Fehlende Pflichtdaten: {chosen?.missingFields?.join(', ')||'keine vollständigen Daten verfügbar'}.</p>
    </div>}
    <p className={s.attribution}>Wetter: <a href="https://www.met.no/" target="_blank" rel="noreferrer">MET Norway</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · Auswahl und Normalisierung</p>
  </section>;
}
