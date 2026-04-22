import {
  Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun,
  WidthType, AlignmentType, VerticalAlign, BorderStyle,
  HeadingLevel, PageBreak
} from 'docx';
import { saveAs } from 'file-saver';

/* ───── Interfaces ───── */
export interface CasoManual {
  id: string;       // e.g. CP-M01
  titulo: string;   // e.g. "Verificar diseño responsive..."
  escenario: string; // texto después de **Escenario:**
  dado: string;
  cuando: string;
  entonces: string;
}

/* ───── Parser ───── */
export function parseCasosManuales(md: string): { hu: string; casos: CasoManual[] } {
  // Extract HU/EN from the first heading
  const huMatch = md.match(/^#\s+(HU\d+|EN\d+)/m);
  const hu = huMatch ? huMatch[1] : '';

  const casos: CasoManual[] = [];
  // Split by CP sections (accept both '### CP-MXX:' and 'CP-MXX:' at line start)
  const cpBlocks = md.split(/(?=^(?:\s*###\s*)?CP-M\d+)/m).filter(b => /^(?:\s*###\s*)?CP-M\d+/.test(b));

  for (const block of cpBlocks) {
    const headerMatch = block.match(/^(?:\s*###\s*)?(CP-M\d+)[:\-]?\s*(.*)/m);
    if (!headerMatch) continue;
    const id = headerMatch[1];
    const titulo = headerMatch[2].trim();

    // Escenario
    // Accept either bold '**Escenario:**' or plain 'Escenario:' at line start
    const escMatch = block.match(/(?:\*\*Escenario:\*\*|^Escenario:)\s*(.*)/im);
    const escenario = escMatch ? escMatch[1].trim() : '';

    // Collect Dado/Cuando/Entonces/Y lines
    const lines = block.split('\n');
    let dado = '';
    let cuando = '';
    let entonces = '';
    let currentBlock: 'dado' | 'cuando' | 'entonces' | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (/^Dado\b/i.test(line)) {
        currentBlock = 'dado';
        dado += line.replace(/^Dado\s*/i, '').trim() + '\n';
      } else if (/^Cuando\b/i.test(line)) {
        currentBlock = 'cuando';
        cuando += line.replace(/^Cuando\s*/i, '').trim() + '\n';
      } else if (/^Entonces\b/i.test(line) || /^Then\b/i.test(line)) {
        currentBlock = 'entonces';
        const cleaned = line.replace(/^(Entonces|Then)\s*/i, '').trim();
        entonces += cleaned + '\n';
      } else if (/^Y\b/i.test(line)) {
        const text = line.replace(/^Y\s*/i, '').trim();
        if (currentBlock === 'dado') dado += 'Y ' + text + '\n';
        else if (currentBlock === 'cuando') cuando += 'Y ' + text + '\n';
        else if (currentBlock === 'entonces') entonces += 'Y ' + text + '\n';
      }
    }

    casos.push({
      id, titulo, escenario,
      dado: dado.trim(),
      cuando: cuando.trim(),
      entonces: entonces.trim()
    });
  }
  return { hu, casos };
}

/* ───── Helpers para celdas ───── */
const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

function labelCell(text: string, colSpan = 1, widthPct?: number): TableCell {
  return new TableCell({
    columnSpan: colSpan,
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    // removed shading to avoid gray background in table fields
    verticalAlign: VerticalAlign.CENTER,
    borders: BORDER,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, bold: true, font: 'Calibri', size: 20 })],
      }),
    ],
  });
}

function valueCell(text: string, colSpan = 1, widthPct?: number): TableCell {
  // Split text by newlines and create separate paragraphs
  const paragraphs = (text || '').split('\n').filter(Boolean).map(
    line => new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [new TextRun({ text: line, font: 'Calibri', size: 20 })],
    })
  );
  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: '', font: 'Calibri', size: 20 })] }));
  }
  return new TableCell({
    columnSpan: colSpan,
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    borders: BORDER,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: paragraphs,
  });
}

/* ───── Generador de tabla por CP ───── */
function buildCasoTable(caso: CasoManual, hu: string, ejecutadoPor: string, fecha: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // FILA 1: Fecha de ejecución | valor | Ejecutado por | valor
      new TableRow({
        children: [
          labelCell('Fecha de ejecución:', 1, 18),
          valueCell(fecha, 1, 32),
          labelCell('Ejecutado por:', 1, 16),
          valueCell(ejecutadoPor, 3, 34),
        ],
      }),
      // FILA 2: Tipo de prueba | Funcional | ID caso de prueba | CP-MXX | ID incidente asociado | vacío
      new TableRow({
        children: [
          labelCell('Tipo de prueba:', 1),
          valueCell('Funcional', 1),
          labelCell('ID caso de prueba:', 1),
          valueCell(caso.id, 1),
          labelCell('ID incidente asociado:', 1),
          valueCell('', 1),
        ],
      }),
      // FILA 3: Estado | Desplegado | PBI Asociado | HU
      new TableRow({
        children: [
          labelCell('Estado:', 1),
          valueCell('Desplegado', 1),
          labelCell('PBI Asociado:', 1),
          valueCell(hu, 3),
        ],
      }),
      // FILA 4: Descripción | Escenario (ocupa columnas restantes)
      new TableRow({
        children: [
          labelCell('Descripción:', 1),
          valueCell(caso.escenario || caso.titulo, 5),
        ],
      }),
      // FILA 5: Dado
      new TableRow({
        children: [
          labelCell('Dado:', 1),
          valueCell(caso.dado, 5),
        ],
      }),
      // FILA 6: Cuando
      new TableRow({
        children: [
          labelCell('Cuando:', 1),
          valueCell(caso.cuando, 5),
        ],
      }),
      // FILA 7: Entonces
      new TableRow({
        children: [
          labelCell('Entonces:', 1),
          valueCell(caso.entonces, 5),
        ],
      }),
      // FILA 8: Ejecución | vacío
      new TableRow({
        children: [
          labelCell('Ejecución:', 1),
          valueCell('', 5),
        ],
      }),
    ],
  });
}

/* ───── Generador de documento completo ───── */
export async function generarPlantillaWord(
  md: string,
  ejecutadoPor: string,
  folderName: string
): Promise<void> {
  const { hu, casos } = parseCasosManuales(md);
  if (casos.length === 0) {
    alert('No se encontraron casos manuales con formato CP-MXX en el archivo.');
    return;
  }

  const hoy = new Date();
  const fecha = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

  const children: (Table | Paragraph)[] = [];

  // Título del documento
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `${hu || folderName} — Plantilla de Ejecución`,
          bold: true,
          font: 'Calibri',
          size: 32,
        }),
      ],
    })
  );

  for (let i = 0; i < casos.length; i++) {
    if (i > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    // Subtítulo del caso
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: `${casos[i].id}: ${casos[i].titulo}`,
            bold: true,
            font: 'Calibri',
            size: 24,
          }),
        ],
      })
    );
    children.push(buildCasoTable(casos[i], hu, ejecutadoPor, fecha));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${folderName}_plantilla_ejecucion.docx`;
  saveAs(blob, filename);
}
