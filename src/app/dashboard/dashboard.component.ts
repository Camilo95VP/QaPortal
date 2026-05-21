import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { SprintService } from '../shared/services/sprint.service';
import { Sprint, DashboardMetrics } from '../shared/models/sprint.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sprints: Sprint[] = [];
  metrics: DashboardMetrics = {
    totalSprints: 0,
    totalHUs: 0,
    totalCPsAuto: 0,
    totalCPsManual: 0,
    coberturaPromedio: 0,
    ratioAutoManual: 0,
    husConGaps: []
  };
  loading = true;

  constructor(
    private http: HttpClient,
    private sprintService: SprintService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.http.get<any>('/api/metrics').subscribe({
      next: (data) => {
        this.metrics = {
          totalSprints: data.totalSprints || 0,
          totalHUs: data.totalHUs || 0,
          totalCPsAuto: data.totalCPsAuto || 0,
          totalCPsManual: data.totalCPsManual || 0,
          coberturaPromedio: data.coberturaPromedio || 0,
          ratioAutoManual: data.ratioAutoManual || 0,
          husConGaps: data.husConGaps || []
        };
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.sprintService.getSprints().subscribe({
      next: (sprints) => { this.sprints = sprints; }
    });
  }

  get totalCPs(): number {
    return this.metrics.totalCPsAuto + this.metrics.totalCPsManual;
  }

  get autoPercentage(): number {
    return this.metrics.ratioAutoManual;
  }

  get manualPercentage(): number {
    return 100 - this.metrics.ratioAutoManual;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getActiveSprints(): Sprint[] {
    return this.sprints.filter(s => s.estado === 'activo');
  }
}
