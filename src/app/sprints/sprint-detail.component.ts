import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SprintService } from '../shared/services/sprint.service';
import { Sprint } from '../shared/models/sprint.model';

@Component({
  selector: 'app-sprint-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
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

  constructor(private route: ActivatedRoute, private router: Router, private sprintService: SprintService, private http: HttpClient) {}

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
      this.hus = list.map((h: any) => ({ name: h.name, files: h.files || [] }));
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
    // Los datos de habilitador/descripcion/criterios vienen directamente del GET /api/sprints/:id/hus
    // que los lee de husInfo en sprints.json — no necesita fetch a archivos
    this.selectedHu = {
      name:        h.name,
      files:       h.files       || [],
      habilitador: h.habilitador || '',
      descripcion: h.descripcion || '',
      criterios:   h.criterios   || ''
    };
  }

  goToNuevoDiseno(hu?: string): void {
    const params: any = { sprint: this.sprintId };
    if (hu) params.hu = hu;
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
}
