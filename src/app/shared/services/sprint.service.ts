import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Sprint, HuFolder } from '../models/sprint.model';

@Injectable({ providedIn: 'root' })
export class SprintService {
  private sprintsSubject = new BehaviorSubject<Sprint[]>([]);
  sprints$ = this.sprintsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSprints(): Observable<Sprint[]> {
    return this.http.get<Sprint[]>('/api/sprints').pipe(
      tap(sprints => this.sprintsSubject.next(sprints))
    );
  }

  createSprint(sprint: Partial<Sprint>): Observable<Sprint> {
    return this.http.post<Sprint>('/api/sprints', sprint).pipe(
      tap(() => this.getSprints().subscribe())
    );
  }

  updateSprint(id: string, data: Partial<Sprint>): Observable<Sprint> {
    return this.http.put<Sprint>(`/api/sprints/${id}`, data).pipe(
      tap(() => this.getSprints().subscribe())
    );
  }

  closeSprint(id: string): Observable<Sprint> {
    return this.updateSprint(id, { estado: 'cerrado' });
  }

  addHuToSprint(sprintId: string, huName: string, metadata?: { descripcion?: string; criterios?: string }): Observable<any> {
    return this.http.post(`/api/sprints/${sprintId}/hus`, { huName, ...metadata }).pipe(
      tap(() => this.getSprints().subscribe())
    );
  }

  removeHuFromSprint(sprintId: string, huName: string): Observable<any> {
    return this.http.delete(`/api/sprints/${sprintId}/hus/${huName}`).pipe(
      tap(() => this.getSprints().subscribe())
    );
  }

  getSprintHus(sprintId: string): Observable<HuFolder[]> {
    return this.http.get<HuFolder[]>(`/api/sprints/${sprintId}/hus`);
  }

  getActiveSprint(): Sprint | null {
    const sprints = this.sprintsSubject.value;
    return sprints.find(s => s.estado === 'activo') || null;
  }
}
