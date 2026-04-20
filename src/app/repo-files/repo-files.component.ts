import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface HuFolder {
  name: string;
  path: string;
  files: string[];
}

@Component({
  selector: 'app-repo-files',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './repo-files.component.html',
  styleUrls: ['./repo-files.component.scss']
})
export class RepoFilesComponent implements OnInit {
  folders: HuFolder[] = [];
  selectedFolder: HuFolder | null = null;
  selectedFile: string = '';
  selectedContent = '';
  loading = false;
  statusMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadIndex();
  }

  loadIndex(): void {
    this.http.get<HuFolder[]>('/assets/repo-files/repo-files.json').subscribe({
      next: (list) => { this.folders = list; },
      error: () => { this.folders = []; }
    });
  }

  // Valida que el index coincida con las carpetas físicas en /assets
  validateIndex(): void {
    this.statusMessage = 'Sincronizando índice (pedir al server)...';
    // Intentar pedir al servidor que sincronice (server.js /api/sync)
    this.http.get<any>('/api/sync').subscribe({
      next: (resp) => {
        if (resp && resp.ok) {
          this.statusMessage = `Índice sincronizado: ${resp.count} HU/EN`; 
          // recargar el archivo JSON desde assets
          this.loadIndex();
        } else {
          this.statusMessage = 'La sincronización no devolvió resultado esperado';
        }
      },
      error: () => {
        // si el servidor no está disponible, solo recargar repo-files.json y avisar
        this.statusMessage = 'Servidor de sincronización no disponible. Recargando índice local...';
        this.loadIndex();
      }
    });
  }

  openFile(folder: HuFolder, filename: string): void {
    this.selectedFolder = folder;
    this.selectedFile = filename;
    this.loading = true;
    this.selectedContent = '';
    this.http.get(`/assets/${encodeURIComponent(folder.path)}/${encodeURIComponent(filename)}`, { responseType: 'text' }).subscribe({
      next: (txt) => {
        this.selectedContent = txt;
        this.loading = false;
      },
      error: () => {
        this.selectedContent = 'Error al cargar el archivo.';
        this.loading = false;
      }
    });
  }
}
