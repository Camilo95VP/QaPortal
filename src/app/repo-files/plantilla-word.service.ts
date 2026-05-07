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

function extractHuIdentifier(value: string): string {
  const normalized = (value || '').trim();
  if (!normalized) return '';
  const explicitMatch = normalized.match(/\b(HU|EN)\s*[-_]?\s*(\d+)\b/i);
  if (explicitMatch) return `${explicitMatch[1].toUpperCase()}${explicitMatch[2]}`;
  const numericPrefixMatch = normalized.match(/^\s*(\d{3,})\b/);
  if (numericPrefixMatch) return `HU${numericPrefixMatch[1]}`;
  return '';
}

/* ───── Parser ───── */
export function parseCasosManuales(md: string, folderName = ''): { hu: string; casos: CasoManual[] } {
  // Extract HU/EN from markdown content and fall back to selected folder name.
  const hu =
    extractHuIdentifier(md.match(/^#\s+(.+)$/m)?.[1] || '') ||
    extractHuIdentifier(md) ||
    extractHuIdentifier(folderName);

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

/* ───── Gherkin cell ───── */
function gherkinCell(keyword: 'Dado' | 'Cuando' | 'Entonces', text: string): TableCell {
  const lines = (text || '').split('\n').map(line => line.trim()).filter(Boolean);
  const [firstLine = '', ...otherLines] = lines;
  const paragraphs: Paragraph[] = [];
  if (firstLine) {
    paragraphs.push(new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: `${keyword}`, bold: true, font: 'Calibri', size: 20 }),
        new TextRun({ text: ` ${firstLine}`, font: 'Calibri', size: 20 }),
      ],
    }));
  } else {
    paragraphs.push(new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [new TextRun({ text: `${keyword}`, bold: true, font: 'Calibri', size: 20 })],
    }));
  }
  for (const line of otherLines) {
    if (/^Y\b/i.test(line)) {
      const rest = line.replace(/^Y\s*/i, '');
      paragraphs.push(new Paragraph({
        spacing: { before: 10, after: 10 },
        children: [
          new TextRun({ text: 'Y', bold: true, font: 'Calibri', size: 20 }),
          new TextRun({ text: ` ${rest}`, font: 'Calibri', size: 20 }),
        ],
      }));
    } else {
      paragraphs.push(new Paragraph({
        spacing: { before: 10, after: 10 },
        children: [new TextRun({ text: line, font: 'Calibri', size: 20 })],
      }));
    }
  }
  return new TableCell({
    columnSpan: 6,
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
      new TableRow({ children: [gherkinCell('Dado', caso.dado)] }),
      // FILA 6: Cuando
      new TableRow({ children: [gherkinCell('Cuando', caso.cuando)] }),
      // FILA 7: Entonces
      new TableRow({ children: [gherkinCell('Entonces', caso.entonces)] }),
      // FILA 8: Ejecución — celda única fusionada
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            verticalAlign: VerticalAlign.CENTER,
            borders: BORDER,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: 'Ejecución:', bold: true, font: 'Calibri', size: 20 })],
              }),
            ],
          }),
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
  const { hu, casos } = parseCasosManuales(md, folderName);
  if (casos.length === 0) {
    alert('No se encontraron casos manuales con formato CP-MXX en el archivo.');
    return;
  }

  const hoy = new Date();
  const fecha = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

  const children: (Table | Paragraph)[] = [];

  // --- Portada (primera hoja) ---
  function formatHuForCover(rawHu: string): string {
    if (!rawHu) return '';
    const m = rawHu.match(/(HU|EN)\s*[-_]?\s*(\d+)/i);
    if (m) return `${m[1].toUpperCase()} ${m[2]}`;
    const n = rawHu.match(/(\d{3,})/);
    if (n) return `HU ${n[1]}`;
    return rawHu;
  }

  const coverHu = formatHuForCover(hu || folderName);

  // Split cover HU into prefix (HU/EN) and numeric part so number can be on its own line
  const _huMatch = (coverHu || '').match(/(HU|EN)?\s*(\d+)/i) || [];
  const coverHuPrefix = _huMatch[1] ? _huMatch[1].toUpperCase() : '';
  const coverHuNumber = _huMatch[2] || '';

  // Build the cover as plain paragraphs (no table) keeping styles and left indent
  const coverSpacers = Array.from({ length: 8 }, () =>
    new Paragraph({ spacing: { before: 0, after: 280 }, children: [new TextRun({ text: '' })] })
  );

  const coverParagraphs = [
    // Línea 1: CERTIFICACIÓN + prefix HU/EN (e.g. "CERTIFICACIÓN HU")
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({ text: 'C', bold: true, font: 'Calibri', size: 55, color: 'FF8000' }),
        new TextRun({ text: 'ERTIFICACIÓN', bold: true, font: 'Calibri', size: 53, color: 'FF8000' }),
        new TextRun({ text: coverHuPrefix ? ` ${coverHuPrefix}` : '', bold: true, font: 'Calibri', size: 53, color: 'FF8000' }),
      ],
    }),
    // Línea 2: solo el número (e.g. 30642)
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 360 },
      children: [
        new TextRun({ text: coverHuNumber || coverHu, bold: true, font: 'Calibri', size: 53, color: 'FF8000' }),
      ],
    }),
    // Línea 3: Portal Kuara — negrita, alineado a la derecha
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: 'Portal Kuara', bold: true, font: 'Calibri', size: 23, color: '000000' })],
    }),
    // Línea 4: Nombre de la HU/EN — alineado a la derecha
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      indent: { left: 400 },
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: hu || folderName, font: 'Calibri', size: 23, color: '000000' })],
    }),
    // Línea 5: V1.0 — negrita, alineado a la derecha
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      indent: { left: 400 },
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'V1.0', bold: true, font: 'Calibri', size: 20, color: '000000' })],
    }),
    // Línea 6: Fecha — pequeño, gris, alineado a la derecha
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      indent: { left: 400 },
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: fecha, font: 'Calibri', size: 16, color: '777777' })],
    }),
  ];

  // Push the cover paragraphs roughly to the vertical center of the page
  children.push(...coverSpacers);
  children.push(...coverParagraphs);
  // Add a page break after the cover
  children.push(new Paragraph({ children: [new PageBreak()] }));

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
