"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import styles from "./species-card.module.css";

export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "mythic";
export type CardVariant = "foil" | "gold" | "holographic" | "first-edition" | "founder-edition" | "expedition-edition" | "event-edition" | "serialized";
export type CardSize = "small" | "medium" | "large";
export type CardDesign = "atlas-pop" | "heritage" | "full-art" | "field-journal" | "specimen" | "art-deco" | "topographic" | "museum" | "expedition" | "prism" | "totem";

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
  imageFit?: "cover" | "contain";
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
  designStyle?: CardDesign;
};

const rarityLabel: Record<CardRarity, string> = { common:"COMMUNE", uncommon:"PEU COMMUNE", rare:"RARE", epic:"ÉPIQUE", mythic:"MYTHIQUE" };
const variantLabel: Partial<Record<CardVariant, string>> = { "first-edition":"PREMIÈRE ÉDITION", "founder-edition":"FONDATEUR", "event-edition":"ÉVÉNEMENT" };

function padded(value:number){ return String(value).padStart(4,"0"); }

export function SpeciesCard(props: SpeciesCardProps) {
  const { imageUrl, commonName, scientificName, family, region, biome, conservationStatus, conservationCode, taxonomy,
    rarity, variants=[], edition="ZOATLAS · Première édition", serialNumber, serialTotal, imagePosition, imageFit="cover", focalPoint,
    isOwned=true, isNew=false, interactive=true, flippable=false, defaultFlipped=false, size="medium", expedition,
    imageCredit, onActivate, className="", designStyle="atlas-pop" } = props;
  const root = useRef<HTMLElement>(null);
  const raf = useRef<number | null>(null);
  const [loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(false);
  const [imageAttempt,setImageAttempt]=useState(0);
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
  const style={"--image-position":focal,containerType:"inline-size"} as CSSProperties;
  const retryImageUrl=(()=>{if(imageAttempt===0)return imageUrl;try{const url=new URL(imageUrl);url.searchParams.set("zoatlas_retry","1");return url.toString()}catch{return imageUrl}})();

  useEffect(()=>{setLoaded(false);setFailed(false);setImageAttempt(0)},[imageUrl]);
  const imageFailed=()=>{setLoaded(false);if(imageAttempt===0)setImageAttempt(1);else setFailed(true)};

  return <article ref={root} className={classes} style={style} data-size={size} data-rarity={rarity} data-design={designStyle} data-variants={variants.join(" ")} data-interactive={interactive?"true":"false"} onPointerMove={move} onPointerLeave={resetTilt} onPointerCancel={resetTilt}
    onClick={activate} onKeyDown={key} role={flippable||onActivate?"button":undefined} tabIndex={flippable||onActivate?0:undefined}
    aria-label={`${commonName}, carte ${rarityLabel[rarity]}${flippable?", retourner la carte":""}`} aria-pressed={flippable?flipped:undefined}>
    <div className={styles.tilt}>
      <div className={styles.flipper}>
        <section className={`${styles.face} ${styles.front} card-face`} aria-hidden={flipped}>
          {!loaded&&!failed&&<div className={`${styles.skeleton} card-skeleton`} style={{zIndex:0}} aria-label="Chargement de la photo"/>}
          {!failed&&imageFit==="contain"&&<Image key={`backdrop-${retryImageUrl}`} className={styles.photo} style={{opacity:.55,zIndex:0,objectFit:"cover",filter:"blur(18px) brightness(.65) saturate(.8)",transform:"scale(1.16)"}} src={retryImageUrl} alt="" fill sizes="390px" unoptimized aria-hidden/>}
          {!failed?<Image key={retryImageUrl} className={`${styles.photo} ${loaded?styles.loaded:""} card-photo`} style={{opacity:1,zIndex:1,objectFit:imageFit,transform:imageFit==="contain"?"scale(.94)":"scale(1.012)"}} src={retryImageUrl} alt={commonName} fill sizes={size==="small"?"(max-width: 560px) 45vw, 210px":size==="large"?"390px":"(max-width: 560px) 45vw, 320px"} unoptimized onLoad={()=>setLoaded(true)} onError={imageFailed}/>:<div className={`${styles.fallback} card-fallback`} style={{zIndex:1}} role="status"><span>ZA</span><b>PHOTO INDISPONIBLE</b></div>}
          <div className={`${styles.photoShade} card-photo-shade`} style={{zIndex:2}}/><div className={`${styles.material} card-material`}/><div className={`${styles.glare} card-glare`}/><div className={`${styles.edge} card-edge`}/>
          <div className="arcane-nameplate"><h3>{isOwned?commonName:"Espèce inconnue"}</h3><span aria-label={rarityLabel[rarity]} title={rarityLabel[rarity]}>◆</span></div>
          <span className="rarity-banner"><i/> {rarityLabel[rarity]}</span>
          <header className={`${styles.topline} card-topline`}>{serialized&&serialNumber!=null&&serialTotal!=null&&<span className={`${styles.serial} ${oneOfOne?styles.oneOfOne:""}`}>#{padded(serialNumber)} / {padded(serialTotal)}</span>}</header>
          {isNew&&<span className={styles.newBadge}>NOUVELLE</span>}
          {expedition&&<span className={styles.expedition}>{expedition}</span>}
          {!isOwned&&<div className={styles.locked}><span>◈</span><b>NON DÉCOUVERTE</b></div>}
          <div className="arcane-type-line"><span className="card-type-copy"><span>Créature</span><i aria-hidden="true"/><span>{family||"Faune sauvage"}</span></span><b><i/> {rarityLabel[rarity]}</b></div>
          <div className={`${styles.panel} card-panel`}>
            <div className={`${styles.titleRow} card-title`}><div><em>{isOwned?scientificName:"À découvrir"}</em></div>{variants.filter(v=>variantLabel[v]).slice(0,1).map(v=><span key={v} className={styles.editionBadge}>{variantLabel[v]}</span>)}</div>
            {chips.length>0&&<div className={`${styles.chips} card-chips`}>{chips.map(c=><span key={c}>{c}</span>)}</div>}
            <p className="arcane-field-note">{[region,biome].filter(Boolean).join(" · ")||"Données de terrain à compléter."}</p>
            <footer className="card-footer"><span className={styles.conservation}>{conservationCode&&<b>{conservationCode}</b>}{conservationStatus||"Statut non renseigné"}</span><span className={styles.brand}>{edition}</span></footer>
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
