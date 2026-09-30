"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import styles from "./species-card.module.css";

export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "mythic";
export type CardVariant = "foil" | "gold" | "holographic" | "first-edition" | "founder-edition" | "expedition-edition" | "event-edition" | "serialized";
export type CardSize = "small" | "medium" | "large";

export type SpeciesCardProps = {
  imageUrl: string;
  commonName: string;
  scientificName: string;
  family?: string | null;
  region?: string | null;
  biome?: string | null;
  conservationStatus?: string | null;
  conservationCode?: string | null;
  taxonomy?: Array<{ label: string; value: string }>;
  rarity: CardRarity;
  variants?: CardVariant[];
  edition?: string;
  serialNumber?: number;
  serialTotal?: number;
  imagePosition?: string;
  focalPoint?: { x: number; y: number };
  isOwned?: boolean;
  isNew?: boolean;
  interactive?: boolean;
  flippable?: boolean;
  defaultFlipped?: boolean;
  size?: CardSize;
  expedition?: string;
  imageCredit?: { author?: string; license?: string; source?: string };
  onActivate?: () => void;
  className?: string;
};

const rarityLabel: Record<CardRarity, string> = { common:"COMMUNE", uncommon:"PEU COMMUNE", rare:"RARE", epic:"ÉPIQUE", mythic:"MYTHIQUE" };
const variantLabel: Partial<Record<CardVariant, string>> = { "first-edition":"FIRST EDITION", "founder-edition":"FOUNDER", "event-edition":"EVENT" };

function padded(value:number){ return String(value).padStart(4,"0"); }

