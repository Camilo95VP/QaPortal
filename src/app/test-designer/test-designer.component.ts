import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Sprint, HuTemplate } from '../shared/models/sprint.model';
import { SprintService } from '../shared/services/sprint.service';

@Component({
  selector: 'app-test-designer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './test-designer.component.html',
  styleUrls: ['./test-designer.component.scss']
})
export class TestDesignerComponent implements OnInit {
  @ViewChild('promptOutput') promptOutput!: ElementRef;

  form: FormGroup;
  generatedPrompt = '';
  copied = false;
  templates: HuTemplate[] = [];
  sprints: Sprint[] = [];
  selectedSprint = '';
  selectedTemplate = '';
  tipoApp = 'Web';

  constructor(private fb: FormBuilder, private http: HttpClient, private sprintService: SprintService) {
    this.form = this.fb.group({
      habilitador: [''],
      nombreHU: [''],
      descripcion: ['', Validators.required],
      criterios: ['', Validators.required],
      contexto: ['']
    }, { validators: this.requireEitherHabilitadorOrNombre });
  }

  ngOnInit(): void {
    this.http.get<HuTemplate[]>('/assets/templates/hu-templates.json').subscribe(t => this.templates = t);
    this.sprintService.getSprints().subscribe(s => this.sprints = s);
  }

  applyTemplate(templateId: string): void {
    const tmpl = this.templates.find(t => t.id === templateId);
    if (!tmpl) return;
    this.form.patchValue({
      descripcion: tmpl.descripcion,
      criterios: tmpl.criterios,
      contexto: tmpl.contexto
    });
  }

  requireEitherHabilitadorOrNombre(control: AbstractControl): ValidationErrors | null {
    const h = control.get('habilitador')?.value;
    const n = control.get('nombreHU')?.value;
    const has = (h && String(h).trim().length > 0) || (n && String(n).trim().length > 0);
    return has ? null : { requireOne: true };
  }

  generatePrompt(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { habilitador, nombreHU, descripcion, criterios, contexto } = this.form.value;

    const idLine = [habilitador?.trim() ? `* Habilitador: ${habilitador.trim()}` : '',
                    nombreHU?.trim()   ? `* Nombre HU: ${nombreHU.trim()}`   : '']
                  .filter(Boolean).join('\n');

    const tipoLine = `* Tipo de aplicación: ${this.tipoApp}`;

    const consideraciones = contexto?.trim()
      ? `\n## ⚠️ CONSIDERACIONES CLAVE\n${contexto.trim().split('\n').map((l: string) => `* ${l.trim()}`).join('\n')}\n`
      : '';

    const huName = (nombreHU?.trim() || habilitador?.trim() || 'HU_sin_identificar');
    const outputPath = this.selectedSprint
      ? `qa-portal/src/assets/repo-files/${this.selectedSprint}/${huName}/`
      : `qa-portal/src/assets/repo-files/${huName}/`;

    this.generatedPrompt =
`@file:qa-test-designer.agent.md

## 📌 INFORMACIÓN DE ENTRADA
${idLine}
${tipoLine}
* Descripción: ${descripcion.trim()}

* Criterios de aceptación:
${criterios.trim().split('\n').map((l: string) => `  ${l.trim()}`).join('\n')}
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
* Incluye trazabilidad al final de cada .md: <!-- TRAZA: CA-XX=CP-AXX,CP-MXX | CA-YY=CP-AYY -->
* En cada test del spec.ts incluye un objeto testData con datos válidos, inválidos y borde.
* Guarda en: ${outputPath}
* Trabaja con el agente de forma @qa-test-designer.agent.md para que el prompt se mantenga actualizado.`;

    // If sprint selected, register HU in sprint
    if (this.selectedSprint && huName !== 'HU_sin_identificar') {
      this.sprintService.addHuToSprint(this.selectedSprint, huName).subscribe();
    }

    setTimeout(() => {
      this.promptOutput?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  async copyToClipboard(): Promise<void> {
    if (!this.generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(this.generatedPrompt);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    } catch {
      // fallback para entornos sin permiso de clipboard
      const el = document.createElement('textarea');
      el.value = this.generatedPrompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  isEitherInvalid(): boolean {
    return !!(this.form.hasError('requireOne') && (
      this.form.get('habilitador')?.touched || this.form.get('nombreHU')?.touched
    ));
  }
}
