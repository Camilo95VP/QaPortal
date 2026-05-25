import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Sprint, HuTemplate } from '../shared/models/sprint.model';
import { SprintService } from '../shared/services/sprint.service';
import { ToastService } from '../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

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
  sprintHus: any[] = [];
  selectedSprint = '';
  selectedTemplate = '';
  tipoApp = 'Web';

  constructor(private fb: FormBuilder, private http: HttpClient, private sprintService: SprintService, private route: ActivatedRoute, private toast: ToastService, private router: Router) {
    this.form = this.fb.group({
      nombreHU: ['', Validators.required],
      descripcion: ['', Validators.required],
      criterios: ['', Validators.required],
      contexto: ['']
    });
  }

  ngOnInit(): void {
    this.http.get<HuTemplate[]>('/assets/templates/hu-templates.json').subscribe(t => this.templates = t);
    this.sprintService.getSprints().subscribe(s => {
      this.sprints = s;
      // If query params include sprint/hu, preselect after sprints loaded
      this.route.queryParamMap.subscribe(q => {
        const sp = q.get('sprint');
        const hu = q.get('hu');
        if (sp) {
          this.onSprintChange(sp);
          this.selectedSprint = sp;
          if (hu) {
            // wait briefly for sprintHus to load
            setTimeout(() => this.onHuSelect(hu), 300);
          }
        }
      });
    });
  }

  onSprintChange(sprintId: string): void {
    this.selectedSprint = sprintId;
    this.selectedTemplate = '';
    this.sprintHus = [];
    if (!sprintId) return;
    this.sprintService.getSprintHus(sprintId).subscribe(list => {
      this.sprintHus = list || [];
    });
  }

  onHuSelect(huName: string): void {
    if (!huName) {
      this.form.reset({ nombreHU: '', descripcion: '', criterios: '', contexto: '' });
      return;
    }

    // Use data already loaded from husInfo (sprints.json) — no HTTP calls needed
    const hu = this.sprintHus.find((h: any) => h.name === huName);
    if (hu) {
      const descripcion = (hu as any).descripcion || '';
      const criterios   = (hu as any).criterios   || '';
      this.form.patchValue({
        nombreHU: huName,
        descripcion,
        criterios
      });
      return;
    }

    // Fallback: only set the name (HU has no stored metadata yet)
    this.form.patchValue({ nombreHU: huName, descripcion: '', criterios: '' });
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

  // removed: requireEitherHabilitadorOrNombre - nombreHU is now required

  generatePrompt(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombreHU, descripcion, criterios, contexto } = this.form.value;
    const idLine = nombreHU?.trim() ? `* Nombre HU: ${nombreHU.trim()}` : '';

    const tipoLine = `* Tipo de aplicación: ${this.tipoApp}`;

    const consideraciones = contexto?.trim()
      ? `\n## ⚠️ CONSIDERACIONES CLAVE\n${contexto.trim().split('\n').map((l: string) => `* ${l.trim()}`).join('\n')}\n`
      : '';

    const huName = (nombreHU?.trim() || 'HU_sin_identificar');
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
* Nomenclatura de casos: automatizables → CP-001, CP-002, CP-003... | manuales → CP-M01, CP-M02, CP-M03...
* La carpeta YA EXISTE en ${outputPath} — escribe los artefactos directamente ahí, NO crear carpeta nueva.
* En cada test del spec.ts incluye un objeto testData con datos válidos, inválidos y borde.
* Trabaja con el agente de forma @qa-test-designer.agent.md para que el prompt se mantenga actualizado.`;

    // If sprint selected, register HU in sprint
    if (this.selectedSprint && huName !== 'HU_sin_identificar') {
      const payload: any = { descripcion: (descripcion || '').trim(), criterios: (criterios || '').trim() };
      this.sprintService.addHuToSprint(this.selectedSprint, huName, payload).subscribe();
    }

    setTimeout(() => {
      this.promptOutput?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  saveMetadata(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedSprint) {
      this.toast.show('warning', 'Selecciona un sprint para guardar la HU');
      return;
    }
    const { nombreHU, descripcion, criterios } = this.form.value;
    this.sprintService.addHuToSprint(this.selectedSprint, nombreHU, { descripcion: (descripcion || '').trim(), criterios: (criterios || '').trim() })
      .subscribe({
        next: () => {
          this.toast.show('success', `HU ${nombreHU} guardada en sprint`);
          // navigate back to sprint detail for quick feedback
          this.router.navigate(['/sprints', this.selectedSprint]);
        },
        error: () => this.toast.show('error', 'Error guardando la HU')
      });
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
}
