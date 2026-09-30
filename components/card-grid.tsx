import type { ReactNode } from "react";
import styles from "./card-grid.module.css";

export function CardGrid({children,className=""}:{children:ReactNode;className?:string}){
  return <div className={`${styles.grid} ${className}`}>{children}</div>;
}
