import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SprintService } from '../shared/services/sprint.service';
import { Sprint, BulkItem, HuTemplate } from '../shared/models/sprint.model';

@Component({
  selector: 'app-bulk-designer',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './bulk-designer.component.html',
  styleUrls: ['./bulk-designer.component.scss']
})
export class BulkDesignerComponent implements OnInit {
  sprints: Sprint[] = [];
  templates: HuTemplate[] = [];
  items: BulkItem[] = [];
  selectedSprint = '';
  generatedPrompts: string[] = [];
  showResults = false;
  copiedIndex = -1;

  constructor(private http: HttpClient, private sprintService: SprintService) {}

  ngOnInit(): void {
    this.sprintService.getSprints().subscribe(s => this.sprints = s);
    this.http.get<HuTemplate[]>('/assets/templates/hu-templates.json').subscribe(t => this.templates = t);
    this.addItem();
  }

  addItem(): void {
    this.items.push({
      id: this.items.length + 1,
      sprintId: this.selectedSprint,
      nombreHU: '',
      descripcion: '',
      criterios: '',
      contexto: '',
      tipoApp: 'Web',
      estado: 'pendiente'
    });
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  applyTemplate(index: number, templateId: string): void {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    this.items[index].descripcion = template.descripcion;
    this.items[index].criterios = template.criterios;
    this.items[index].contexto = template.contexto;
  }

  generateAll(): void {
    this.generatedPrompts = [];
    for (const item of this.items) {
      if (!item.nombreHU.trim() || !item.criterios.trim()) continue;
      const prompt = this.buildPrompt(item);
      this.generatedPrompts.push(prompt);
      item.estado = 'completada';
      item.prompt = prompt;
    }
    this.showResults = true;
  }

  private buildPrompt(item: BulkItem): string {
    const idLine = `* Nombre HU: ${item.nombreHU.trim()}`;
    const tipoLine = `* Tipo de aplicación: ${item.tipoApp}`;
    const consideraciones = item.contexto?.trim()
      ? `\n## ⚠️ CONSIDERACIONES CLAVE\n${item.contexto.trim().split('\n').map(l => `* ${l.trim()}`).join('\n')}\n`
      : '';

    return `@file:qa-test-designer.agent.md

## 📌 INFORMACIÓN DE ENTRADA
${idLine}
${tipoLine}
* Descripción: ${item.descripcion.trim()}

* Criterios de aceptación:
${item.criterios.trim().split('\n').map(l => `  ${l.trim()}`).join('\n')}
${consideraciones}
## 🎯 ENFOQUE ESPECÍFICO
* Prioriza casos automatizables: lógica, validaciones, reglas de negocio, integraciones, mensajes de error.
* Casos manuales solo para: UI visual subjetiva, responsive en dispositivos reales, exploratorio.
* No repetir casos entre archivos; cada caso debe ser único.

## 🚀 EJECUCIÓN
Genera los artefactos con los permisos del usuario y crea:
* casos_automatizables.md  (Gherkin español — Happy Path / Full Error / Casos Borde)
* casos_manuales.md        (solo casos no automatizables)
* automation_v1.spec.ts    (Playwright + TypeScript, pasos Gherkin como comentarios)
* Incluye trazabilidad: <!-- TRAZA: CA-XX=CP-AXX,CP-MXX --> al final de cada .md
* Incluye testData en cada test del spec.ts con datos válidos/inválidos/borde
* Guarda en: qa-portal/src/assets/repo-files/${this.selectedSprint ? this.selectedSprint + '/' : ''}${item.nombreHU.trim()}/`;
  }

  async copyPrompt(index: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.generatedPrompts[index]);
      this.copiedIndex = index;
      setTimeout(() => this.copiedIndex = -1, 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = this.generatedPrompts[index];
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.copiedIndex = index;
      setTimeout(() => this.copiedIndex = -1, 2000);
    }
  }

  async copyAll(): Promise<void> {
    const all = this.generatedPrompts.join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(all);
    } catch {
      const el = document.createElement('textarea');
      el.value = all;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  }

  importCSV(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const cols = this.parseCSVLine(lines[i]);
        if (cols.length >= 3) {
          this.items.push({
            id: this.items.length + 1,
            sprintId: this.selectedSprint,
            nombreHU: cols[0]?.trim() || '',
            descripcion: cols[1]?.trim() || '',
            criterios: cols[2]?.trim() || '',
            contexto: cols[3]?.trim() || '',
            tipoApp: cols[4]?.trim() || 'Web',
            estado: 'pendiente'
          });
        }
      }
    };
    reader.readAsText(file);
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
      else { current += ch; }
    }
    result.push(current);
    return result;
  }

  getCompletedCount(): number {
    return this.items.filter(i => i.estado === 'completada').length;
  }
}
