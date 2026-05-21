import { Injectable } from '@angular/core';
import { TrazabilidadRow } from '../models/sprint.model';

@Injectable({ providedIn: 'root' })
export class TrazabilidadService {

  /**
   * Parsea el comentario HTML de trazabilidad embebido en los .md
   * Formato: <!-- TRAZA: CA-01=CP-A01,CP-A03 | CA-02=CP-A02,CP-M01 -->
   */
  parseTrazabilidad(md: string): Map<string, string[]> {
    const map = new Map<string, string[]>();
    const match = md.match(/<!--\s*TRAZA:\s*(.*?)\s*-->/s);
    if (!match) return map;

    const entries = match[1].split('|').map(e => e.trim()).filter(Boolean);
    for (const entry of entries) {
      const [ca, cps] = entry.split('=').map(s => s.trim());
      if (ca && cps) {
        map.set(ca, cps.split(',').map(c => c.trim()).filter(Boolean));
      }
    }
    return map;
  }

  /**
   * Extrae criterios de aceptación del markdown (CA-XX patterns)
   */
  extraerCriterios(md: string): string[] {
    const criterios: string[] = [];
    const regex = /\bCA-?\d+\b/gi;
    let match;
    while ((match = regex.exec(md)) !== null) {
      const normalized = match[0].toUpperCase();
      if (!criterios.includes(normalized)) {
        criterios.push(normalized);
      }
    }
    return criterios.sort();
  }

  /**
   * Genera la matriz de trazabilidad completa
   */
  generarMatriz(automatizablesMd: string, manualesMd: string, criterios?: string[]): TrazabilidadRow[] {
    const trazaAuto = this.parseTrazabilidad(automatizablesMd);
    const trazaManual = this.parseTrazabilidad(manualesMd);

    // Merge all CAs found
    const allCAs = new Set<string>();
    if (criterios) {
      criterios.forEach(ca => allCAs.add(ca));
    }
    trazaAuto.forEach((_, ca) => allCAs.add(ca));
    trazaManual.forEach((_, ca) => allCAs.add(ca));

    // If no explicit criterios, also scan for CA patterns in the markdown
    if (!criterios) {
      this.extraerCriterios(automatizablesMd).forEach(ca => allCAs.add(ca));
      this.extraerCriterios(manualesMd).forEach(ca => allCAs.add(ca));
    }

    const rows: TrazabilidadRow[] = [];
    const sortedCAs = Array.from(allCAs).sort();

    for (const ca of sortedCAs) {
      const cpsAuto = trazaAuto.get(ca) || [];
      const cpsManual = trazaManual.get(ca) || [];
      rows.push({
        ca,
        cpsAuto,
        cpsManual,
        cubierto: cpsAuto.length > 0 || cpsManual.length > 0
      });
    }

    return rows;
  }

  /**
   * Detecta criterios sin cobertura
   */
  detectarGaps(rows: TrazabilidadRow[]): string[] {
    return rows.filter(r => !r.cubierto).map(r => r.ca);
  }

  /**
   * Calcula porcentaje de cobertura
   */
  calcularCobertura(rows: TrazabilidadRow[]): number {
    if (rows.length === 0) return 100;
    const cubiertos = rows.filter(r => r.cubierto).length;
    return Math.round((cubiertos / rows.length) * 100);
  }
}
