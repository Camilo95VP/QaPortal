import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SprintService } from '../shared/services/sprint.service';
import { ConfirmService } from '../shared/services/confirm.service';
import { ToastService } from '../shared/services/toast.service';
import { Sprint } from '../shared/models/sprint.model';

@Component({
  selector: 'app-sprint-detail',
  standalone: true,
  // FormsModule required for [(ngModel)] in the template
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './sprint-detail.component.html',
  styleUrls: ['./sprint-detail.component.scss']
})
export class SprintDetailComponent implements OnInit {
  sprintId = '';
  sprint: Sprint | null = null;
  hus: Array<{name:string, files:string[]}> = [];
  loading = false;
  metrics = { totalCPsAuto: 0, totalCPsManual: 0 };
  selectedHu: any = null;
  editMode = false;
  editDescripcion = '';
  editCriterios = '';

  constructor(private route: ActivatedRoute, private router: Router, private sprintService: SprintService, private http: HttpClient, private confirm: ConfirmService, private toast: ToastService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id') || '';
      if (!id) return;
      this.sprintId = id;
      // ensure we have the latest sprints and react to changes
      this.sprintService.getSprints().subscribe();
      this.sprintService.sprints$.subscribe(list => {
        this.sprint = list.find(s => s.id === this.sprintId) || null;
        if (this.sprint) {
          this.loadHus();
        } else {
          this.hus = [];
        }
      });
    });
  }

  loadSprint(): void {
    // kept for backward compatibility but prefer subscribing to sprints$
    this.sprintService.getSprints().subscribe(list => {
      this.sprint = list.find(s => s.id === this.sprintId) || null;
    });
  }

  loadHus(): void {
    this.loading = true;
    this.sprintService.getSprintHus(this.sprintId).subscribe(list => {
      this.hus = list.map((h: any) => ({
          name:        h.name,
          files:       h.files       || [],
          descripcion: h.descripcion || '',
          criterios:   h.criterios   || ''
        }));
      this.computeMetrics();
      this.loading = false;
    }, () => this.loading = false);
  }

  computeMetrics(): void {
    // Count CP-A and CP-M across HUs in this sprint (incrementally)
    this.metrics = { totalCPsAuto: 0, totalCPsManual: 0 };
    for (const h of this.hus) {
      const folder = `${this.sprintId}/${h.name}`;
      const urlAuto = `/api/repo-files/content?folder=${encodeURIComponent(folder)}&path=casos_automatizables.md`;
      const urlMan = `/api/repo-files/content?folder=${encodeURIComponent(folder)}&path=casos_manuales.md`;

      fetch(urlAuto).then(r => r.ok ? r.text() : '').then(txt => {
        try { const matches = (txt || '').match(/CP-A\d+/g) || []; this.metrics.totalCPsAuto += new Set(matches).size; } catch(e) {}
      }).catch(() => {});

      fetch(urlMan).then(r => r.ok ? r.text() : '').then(txt => {
        try { const matches = (txt || '').match(/CP-M\d+/g) || []; this.metrics.totalCPsManual += new Set(matches).size; } catch(e) {}
      }).catch(() => {});
    }
  }

  selectHu(h: any): void {
    // Los datos de descripcion/criterios vienen directamente del GET /api/sprints/:id/hus
    // que los lee de husInfo en sprints.json — no necesita fetch a archivos
    this.selectedHu = {
      name:        h.name,
      files:       h.files       || [],
      descripcion: h.descripcion || '',
      criterios:   h.criterios   || ''
    };
    this.editMode = false;
  }

  startEditHu(): void {
    if (!this.selectedHu) return;
    this.editDescripcion = this.selectedHu.descripcion || '';
    this.editCriterios = this.selectedHu.criterios || '';
    this.editMode = true;
  }

  cancelEditHu(): void {
    this.editMode = false;
    this.editDescripcion = '';
    this.editCriterios = '';
  }

  saveEditedHu(): void {
    if (!this.selectedHu) return;
    const huName = this.selectedHu.name;
    const payload: any = { descripcion: (this.editDescripcion || '').trim(), criterios: (this.editCriterios || '').trim() };
    this.sprintService.addHuToSprint(this.sprintId, huName, payload).subscribe({
      next: () => {
        // update local UI
        this.selectedHu.descripcion = payload.descripcion;
        this.selectedHu.criterios = payload.criterios;
        // update hus list entry
        this.hus = this.hus.map(h => h.name === huName ? { ...h, descripcion: payload.descripcion, criterios: payload.criterios } : h);
        this.toast.show('success', `HU ${huName} actualizada`);
        this.editMode = false;
      },
      error: () => this.toast.show('error', 'Error actualizando HU')
    });
  }

  goToNuevoDiseno(hu?: string): void {
    const params: any = { sprint: this.sprintId };
    if (hu) params.hu = hu;
    this.router.navigate(['/test-designer'], { queryParams: params });
  }

  goToEditarHu(hu: string): void {
    const params: any = { sprint: this.sprintId, hu, edit: '1' };
    this.router.navigate(['/test-designer'], { queryParams: params });
  }

  goToAgregarHu(hu?: string): void {
    const params: any = { sprint: this.sprintId };
    if (hu) params.hu = hu;
    this.router.navigate(['/bulk-designer'], { queryParams: params });
  }

  goToArtefactos(hu?: string): void {
    const params: any = { sprint: this.sprintId };
    if (hu) params.hu = hu;
    this.router.navigate(['/repo-files'], { queryParams: params });
  }

  async removeHu(huName: string): Promise<void> {
    const ok = await this.confirm.confirm(`¿Eliminar "${huName}" del sprint ${this.sprint?.nombre || ''}?`);
    if (!ok) return;
    this.sprintService.removeHuFromSprint(this.sprintId, huName).subscribe({
      next: () => {
        // update local state immediately so the UI reflects the change
        this.hus = this.hus.filter(h => h.name !== huName);
        if (this.sprint && Array.isArray(this.sprint.hus)) {
          this.sprint.hus = this.sprint.hus.filter((n: string) => n !== huName);
        }
        if (this.selectedHu && this.selectedHu.name === huName) {
          this.selectedHu = null;
        }
        this.computeMetrics();
        this.toast.show('success', `HU ${huName} eliminada del sprint`);

        // attempt to remove the physical folder for the HU under the sprint
        const folderUrl = `/api/repo-files/folder?folder=${encodeURIComponent(huName)}&sprint=${encodeURIComponent(this.sprintId)}`;
        this.http.delete(folderUrl).subscribe({
          next: () => this.toast.show('success', `Carpeta física de ${huName} eliminada`),
          error: () => this.toast.show('warning', `No se pudo eliminar la carpeta física de ${huName} (ver logs).`)
        });

        // refresh from server to ensure consistency
        this.loadHus();
      },
      error: () => this.toast.show('error', 'Error eliminando la HU del sprint')
    });
  }
}
