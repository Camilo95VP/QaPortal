import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-test-designer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-designer.component.html',
  styleUrls: ['./test-designer.component.scss']
})
export class TestDesignerComponent {
  @ViewChild('promptOutput') promptOutput!: ElementRef;

  form: FormGroup;
  generatedPrompt = '';
  copied = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      habilitador: [''],
      nombreHU: [''],
      descripcion: ['', Validators.required],
      criterios: ['', Validators.required],
      contexto: ['']
    }, { validators: this.requireEitherHabilitadorOrNombre });
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

    const consideraciones = contexto?.trim()
      ? `\n## ⚠️ CONSIDERACIONES CLAVE\n${contexto.trim().split('\n').map((l: string) => `* ${l.trim()}`).join('\n')}\n`
      : '';

    this.generatedPrompt =
`@file:qa-test-designer.agent.md

## 📌 INFORMACIÓN DE ENTRADA
${idLine}
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
* asegurate de trabajar con el agente de forma @qa-test-designer.agent.md para que el prompt se mantenga actualizado y puedas iterar sobre él.`;

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