export function SpeciesCard(props: SpeciesCardProps) {
  const { imageUrl, commonName, scientificName, family, region, biome, conservationStatus, conservationCode, taxonomy,
    rarity, variants=[], edition="ZOATLAS · Première édition", serialNumber, serialTotal, imagePosition, focalPoint,
    isOwned=true, isNew=false, interactive=true, flippable=false, defaultFlipped=false, size="medium", expedition,
    imageCredit, onActivate, className="" } = props;
  const root = useRef<HTMLElement>(null);
  const raf = useRef<number | null>(null);
  const [loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(false);
  const [flipped,setFlipped]=useState(defaultFlipped);
  const chips=[family,region,biome].filter((v):v is string=>Boolean(v)).slice(0,3);
  const serialized=variants.includes("serialized") || (serialNumber != null && serialTotal != null);
  const oneOfOne=serialNumber===1 && serialTotal===1;
  const focal=imagePosition || (focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : "50% 50%");
  const classes=[styles.shell,"species-card",styles[size],styles[rarity],!isOwned?styles.undiscovered:"",...variants.map(v=>styles[`variant_${v.replaceAll("-","_")}`]),flipped?styles.flipped:"",className].filter(Boolean).join(" ");

  useEffect(()=>()=>{if(raf.current)cancelAnimationFrame(raf.current)},[]);
  const resetTilt=()=>{const el=root.current;if(!el)return;el.style.setProperty("--rx","0deg");el.style.setProperty("--ry","0deg");el.style.setProperty("--gx","50%");el.style.setProperty("--gy","50%");el.style.setProperty("--shadow-x","0px");el.style.setProperty("--shadow-y","16px");el.style.setProperty("--glare-opacity","0");};
  const move=(event:PointerEvent<HTMLElement>)=>{if(!interactive||event.pointerType==="touch")return;const el=root.current;if(!el)return;const rect=el.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width;const y=(event.clientY-rect.top)/rect.height;if(raf.current)cancelAnimationFrame(raf.current);raf.current=requestAnimationFrame(()=>{el.style.setProperty("--rx",`${((.5-y)*12).toFixed(2)}deg`);el.style.setProperty("--ry",`${((x-.5)*14).toFixed(2)}deg`);el.style.setProperty("--gx",`${(x*100).toFixed(1)}%`);el.style.setProperty("--gy",`${(y*100).toFixed(1)}%`);el.style.setProperty("--shadow-x",`${((.5-x)*12).toFixed(1)}px`);el.style.setProperty("--shadow-y",`${(12+y*9).toFixed(1)}px`);el.style.setProperty("--glare-opacity","1");});};
  const activate=()=>{if(flippable)setFlipped(v=>!v);else onActivate?.()};
  const key=(event:KeyboardEvent<HTMLElement>)=>{if((event.key==="Enter"||event.key===" ")&&(flippable||onActivate)){event.preventDefault();activate()}};
  const style={"--image-position":focal} as CSSProperties;

  return <article ref={root} className={classes} style={style} onPointerMove={move} onPointerLeave={resetTilt} onPointerCancel={resetTilt}
    onClick={activate} onKeyDown={key} role={flippable||onActivate?"button":undefined} tabIndex={flippable||onActivate?0:undefined}
    aria-label={`${commonName}, carte ${rarityLabel[rarity]}${flippable?", retourner la carte":""}`} aria-pressed={flippable?flipped:undefined}>
    <div className={styles.tilt}>
      <div className={styles.flipper}>
        <section className={`${styles.face} ${styles.front}`} aria-hidden={flipped}>
          {!loaded&&!failed&&<div className={styles.skeleton} style={{zIndex:0}} aria-label="Chargement de la photo"/>}
          {!failed?<Image className={`${styles.photo} ${loaded?styles.loaded:""}`} style={{opacity:1,zIndex:1}} src={imageUrl} alt={commonName} fill sizes={size==="small"?"(max-width: 560px) 45vw, 240px":size==="large"?"390px":"(max-width: 560px) 45vw, 320px"} unoptimized onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}/>:<div className={styles.fallback} style={{zIndex:1}}><span>ZA</span><b>PHOTO INDISPONIBLE</b></div>}
          <div className={styles.photoShade} style={{zIndex:2}}/><div className={styles.material}/><div className={styles.glare}/><div className={styles.edge}/>
          <header className={styles.topline}><span className={styles.rarity}><i/> {rarityLabel[rarity]}</span>{serialized&&serialNumber!=null&&serialTotal!=null&&<span className={`${styles.serial} ${oneOfOne?styles.oneOfOne:""}`}>#{padded(serialNumber)} / {padded(serialTotal)}</span>}</header>
          {isNew&&<span className={styles.newBadge}>NOUVELLE</span>}
          {expedition&&<span className={styles.expedition}>{expedition}</span>}
          {!isOwned&&<div className={styles.locked}><span>◈</span><b>NON DÉCOUVERTE</b></div>}
          <div className={styles.panel}>
            <div className={styles.titleRow}><div><h3>{isOwned?commonName:"Espèce inconnue"}</h3><em>{isOwned?scientificName:"À découvrir"}</em></div>{variants.filter(v=>variantLabel[v]).slice(0,1).map(v=><span key={v} className={styles.editionBadge}>{variantLabel[v]}</span>)}</div>
            {size!=="small"&&chips.length>0&&<div className={styles.chips}>{chips.map(c=><span key={c}>{c}</span>)}</div>}
            <footer><span className={styles.conservation}>{conservationCode&&<b>{conservationCode}</b>}{conservationStatus||"Statut non renseigné"}</span><span className={styles.brand}>{edition}</span></footer>
          </div>
        </section>
        <section className={`${styles.face} ${styles.back}`} aria-hidden={!flipped}>
          <div className={styles.backMark}>ZA</div><p className={styles.kicker}>GUIDE DE TERRAIN</p><h3>{commonName}</h3><em>{scientificName}</em>
          <dl>{(taxonomy?.length?taxonomy:[{label:"Famille",value:family||"Non renseignée"},{label:"Répartition",value:region||"Non renseignée"},{label:"Biome",value:biome||"Non renseigné"}]).filter(x=>x.value).map(x=><div key={x.label}><dt>{x.label}</dt><dd>{x.value}</dd></div>)}</dl>
          {(conservationStatus||conservationCode)&&<div className={styles.backConservation}><span>CONSERVATION</span><b>{[conservationCode,conservationStatus].filter(Boolean).join(" — ")}</b></div>}
          {imageCredit&&<div className={styles.credit}><span>PHOTO</span><b>{imageCredit.author||"Auteur non renseigné"}</b><small>{[imageCredit.license,imageCredit.source].filter(Boolean).join(" · ")}</small></div>}
          <p className={styles.flipHint}>Cliquer pour revenir au recto</p>
        </section>
      </div>
    </div>
  </article>;
}
