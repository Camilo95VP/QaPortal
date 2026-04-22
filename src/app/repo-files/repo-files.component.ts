import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { generarPlantillaWord } from './plantilla-word.service';

interface HuFolder {
  name: string;
  path: string;
  files: string[];
}

@Component({
  selector: 'app-repo-files',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
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
  openFolders: Set<string> = new Set();
  editing = false;
  editContent = '';
  // Unsaved changes modal state
  showUnsavedModal = false;

  // Plantilla modal state
  showPlantillaModal = false;
  plantillaEjecutadoPor = '';
  pendingOpenFolder: HuFolder | null = null;
  pendingOpenFile = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadIndex();
  }

  /** Genera la plantilla Word corporativa para casos manuales */
  generateTemplate(): void {
    const nombre = this.plantillaEjecutadoPor.trim();
    if (!nombre) { return; }
    this.showPlantillaModal = false;
    const folder = this.selectedFolder;
    if (!folder) return;
    const folderName = folder.name || folder.path;
    const md = this.selectedContent;
    this.statusMessage = 'Generando plantilla Word...';
    generarPlantillaWord(md, nombre, folderName)
      .then(() => {
        this.statusMessage = '\u2713 Plantilla descargada';
        setTimeout(() => { this.statusMessage = ''; }, 3000);
      })
      .catch(err => {
        console.error('template error', err);
        this.statusMessage = 'Error generando plantilla.';
      });
  }

  /** Entra en modo edición para el archivo activo */
  startEdit(): void {
    this.editContent = this.selectedContent;
    this.editing = true;
  }

  /** Cancela la edición sin guardar */
  cancelEdit(): void {
    this.editing = false;
    this.editContent = '';
  }

  /** Guarda el contenido editado sobreescribiendo el archivo en assets */
  saveFile(callback?: () => void): void {
    const folder = this.selectedFolder;
    const filename = this.selectedFile;
    if (!folder || !filename) return;
    this.statusMessage = 'Guardando...';
    const apiPath = `/api/repo-files/content?folder=${encodeURIComponent(folder.path)}&path=${encodeURIComponent(filename)}`;
    this.http.put(apiPath, this.editContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      responseType: 'json'
    }).subscribe({
      next: () => {
        this.selectedContent = this.editContent;
        this.editing = false;
        this.editContent = '';
        this.statusMessage = '\u2713 Guardado correctamente';
        setTimeout(() => { this.statusMessage = ''; }, 2500);
        if (callback) callback();
      },
      error: (err) => {
        console.error('save error', err);
        this.statusMessage = 'Error al guardar el archivo.';
      }
    });
  }

  // Proceed to open a file after confirming discard/save
  private doOpenFile(folder: HuFolder, filename: string): void {
    this.selectedFolder = folder;
    this.selectedFile = filename;
    this.loading = true;
    this.selectedContent = '';
    const assetPath = `/assets/repo-files/${encodeURIComponent(folder.path)}/${encodeURIComponent(filename)}`;
    this.http.get(assetPath, { responseType: 'text' }).subscribe({
      next: (txt) => {
        this.selectedContent = txt;
        this.loading = false;
      },
      error: () => {
        const apiPath = `/api/repo-files/content?folder=${encodeURIComponent(folder.path)}&path=${encodeURIComponent(filename)}`;
        this.http.get(apiPath, { responseType: 'text' }).subscribe({
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
    });
  }

  // Toggle visibility of a folder in the sidebar
  toggleFolder(folder: HuFolder): void {
    if (this.openFolders.has(folder.path)) {
      this.openFolders.delete(folder.path);
    } else {
      this.openFolders.add(folder.path);
    }
  }

  // Unsaved modal actions
  proceedDiscard(): void {
    if (!this.pendingOpenFolder || !this.pendingOpenFile) {
      this.showUnsavedModal = false;
      return;
    }
    // discard edits and proceed
    this.editing = false;
    this.editContent = '';
    this.showUnsavedModal = false;
    const f = this.pendingOpenFolder;
    const fn = this.pendingOpenFile;
    this.pendingOpenFolder = null;
    this.pendingOpenFile = '';
    this.doOpenFile(f, fn);
  }

  proceedSaveAndOpen(): void {
    if (!this.pendingOpenFolder || !this.pendingOpenFile) {
      this.showUnsavedModal = false;
      return;
    }
    const f = this.pendingOpenFolder;
    const fn = this.pendingOpenFile;
    this.showUnsavedModal = false;
    this.saveFile(() => {
      this.pendingOpenFolder = null;
      this.pendingOpenFile = '';
      this.doOpenFile(f, fn);
    });
  }

  cancelPendingNavigation(): void {
    this.showUnsavedModal = false;
    this.pendingOpenFolder = null;
    this.pendingOpenFile = '';
  }

  isOpen(folder: HuFolder): boolean {
    return this.openFolders.has(folder.path);
  }

  // Helper: obtiene una imagen como Data URL para embeber en el HTML (fallback vacio si falla)
  private fetchImageDataUrl(path: string): Promise<string> {
    return new Promise((resolve) => {
      this.http.get(path, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          try {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
          } catch (e) {
            resolve('');
          }
        },
        error: () => resolve('')
      });
    });
  }

  /** Carga inicial: intenta JSON estático, si viene vacío pide al API */
  loadIndex(): void {
    const url = `/assets/repo-files/repo-files.json?t=${Date.now()}`;
    this.http.get<HuFolder[]>(url).subscribe({
      next: (list) => {
        const parsed = Array.isArray(list) ? list : [];
        if (parsed.length > 0) {
          this.folders = parsed;
          this.statusMessage = `Índice cargado: ${this.folders.length} HU/EN`;
        } else {
          // JSON vacío → pedir al server que escanee assets/
          this.scanFromApi();
        }
      },
      error: () => {
        this.scanFromApi();
      }
    });
  }

  /** Pide al servidor Express que escanee src/assets/repo-files/ directamente */
  scanFromApi(): void {
    this.http.get<HuFolder[]>('/api/scan-assets').subscribe({
      next: (list) => {
        this.folders = Array.isArray(list) ? list : [];
        this.statusMessage = this.folders.length > 0
          ? `Índice desde servidor: ${this.folders.length} HU/EN`
          : 'No se encontraron HU/EN.';
      },
      error: () => {
        this.statusMessage = 'No se pudo conectar al servidor.';
      }
    });
  }

  /** Botón "Actualizar": escanea assets/ vía API (lee filesystem real, sin cache) */
  validateIndex(): void {
    this.statusMessage = 'Escaneando carpetas…';
    this.http.get<HuFolder[]>('/api/scan-assets').subscribe({
      next: (list) => {
        const parsed = Array.isArray(list) ? list : [];
        if (parsed.length > 0) {
          this.folders = parsed;
          this.statusMessage = `Actualizado: ${this.folders.length} HU/EN`;
        } else {
          this.statusMessage = `No se encontraron HU/EN. Se conservan ${this.folders.length} previas.`;
        }
      },
      error: () => {
        this.statusMessage = 'Error al conectar con el servidor. Lista sin cambios.';
      }
    });
  }

  openFile(folder: HuFolder, filename: string): void {
    // If user is editing and has unsaved changes, show modal to confirm action
    if (this.editing && this.editContent !== this.selectedContent) {
      this.pendingOpenFolder = folder;
      this.pendingOpenFile = filename;
      this.showUnsavedModal = true;
      return;
    }

    this.doOpenFile(folder, filename);
    // Intentar assets estáticos, fallback al API
    const assetPath = `/assets/repo-files/${encodeURIComponent(folder.path)}/${encodeURIComponent(filename)}`;
    this.http.get(assetPath, { responseType: 'text' }).subscribe({
      next: (txt) => {
        this.selectedContent = txt;
        this.loading = false;
      },
      error: () => {
        const apiPath = `/api/repo-files/content?folder=${encodeURIComponent(folder.path)}&path=${encodeURIComponent(filename)}`;
        this.http.get(apiPath, { responseType: 'text' }).subscribe({
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
    });
  }

  /** Genera PDF (usando diálogo de impresión) a partir del markdown del archivo indicado.
   *  Abre una nueva ventana con el HTML renderizado y lanza `print()` para guardar como PDF.
   */
  generatePdf(folder: HuFolder | null, filename: string): void {
    this.statusMessage = 'Generando vista de impresión (sin abrir ventana)...';
    const folderObj = folder || this.selectedFolder;
    if (!folderObj) {
      this.statusMessage = 'Selecciona primero una carpeta/archivo.';
      return;
    }
    const apiPath = `/api/repo-files/content?folder=${encodeURIComponent(folderObj.path)}&path=${encodeURIComponent(filename)}`;

    this.http.get(apiPath, { responseType: 'text' }).subscribe({
      next: (md) => {
        try {
          // obtener imagen de encabezado (data URL) si existe y luego construir HTML con la cabecera
          this.fetchImageDataUrl('/assets/encabezado.png').then(headerDataUrl => {
            const html = this.simpleMarkdownToHtml(md || '');
            const headerHtml = headerDataUrl ? `<div style="text-align:center;margin-bottom:12px"><img src="${headerDataUrl}" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;"/></div>` : '';
            const style = `body{ font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; } pre{ background:#f6f8fa; padding:10px; overflow:auto } code{ font-family: monospace } .steps{margin:0;padding:0} .steps .step{margin:0;padding:0;line-height:1.15} h2{margin:16px 0} h3{margin:10px 0 6px 0} .section-flag{color:#2e8b57;margin:16px 0;font-weight:700; -webkit-print-color-adjust: exact; print-color-adjust: exact;} .section-flag svg{display:inline-block;vertical-align:middle} /* CP title style */ .cp-title{ font-family: Arial, Helvetica, sans-serif; font-size:17pt; font-weight:700; font-style:normal; margin:0; } table{border-collapse:collapse;width:100%;margin:12px 0;page-break-inside:avoid} th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;vertical-align:top} th{background:#f0f0f0;font-weight:600} tr:nth-child(even) td{background:#fafafa} @media print{table{border-collapse:collapse !important} th,td{border:1px solid #999 !important} th{background:#e8e8e8 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact} .cp-title{ font-size:17pt !important; font-style:normal !important }}`;
            const full = `<!doctype html><html><head><meta charset="utf-8"><title>${filename}</title><style>${style}</style></head><body>${headerHtml}${html}</body></html>`;

            // Crear iframe oculto en la misma página para evitar popups
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);

            try {
              const doc = (iframe.contentDocument) ? iframe.contentDocument : (iframe.contentWindow && iframe.contentWindow.document);
              if (doc) {
                doc.open();
                doc.write(full);
                doc.close();
                // Esperar a que el iframe renderice
                setTimeout(() => {
                  try {
                    (iframe.contentWindow as Window).focus();
                    (iframe.contentWindow as Window).print();
                  } catch (e) {
                    console.error('print iframe failed', e);
                  }
                  setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) {} }, 500);
                }, 600);
                this.statusMessage = 'Impresión iniciada.';
                return;
              }
            } catch (e) {
              console.warn('iframe write failed', e);
            }

            // Fallback: abrir en nueva pestaña si iframe falla
            const blob = new Blob([full], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const win = window.open(url, '_blank', 'noopener');
            if (!win) {
              this.statusMessage = 'Popup bloqueado: permite ventanas emergentes para continuar.';
              return;
            }
            setTimeout(() => { try { win.print(); } catch (e) {} }, 700);
            this.statusMessage = 'Ventana de impresión abierta.';
          }).catch(() => {
            this.statusMessage = 'Error cargando imagen de encabezado.';
          });
        } catch (err) {
          console.error('print error', err);
          this.statusMessage = 'Error preparando impresión.';
        }
      },
      error: () => {
        this.statusMessage = 'No se pudo obtener el archivo para generar PDF.';
      }
    });
  }

  /** Exporta el contenido del archivo como documento Word (.doc) con el mismo formato que el PDF. */
  generateWord(folder: HuFolder | null, filename: string): void {
    this.statusMessage = 'Generando documento Word...';
    const folderObj = folder || this.selectedFolder;
    if (!folderObj) {
      this.statusMessage = 'Selecciona primero una carpeta/archivo.';
      return;
    }
    const apiPath = `/api/repo-files/content?folder=${encodeURIComponent(folderObj.path)}&path=${encodeURIComponent(filename)}`;

    this.http.get(apiPath, { responseType: 'text' }).subscribe({
      next: (md) => {
        try {
          const rawHtml = this.simpleMarkdownToHtml(md || '');
          // Solo en Word: quitar cursivas en todo el documento y ajustar etiquetas clave
          let html = rawHtml.replace(/<strong>Escenario:<\/strong>/g, '<strong>Escenario</strong>:');
          // Eliminar etiquetas de cursiva (<em>, <i>) conservando el texto
          html = html.replace(/<\/?(?:em|i)[^>]*>/gi, '');
          // Convertir h1 a párrafo con estilo inline (Word sobrescribiría h1 con cursiva de su tema)
          html = html.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (_m, inner) =>
            `<p style="font-family:Arial,Helvetica,sans-serif;font-size:22pt;font-weight:700;font-style:normal;margin:12pt 0 6pt 0;"><b>${inner}</b></p>`);
          // Convertir h2 regulares (no cp-title) a párrafo con estilo inline
          html = html.replace(/<h2\b(?![^>]*cp-title)[^>]*>([\s\S]*?)<\/h2>/gi, (_m, inner) =>
            `<p style="font-family:Arial,Helvetica,sans-serif;font-size:14pt;font-weight:700;font-style:normal;margin:10pt 0 5pt 0;"><b>${inner}</b></p>`);
          // Convertir h3 a párrafo con estilo inline
          html = html.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_m, inner) =>
            `<p style="font-family:Arial,Helvetica,sans-serif;font-size:12pt;font-weight:700;font-style:normal;margin:8pt 0 4pt 0;"><b>${inner}</b></p>`);
          // Convertir h4-h6 a párrafo con estilo inline
          html = html.replace(/<h[456]\b[^>]*>([\s\S]*?)<\/h[456]>/gi, (_m, inner) =>
            `<p style="font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;font-style:normal;margin:6pt 0 3pt 0;"><b>${inner}</b></p>`);
          // Asegurar que el título CP no contenga etiquetas de cursiva dentro del <h2 class="cp-title">...
          html = html.replace(/<h2 class="cp-title">([\s\S]*?)<\/h2>/g, (_m, inner) => {
            const clean = inner.replace(/<\/?(?:em|i)[^>]*>/gi, '');
            return `<h2 class="cp-title">${clean}</h2>`;
          });
          // Forzar título inicial: si ya existe <h1>, aplicar estilo; si no, insertar el nombre de archivo
          const docTitle = filename.replace(/\.[^.]+$/, '');
          if (/\<h1\b/i.test(html)) {
            html = html.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/i, (_m, attrs, inner) => {
              return `<h1${attrs} style="font-family: Arial, Helvetica, sans-serif; font-size:22pt; font-weight:700; margin:0 0 12px 0;">${inner}</h1>`;
            });
          } else {
            const titleHtml = `<h1 style="font-family: Arial, Helvetica, sans-serif; font-size:22pt; font-weight:700; margin:0 0 12px 0;">${docTitle}</h1>`;
            html = titleHtml + html;
          }

          // obtener imagen de encabezado y construir documento Word con la cabecera embebida
          this.fetchImageDataUrl('/assets/encabezado.png').then(headerDataUrl => {
              // Build a true Word header block (mso-element:header) plus a visible fallback header
              // so the image appears both in Word header area and as inline at document top.
              const msoHeader = headerDataUrl ?
                `<div style="mso-element:header;margin:0;padding:0">
                    <table style=\"width:100%;border-collapse:collapse;\"><tr>
                      <td style=\"width:33%;vertical-align:top;\"></td>
                      <td style=\"width:34%;text-align:center;vertical-align:top;\">` +
                        `<img src=\"${headerDataUrl}\" style=\"max-width:420px;width:100%;height:auto;display:block;margin:0 auto;\"/>` +
                      `</td>
                      <td style=\"width:33%;text-align:right;vertical-align:top;\">` +
                        `</td>
                    </tr></table>
                 </div>` : '';
              // Visible fallback header (same as PDF) to ensure image shows if Word ignores the mso header
              const visibleHeader = headerDataUrl ? `<div style="text-align:center;margin-bottom:12px"><img src="${headerDataUrl}" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;"/></div>` : '';
              const style = `*{font-style:normal !important} body{ font-family: Arial, Helvetica, sans-serif; font-size: 12pt; padding: 20px; color: #111; } p,li,td,th{ font-family: Arial, Helvetica, sans-serif; font-size: 12pt; } pre{ background:#f6f8fa; padding:10px; overflow:auto } code{ font-family: monospace } .steps{margin:0;padding:0} .steps .step{margin:0;padding:0;line-height:1.15} h2{margin:16px 0} h3{margin:10px 0 6px 0} .section-flag{color:#2e8b57;margin:16px 0;font-weight:700} /* CP title style for Word */ .cp-title{ font-family: Arial, Helvetica, sans-serif; font-size:17pt; font-weight:700; font-style:normal; margin:0; } table{border-collapse:collapse;width:100%;margin:12px 0} th,td{border:1px solid #999;padding:6px 10px;text-align:left;vertical-align:top} th{background:#e8e8e8;font-weight:600} tr:nth-child(even) td{background:#fafafa}`;
              // Forzar estilo inline en títulos CP para asegurar Arial 17pt en Word
              // Inject the mso header and visible header, and ensure Section1 page header is used by Word
              let htmlWithInlineCp = (visibleHeader + html).replace(/<h2 class="cp-title">([\s\S]*?)<\/h2>/g, (_m, inner) => {
                return `<p style="margin:12pt 0 6pt 0;"><b><span style="font-family:Arial,Helvetica,sans-serif;font-size:17pt;font-style:normal;">${inner}</span></b></p>`;
              });
              // Ensure no italic tags remain in the final HTML for Word export
              htmlWithInlineCp = htmlWithInlineCp.replace(/<\/?(?:em|i)[^>]*>/gi, '');
              const wordHtml = `<!doctype html>\n<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">\n<head><meta charset="utf-8"><title>${filename}</title>\n<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->\n<style>@page { size: A4; margin:1in } div.Section1{page:Section1} ${style}</style></head>\n<body><div class=\"Section1\">${msoHeader}${htmlWithInlineCp}</div></body>\n</html>`;
            // Prepend UTF-8 BOM to help Word correctly detect UTF-8 encoding (fixes tildes/acents)
            const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([BOM, wordHtml], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\.[^.]+$/, '') + '.doc';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (e) {} }, 500);
            this.statusMessage = 'Documento Word descargado.';
          }).catch(() => {
            this.statusMessage = 'Error cargando imagen de encabezado.';
          });
        } catch (err) {
          console.error('word export error', err);
          this.statusMessage = 'Error generando documento Word.';
        }
      },
      error: () => {
        this.statusMessage = 'No se pudo obtener el archivo para generar Word.';
      }
    });
  }

  // Conversor markdown muy simple a HTML (cubrir lo básico)
  private simpleMarkdownToHtml(md: string): string {
    if (!md) return '<p>(vacio)</p>';
    // escape HTML
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // code blocks ```
    md = md.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre><code>${esc(code)}</code></pre>`);
    // inline code `x`
    md = md.replace(/`([^`]+)`/g, (_m, c) => `<code>${esc(c)}</code>`);
    // headings
    md = md.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    md = md.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    md = md.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    md = md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // CP title: make lines like 'CP-01: Title' bold and larger, add class for styling
    md = md.replace(/^(CP-\d+\b[:\-]?\s*.*)$/gim, (_m, full) => {
      return `<div style="margin:18px 0"><h2 class="cp-title">${esc(full.trim())}</h2></div>`;
    });
    // Section flags: Happy Path, Full Error, Casos Borde — show as green labels with surrounding space
    md = md.replace(/^(?:\s*)(Happy Path|Full Error|Casos Borde|Casos borde)(?:\s*\(.*\))?\s*$/gim, (_m, label) => {
      // left border + inline SVG marker + force print color adjust
      return `\n<div style="margin:18px 0;padding-left:10px;border-left:6px solid #2e8b57; -webkit-print-color-adjust: exact; print-color-adjust: exact;">` +
             `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:8px"><rect width="10" height="10" fill="#2e8b57"/></svg>` +
             `<h3 class="section-flag" style="display:inline-block;color:#2e8b57 !important; margin:0; padding:0; font-weight:700 !important">${esc(label.trim())}</h3></div>\n`;
    });
    // Escenario: keep as heading with bold label
    md = md.replace(/^(?:\s*)Escenario:\s*(.*)$/gim, (_m, rest) => {
      return `\n\n<p style="margin:0;padding:0;line-height:1.15"><strong>Escenario:</strong> ${esc(rest.trim())}</p>\n\n`;
    });
    // Given/When/Then and connectors (Dado/Cuando/Entonces/Y): convert to markers for grouping
    md = md.replace(/^(?:\s*)(Dado|Cuando|Entonces|Y)[:\-]?\s*(.*)$/gim, (_m, label, rest) => {
      return `<<STEP|${label}|${rest.trim()}>>`;
    });
    // bold and italic
    md = md.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    md = md.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // links [text](url)
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
    // unordered lists
    md = md.replace(/^(?:\s*[-\*] .*(?:\n|$))+/gm, (m) => {
      const items = m.split(/\n/).filter(Boolean).map(l => l.replace(/^\s*[-\*]\s*/, ''));
      return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
    });
    // Group consecutive step markers into a single steps block with no spacing between lines
    md = md.replace(/(?:<<STEP\|[^|]+\|[^>]*>>\s*)+/g, (m) => {
      const stepRe = /<<STEP\|([^|]+)\|([^>]*)>>/g;
      let match: RegExpExecArray | null;
      let out = '<div class="steps" style="margin:0;padding:0">';
      while ((match = stepRe.exec(m)) !== null) {
        const label = match[1];
        const text = match[2];
        out += `<p class="step" style="margin:0;padding:0;line-height:1.15"><strong>${label}</strong> ${esc(text)}</p>`;
      }
      out += '</div>\n\n';
      return out;
    });

    // Tables: convert markdown tables to HTML before paragraph processing
    md = md.replace(/^((?:\|[^\n]+\n?)+)/gm, (tableBlock) => {
      const rows = tableBlock.trim().split('\n').map((r: string) => r.trim()).filter((r: string) => r.startsWith('|'));
      if (rows.length < 2) return tableBlock;
      const isSep = (r: string) => /^\|[\s\-:|]+\|$/.test(r);
      if (!isSep(rows[1])) return tableBlock;
      const parseRow = (r: string) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c: string) => c.trim());
      const headers = parseRow(rows[0]);
      const dataRows = rows.slice(2);
      let tbl = '<table><thead><tr>';
      tbl += headers.map((h: string) => `<th>${h}</th>`).join('');
      tbl += '</tr></thead><tbody>';
      for (const row of dataRows) {
        const cells = parseRow(row);
        tbl += '<tr>' + cells.map((c: string) => `<td>${c}</td>`).join('') + '</tr>';
      }
      tbl += '</tbody></table>';
      return tbl;
    });

    // paragraphs
    const lines = md.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const out = lines.map(l => {
      // allow headings like <h3 class="section-flag"> as well
      if (/^<h\d\b/.test(l) || /^<ul>/.test(l) || /^<pre>/.test(l) || /^<div class=\"steps\">/.test(l) || /^<table/.test(l)) return l;
      return '<p>' + l.replace(/\n/g, '<br/>') + '</p>';
    }).join('\n');
    return out;
  }
}
