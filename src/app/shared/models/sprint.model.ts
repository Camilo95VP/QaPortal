export interface Sprint {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activo' | 'cerrado';
  hus: string[];
  husInfo?: { [nombre: string]: { descripcion?: string; criterios?: string } };
}

export interface HuFolder {
  name: string;
  path: string;
  files: string[];
  sprintId?: string;
  descripcion?: string;
  criterios?: string;
}

export interface HuMetadata {
  version: number;
  fecha: string;
  nombreHU: string;
  sprintId: string;
  promptUsado: string;
  tipoApp: string;
}

export interface TrazabilidadRow {
  ca: string;
  cpsAuto: string[];
  cpsManual: string[];
  cubierto: boolean;
}

export interface ValidationResult {
  tipo: 'error' | 'warning' | 'success';
  mensaje: string;
  detalle?: string;
}

export interface HuTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  criterios: string;
  contexto: string;
}

export interface BulkItem {
  id: number;
  sprintId: string;
  nombreHU: string;
  descripcion: string;
  criterios: string;
  contexto: string;
  tipoApp: string;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'error';
  prompt?: string;
}

export interface DashboardMetrics {
  totalSprints: number;
  totalHUs: number;
  totalCPsAuto: number;
  totalCPsManual: number;
  coberturaPromedio: number;
  ratioAutoManual: number;
  husConGaps: string[];
}

/** Métricas de estimación de tiempo por artefacto */
export interface ArtefactoEstimacion {
  tipo: 'automatizado' | 'manual';
  totalCPs: number;
  tiempoDiseno: number;       // minutos
  tiempoProgramacion: number; // minutos (solo automatizado)
  tiempoEjecucion: number;    // minutos (primera ejecución)
  tiempoRetest: number;       // minutos
  buffer: number;             // minutos (15%)
  totalSinBuffer: number;     // minutos
  totalConBuffer: number;     // minutos
}

/** Métricas agregadas de una HU */
export interface HuEstimacion {
  huName: string;
  artefactos: ArtefactoEstimacion[];
  totalMinutos: number;
  totalHoras: number;
}

/** Métricas agregadas de un sprint */
export interface SprintEstimacion {
  totalCPsAuto: number;
  totalCPsManual: number;
  totalCPs: number;
  estimacionHoras: number;
  estimacionDias: number; // asumiendo jornada 8h
  hus: HuEstimacion[];
}
