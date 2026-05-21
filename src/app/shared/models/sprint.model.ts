export interface Sprint {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activo' | 'cerrado';
  hus: string[];
}

export interface HuFolder {
  name: string;
  path: string;
  files: string[];
  sprintId?: string;
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
