import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { SprintService } from '../shared/services/sprint.service';
import { Sprint } from '../shared/models/sprint.model';

@Component({
  selector: 'app-sprints',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.scss']
})
export class SprintsComponent implements OnInit {
  sprints: Sprint[] = [];
  showCreateModal = false;
  newSprint = { nombre: '', fechaInicio: '', fechaFin: '' };
  loading = false;

  constructor(private sprintService: SprintService, private router: Router) {}

  ngOnInit(): void {
    this.loadSprints();
  }

  loadSprints(): void {
    this.loading = true;
    this.sprintService.getSprints().subscribe({
      next: (sprints) => { this.sprints = sprints; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateModal(): void {
    this.newSprint = {
      nombre: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: ''
    };
    this.showCreateModal = true;
  }

  createSprint(): void {
    if (!this.newSprint.nombre.trim()) return;
    this.sprintService.createSprint({
      nombre: this.newSprint.nombre.trim(),
      fechaInicio: this.newSprint.fechaInicio,
      fechaFin: this.newSprint.fechaFin,
      estado: 'activo',
      hus: []
    }).subscribe({
      next: () => { this.showCreateModal = false; this.loadSprints(); },
      error: (e) => console.error('Error creating sprint', e)
    });
  }

  closeSprint(sprint: Sprint): void {
    if (!confirm(`¿Cerrar "${sprint.nombre}"?`)) return;
    this.sprintService.closeSprint(sprint.id).subscribe(() => this.loadSprints());
  }

  reopenSprint(sprint: Sprint): void {
    this.sprintService.updateSprint(sprint.id, { estado: 'activo' }).subscribe(() => this.loadSprints());
  }

  viewSprint(sprint: Sprint): void {
    this.router.navigate(['/repo-files'], { queryParams: { sprint: sprint.id } });
  }

  getActiveCount(): number {
    return this.sprints.filter(s => s.estado === 'activo').length;
  }

  getClosedCount(): number {
    return this.sprints.filter(s => s.estado === 'cerrado').length;
  }

  getTotalHUs(): number {
    return this.sprints.reduce((sum, s) => sum + s.hus.length, 0);
  }
}
