import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const HEADERS = ["Region", "Country", "Company", "Activity", "Email", "Fatturato 2026", "Status"];

const formatEurForExport = (v) => {
  if (v === null || v === undefined || v === "" || Number.isNaN(Number(v))) return "N/A";
  const n = Number(v);
  if (n === 0) return "N/A";
  return n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" });
};

const toRow = (p) => [
  p.region,
  p.country,
  p.name,
  p.activity,
  p.email,
  formatEurForExport(p.revenue_2026),
  p.status,
];

// Fills matching original Excel color semantics
const STATUS_FILL_HEX = {
  Current: "FFE8F5E9", // light green
  Standby: "FFFFF8E1", // light amber/yellow
  Old: "FFFFEBEE",     // light red/rose
};
const STATUS_FONT_HEX = {
  Current: "FF2E7D32",
  Standby: "FF8B6508",
  Old: "FFB71C1C",
};

const setCellStyle = (worksheet, cellRef, fillHex, fontHex, bold = false) => {
  const cell = worksheet[cellRef];
  if (!cell) return;
  cell.s = {
    fill: { patternType: "solid", fgColor: { rgb: fillHex.replace(/^FF/, "") } },
    font: { color: { rgb: fontHex.replace(/^FF/, "") }, bold },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
      left: { style: "thin", color: { rgb: "E5E7EB" } },
      right: { style: "thin", color: { rgb: "E5E7EB" } },
    },
  };
};

