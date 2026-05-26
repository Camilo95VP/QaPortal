import { Injectable } from '@angular/core';
import { ArtefactoEstimacion, HuEstimacion, SprintEstimacion } from '../models/sprint.model';

/**
 * Tiempos base en minutos por caso de prueba (estándares QA banca/enterprise)
 */
const TIEMPOS = {
  manual: {
    diseno: 10,
    programacion: 0,
    ejecucion: 18,
    retest: 12
  },
  automatizado: {
    diseno: 10,
    programacion: 35,
    ejecucion: 3,
    retest: 2
  }
};

const BUFFER_PERCENT = 0.15; // 15% gabela por bloqueantes/imprevistos
const JORNADA_HORAS = 8;

@Injectable({ providedIn: 'root' })
export class EstimacionService {

  /**
   * Cuenta casos de prueba en un contenido de archivo .md
   * Detecta patrones CP-001, CP-A001, CP-M01, etc.
   */
  contarCasos(contenido: string, tipo: 'automatizado' | 'manual'): number {
    if (!contenido) return 0;
    const pattern = tipo === 'automatizado'
      ? /CP-(?:A)?\d{2,}/g    // CP-001, CP-002, CP-A01...
      : /CP-M\d{2,}/g;         // CP-M01, CP-M02...
    const matches = contenido.match(pattern);
    if (!matches) return 0;
    return new Set(matches).size;
  }

  /**
   * Calcula la estimación para un artefacto individual
   */
  calcularArtefacto(totalCPs: number, tipo: 'automatizado' | 'manual'): ArtefactoEstimacion {
    const t = TIEMPOS[tipo];
    const tiempoDiseno = totalCPs * t.diseno;
    const tiempoProgramacion = totalCPs * t.programacion;
    const tiempoEjecucion = totalCPs * t.ejecucion;
    const tiempoRetest = totalCPs * t.retest;
    const totalSinBuffer = tiempoDiseno + tiempoProgramacion + tiempoEjecucion + tiempoRetest;
    const buffer = Math.ceil(totalSinBuffer * BUFFER_PERCENT);
    const totalConBuffer = totalSinBuffer + buffer;

    return {
      tipo,
      totalCPs,
      tiempoDiseno,
      tiempoProgramacion,
      tiempoEjecucion,
      tiempoRetest,
      buffer,
      totalSinBuffer,
      totalConBuffer
    };
  }

  /**
   * Calcula estimación agregada de una HU dado sus artefactos
   */
  calcularHu(huName: string, artefactos: ArtefactoEstimacion[]): HuEstimacion {
    const totalMinutos = artefactos.reduce((acc, a) => acc + a.totalConBuffer, 0);
    return {
      huName,
      artefactos,
      totalMinutos,
      totalHoras: +(totalMinutos / 60).toFixed(1)
    };
  }

  /**
   * Calcula estimación total del sprint
   */
  calcularSprint(hus: HuEstimacion[]): SprintEstimacion {
    let totalCPsAuto = 0;
    let totalCPsManual = 0;
    for (const hu of hus) {
      for (const a of hu.artefactos) {
        if (a.tipo === 'automatizado') totalCPsAuto += a.totalCPs;
        else totalCPsManual += a.totalCPs;
      }
    }
    const totalMinutos = hus.reduce((acc, h) => acc + h.totalMinutos, 0);
    return {
      totalCPsAuto,
      totalCPsManual,
      totalCPs: totalCPsAuto + totalCPsManual,
      estimacionHoras: +(totalMinutos / 60).toFixed(1),
      estimacionDias: +(totalMinutos / 60 / JORNADA_HORAS).toFixed(1),
      hus
    };
  }

  /**
   * Formatea minutos a string legible "Xh Ym"
   */
  formatearTiempo(minutos: number): string {
    if (minutos <= 0) return '0m';
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
}
