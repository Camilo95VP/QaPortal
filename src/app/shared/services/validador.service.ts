import { Injectable } from '@angular/core';
import { ValidationResult } from '../models/sprint.model';

@Injectable({ providedIn: 'root' })
export class ValidadorService {

  /**
   * Valida formato Gherkin correcto en un .md
   */
  validarGherkin(md: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Check "Dado que" (no solo "Dado")
    const dadoLines = md.match(/^\s*Dado\b.*/gm) || [];
    const dadoSinQue = dadoLines.filter(l => !/Dado\s+que\b/i.test(l));
    if (dadoSinQue.length > 0) {
      results.push({
        tipo: 'error',
        mensaje: `${dadoSinQue.length} línea(s) "Dado" sin "que"`,
        detalle: dadoSinQue.join('\n')
      });
    }

    // Check empty blocks
    const cpBlocks = md.split(/(?=CP-[AM]\d+)/);
    for (const block of cpBlocks) {
      const idMatch = block.match(/^(CP-[AM]\d+)/);
      if (!idMatch) continue;
      const id = idMatch[1];
      if (!/Dado/i.test(block)) {
        results.push({ tipo: 'warning', mensaje: `${id}: falta bloque "Dado"` });
      }
      if (!/Cuando/i.test(block)) {
        results.push({ tipo: 'warning', mensaje: `${id}: falta bloque "Cuando"` });
      }
      if (!/Entonces/i.test(block)) {
        results.push({ tipo: 'warning', mensaje: `${id}: falta bloque "Entonces"` });
      }
    }

    if (results.length === 0) {
      results.push({ tipo: 'success', mensaje: 'Formato Gherkin válido' });
    }
    return results;
  }

  /**
   * Verifica que no hay CPs duplicados entre automatizables y manuales
   */
  validarConsistencia(autoMd: string, manualMd: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    const extractCPs = (md: string) => {
      const matches = md.match(/CP-[AM]\d+/g) || [];
      return [...new Set(matches)];
    };

    const autoCPs = extractCPs(autoMd);
    const manualCPs = extractCPs(manualMd);

    // Check for duplicates across files
    const duplicados = autoCPs.filter(cp => manualCPs.includes(cp));
    if (duplicados.length > 0) {
      results.push({
        tipo: 'error',
        mensaje: `${duplicados.length} CP(s) duplicado(s) entre archivos`,
        detalle: duplicados.join(', ')
      });
    }

    // Check for similar titles (fuzzy)
    if (results.length === 0) {
      results.push({ tipo: 'success', mensaje: 'Sin duplicados entre archivos' });
    }
    return results;
  }

  /**
   * Verifica que el conteo de CPs en .md == tests en .spec.ts
   */
  validarConteoPlaywright(autoMd: string, specTs: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    const cpCount = (autoMd.match(/CP-A\d+/g) || []).length;
    // unique CPs
    const uniqueCPs = new Set(autoMd.match(/CP-A\d+/g) || []).size;
    const testCount = (specTs.match(/\btest\s*\(/g) || []).length;

    if (uniqueCPs !== testCount) {
      results.push({
        tipo: 'error',
        mensaje: `Desajuste: ${uniqueCPs} CPs automatizables vs ${testCount} tests en spec`,
        detalle: `Se esperan exactamente ${uniqueCPs} tests para ${uniqueCPs} casos`
      });
    } else {
      results.push({ tipo: 'success', mensaje: `Conteo correcto: ${uniqueCPs} CPs = ${testCount} tests` });
    }
    return results;
  }

  /**
   * Ejecuta todas las validaciones sobre una carpeta HU
   */
  validarCompleto(files: { [name: string]: string }): ValidationResult[] {
    const results: ValidationResult[] = [];
    const autoMd = files['casos_automatizables.md'] || '';
    const manualMd = files['casos_manuales.md'] || '';
    const specTs = files['automation_v1.spec.ts'] || '';

    if (autoMd) {
      results.push(...this.validarGherkin(autoMd));
    }
    if (manualMd) {
      results.push(...this.validarGherkin(manualMd));
    }
    if (autoMd && manualMd) {
      results.push(...this.validarConsistencia(autoMd, manualMd));
    }
    if (autoMd && specTs) {
      results.push(...this.validarConteoPlaywright(autoMd, specTs));
    }

    return results;
  }
}