export function exportToExcel(partners, filename = "qmd-global-partners") {
  // Build data with a legend at the top so meanings travel with the file
  const legendRows = [
    ["qmd® Global Partner Dashboard — Hakomed Italia"],
    [`Exported: ${new Date().toLocaleString("en-GB")}   ·   ${partners.length} partners`],
    [],
    ["Color Legend:"],
    ["Current", "Active partner"],
    ["Standby", "On hold / warning"],
    ["Old", "Inactive / terminated"],
    [],
    HEADERS,
    ...partners.map(toRow),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(legendRows);

  // Column widths
  worksheet["!cols"] = [
    { wch: 16 },
    { wch: 22 },
    { wch: 30 },
    { wch: 12 },
    { wch: 32 },
    { wch: 18 },
    { wch: 12 },
  ];

  // Merges for title row
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];

  // Style the title
  if (worksheet["A1"]) {
    worksheet["A1"].s = {
      font: { bold: true, sz: 14, color: { rgb: "0D1B2A" } },
      alignment: { horizontal: "left" },
    };
  }
  if (worksheet["A2"]) {
    worksheet["A2"].s = {
      font: { italic: true, color: { rgb: "6B7280" }, sz: 10 },
    };
  }
  if (worksheet["A4"]) {
    worksheet["A4"].s = {
      font: { bold: true, color: { rgb: "0D1B2A" } },
    };
  }
  // Style legend rows (5,6,7 = A5,B5 / A6,B6 / A7,B7)
  ["Current", "Standby", "Old"].forEach((status, i) => {
    const rowIdx = 5 + i; // 1-based excel row number
    setCellStyle(worksheet, `A${rowIdx}`, STATUS_FILL_HEX[status], STATUS_FONT_HEX[status], true);
    setCellStyle(worksheet, `B${rowIdx}`, STATUS_FILL_HEX[status], STATUS_FONT_HEX[status], false);
  });

  // Style header row (row 9 in excel = index 8)
  const headerRowIdx = 9;
  HEADERS.forEach((_h, colIdx) => {
    const col = String.fromCharCode(65 + colIdx);
    const ref = `${col}${headerRowIdx}`;
    if (worksheet[ref]) {
      worksheet[ref].s = {
        fill: { patternType: "solid", fgColor: { rgb: "0D1B2A" } },
        font: { color: { rgb: "C9A84C" }, bold: true },
        alignment: { horizontal: "left", vertical: "center" },
      };
    }
  });

  // Color each data row based on status column (index 5 -> column F)
  partners.forEach((p, i) => {
    const excelRow = headerRowIdx + 1 + i;
    const fill = STATUS_FILL_HEX[p.status];
    const font = STATUS_FONT_HEX[p.status];
    if (!fill) return;
    for (let c = 0; c < HEADERS.length; c++) {
      const col = String.fromCharCode(65 + c);
      const ref = `${col}${excelRow}`;
      setCellStyle(worksheet, ref, fill, "FF0D1B2A", false);
    }
    // Emphasize the Status column (now column G, index 6)
    setCellStyle(worksheet, `G${excelRow}`, fill, font, true);
  });

  worksheet["!rows"] = worksheet["!rows"] || [];
  worksheet["!rows"][0] = { hpt: 22 };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Partners");
  const ts = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${ts}.xlsx`, { cellStyles: true });
}

export function exportToPDF(partners, filename = "qmd-global-partners") {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header: navy band
  doc.setFillColor(13, 27, 42);
  doc.rect(0, 0, pageWidth, 70, "F");

  // Gold accent line
  doc.setFillColor(201, 168, 76);
  doc.rect(0, 70, pageWidth, 3, "F");

  // Title
  doc.setTextColor(201, 168, 76);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("qmd", 40, 40);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Global Partner Dashboard", 90, 40);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(
    `Hakomed Italia — Exported ${dateStr} — ${partners.length} partners`,
    40,
    58
  );

  // Color Legend below header
  const legendY = 92;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 27, 42);
  doc.text("Color Legend:", 40, legendY);

  const legendItems = [
    { label: "Current — Active", fill: [232, 245, 233], font: [46, 125, 50] },
    { label: "Standby — On hold", fill: [255, 248, 225], font: [180, 130, 12] },
    { label: "Old — Inactive", fill: [255, 235, 238], font: [183, 28, 28] },
  ];
  let cursorX = 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  legendItems.forEach((item) => {
    // swatch
    doc.setFillColor(item.fill[0], item.fill[1], item.fill[2]);
    doc.roundedRect(cursorX, legendY - 10, 14, 12, 2, 2, "F");
    // text
    doc.setTextColor(item.font[0], item.font[1], item.font[2]);
    doc.text(item.label, cursorX + 20, legendY);
    cursorX += doc.getTextWidth(item.label) + 50;
  });

  // Table
  autoTable(doc, {
    head: [HEADERS],
    body: partners.map(toRow),
    startY: 110,
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 8,
      textColor: [13, 27, 42],
      lineColor: [230, 230, 230],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [13, 27, 42],
      textColor: [201, 168, 76],
      fontStyle: "bold",
      fontSize: 10,
    },
    alternateRowStyles: { fillColor: [252, 252, 253] },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { cellWidth: 85 },
      2: { cellWidth: 135 },
      3: { cellWidth: 55 },
      4: { cellWidth: 175 },
      5: { cellWidth: 85, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 60, fontStyle: "bold", halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        const rowStatus = data.row.raw?.[6];
        // Revenue column gold accent
        if (data.column.index === 5) {
          data.cell.styles.textColor = [139, 101, 8];
        }
        if (data.column.index === 6) {
          if (rowStatus === "Current") {
            data.cell.styles.fillColor = [232, 245, 233];
            data.cell.styles.textColor = [46, 125, 50];
          } else if (rowStatus === "Standby") {
            data.cell.styles.fillColor = [255, 248, 225];
            data.cell.styles.textColor = [180, 130, 12];
          } else if (rowStatus === "Old") {
            data.cell.styles.fillColor = [255, 235, 238];
            data.cell.styles.textColor = [183, 28, 28];
          }
        } else if (data.column.index !== 5) {
          // subtle row tint by status
          if (rowStatus === "Old") {
            data.cell.styles.fillColor = [255, 245, 246];
          } else if (rowStatus === "Standby") {
            data.cell.styles.fillColor = [255, 253, 240];
          }
        }
      }
    },
    margin: { left: 40, right: 40 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `© 2026 Hakomed Italia — qmd® Global Partner Network — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );
  }

  const ts = new Date().toISOString().slice(0, 10);
  doc.save(`${filename}-${ts}.pdf`);
}
