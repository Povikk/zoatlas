"use client";

import { useState } from "react";
import Link from "next/link";
import { SpeciesCard, type CardDesign, type CardRarity } from "@/components/species-card";
import styles from "./cards-lab.module.css";

const tiger = {
  imageUrl:"https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1400&q=90",
  commonName:"Tigre du Bengale", scientificName:"Panthera tigris", family:"Felidae", region:"Asie",
  biome:"Forêt tropicale", conservationCode:"EN", conservationStatus:"En danger", focalPoint:{x:50,y:42},
};

const rarities:CardRarity[]=["common","uncommon","rare","epic","mythic"];
const rarityNames:Record<CardRarity,string>={common:"Commune",uncommon:"Peu commune",rare:"Rare",epic:"Épique",mythic:"Mythique"};
const concepts:Array<{id:CardDesign;number:string;name:string;mood:string;description:string}>=[
  {id:"atlas-pop",number:"★",name:"Atlas Pop",mood:"Recommandation · lisible · collection",description:"Une photo ample, un grand territoire de rareté et une information réduite à l’essentiel. La rareté se reconnaît avant même de lire le badge."},
  {id:"heritage",number:"01",name:"Héritage",mood:"Classique · noble",description:"Un cadre fantasy traditionnel, dense et rassurant, pensé comme un objet ancien."},
  {id:"full-art",number:"02",name:"Plein Art",mood:"Immersif · spectaculaire",description:"L’animal occupe presque toute la carte, les informations flottent sur l’image."},
  {id:"field-journal",number:"03",name:"Carnet de terrain",mood:"Artisanal · naturaliste",description:"Papier, annotation et photo rapportée d’expédition donnent un aspect collection réelle."},
  {id:"specimen",number:"04",name:"Spécimen",mood:"Scientifique · précis",description:"Une plaque de laboratoire transparente, quadrillée et très documentaire."},
  {id:"art-deco",number:"05",name:"Art déco",mood:"Géométrique · premium",description:"Des angles francs, une symétrie forte et une présence très collection de luxe."},
  {id:"topographic",number:"06",name:"Topographique",mood:"Exploration · contemporain",description:"Courbes de niveau, fenêtre panoramique et repères cartographiques structurent la carte."},
  {id:"museum",number:"07",name:"Musée",mood:"Minimal · classe",description:"Une composition sobre, noire et ivoire, inspirée des cartels d’exposition."},
  {id:"expedition",number:"08",name:"Expédition",mood:"Brut · aventure",description:"Cadre renforcé, marquages techniques et tampon de mission pour une carte vécue."},
  {id:"prism",number:"09",name:"Prisme",mood:"Futuriste · effet wow",description:"Verre sombre, reflets spectraux et angles lumineux pour maximiser l’effet rare."},
  {id:"totem",number:"10",name:"Totem organique",mood:"Original · vivant",description:"Un cadre asymétrique aux formes naturelles, presque sculpté autour de l’animal."},
];
type Selection={design:CardDesign;rarity:CardRarity;name:string}|null;

export default function CardsLab(){
  const [selected,setSelected]=useState<Selection>(null);
  const card=(design:CardDesign,rarity:CardRarity,preview=false)=><SpeciesCard {...tiger} rarity={rarity} designStyle={design} variants={rarity==="mythic"?["holographic","serialized"]:rarity==="epic"?["foil"]:[]} serialNumber={rarity==="mythic"?1:undefined} serialTotal={rarity==="mythic"?250:undefined} size="large" className={preview?"concept-card-preview":"concept-card"} interactive={preview}/>;
  return <main className={styles.lab}>
    <header className={styles.hero}><div><p>ZOATLAS · NOUVELLE DIRECTION</p><h1>La rareté doit se voir au premier regard.</h1><span>Atlas Pop reprend ce qui fonctionne dans les meilleures collections numériques : de grandes cartes, peu de texte et une identité de rareté qui occupe toute la surface.</span></div><Link href="/">Retour à ZOATLAS</Link></header>
    <nav className={styles.jump} aria-label="Accès rapide aux concepts">{concepts.map(c=><a key={c.id} href={`#${c.id}`}><b>{c.number}</b>{c.name}</a>)}</nav>
    {concepts.map((concept,index)=><section className={`${styles.concept} ${index===0?"recommended-direction":""}`} id={concept.id} key={concept.id}>
      <div className={styles.conceptHead}><div className={styles.index}>{concept.number}</div><div><p>{concept.mood}</p><h2>{concept.name}</h2><span>{concept.description}</span></div></div>
      <div className={styles.rail}>{rarities.map(rarity=><button className={styles.cardButton} key={rarity} onClick={()=>setSelected({design:concept.id,rarity,name:concept.name})} aria-label={`Inspecter ${concept.name}, rareté ${rarityNames[rarity]}`}>{card(concept.id,rarity)}<span><i/>{rarityNames[rarity]}</span></button>)}</div>
    </section>)}
    {selected&&<div className={styles.modal} role="dialog" aria-modal="true" aria-label={`Aperçu ${selected.name}`} onClick={()=>setSelected(null)}><button className={styles.close} onClick={()=>setSelected(null)} aria-label="Fermer">×</button><div className={styles.modalInner} onClick={event=>event.stopPropagation()}><div className={styles.previewCopy}><p>APERÇU GRAND FORMAT</p><h2>{selected.name}</h2><span>{rarityNames[selected.rarity]}</span><small>Survolez la carte pour tester la lumière. Cliquez en dehors pour fermer.</small></div>{card(selected.design,selected.rarity,true)}</div></div>}
    <footer className={styles.footer}>ZOATLAS · Atlas Pop est la piste recommandée. Les dix explorations précédentes restent disponibles pour comparaison.</footer>
  </main>;
}
