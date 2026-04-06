import jsPDF from 'jspdf';

interface PieSlice {
  label: string;
  value: number;
  color: [number, number, number];
}

interface BarGroup {
  label: string;
  values: { value: number; color: [number, number, number]; name: string }[];
}

interface AreaPoint {
  label: string;
  value: number;
}

/**
 * Draw a pie chart directly in the PDF.
 */
export function drawPieChart(
  doc: jsPDF,
  slices: PieSlice[],
  cx: number,
  cy: number,
  radius: number,
  title?: string
) {
  if (title) {
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(title, cx, cy - radius - 8, { align: 'center' });
  }

  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;

  slices.forEach(slice => {
    if (slice.value <= 0) return;
    const sweepAngle = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sweepAngle;

    // Draw filled arc using small line segments
    doc.setFillColor(slice.color[0], slice.color[1], slice.color[2]);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);

    const points: [number, number][] = [[cx, cy]];
    const steps = Math.max(20, Math.round(sweepAngle * 30));
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (sweepAngle * i) / steps;
      points.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
    }
    points.push([cx, cy]);

    // Draw as filled polygon
    const first = points[0];
    let pathStr = '';
    // Use triangle fan approach
    doc.setFillColor(slice.color[0], slice.color[1], slice.color[2]);
    
    // jsPDF triangle approach for filled wedge
    for (let i = 1; i < points.length - 1; i++) {
      doc.triangle(
        first[0], first[1],
        points[i][0], points[i][1],
        points[i + 1][0], points[i + 1][1],
        'F'
      );
    }

    startAngle = endAngle;
  });

  // Draw legend below
  let legendY = cy + radius + 10;
  const legendX = cx - radius;
  doc.setFontSize(8);

  slices.forEach((slice, i) => {
    if (slice.value <= 0) return;
    const pct = ((slice.value / total) * 100).toFixed(1);
    doc.setFillColor(slice.color[0], slice.color[1], slice.color[2]);
    doc.rect(legendX, legendY - 3, 6, 6, 'F');
    doc.setTextColor(60, 60, 60);
    doc.text(`${slice.label}: ${slice.value} (${pct}%)`, legendX + 9, legendY + 1);
    legendY += 9;
  });
}

/**
 * Draw a bar chart directly in the PDF.
 */
export function drawBarChart(
  doc: jsPDF,
  groups: BarGroup[],
  x: number,
  y: number,
  width: number,
  height: number,
  title?: string
) {
  if (title) {
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(title, x + width / 2, y - 5, { align: 'center' });
  }

  if (groups.length === 0) return;

  const maxVal = Math.max(...groups.flatMap(g => g.values.map(v => v.value)), 1);
  const barCount = groups[0].values.length;
  const groupWidth = width / groups.length;
  const barWidth = (groupWidth * 0.7) / barCount;
  const gap = groupWidth * 0.15;

  // Axes
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(x, y, x, y + height);
  doc.line(x, y + height, x + width, y + height);

  // Y-axis labels
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal * (4 - i)) / 4);
    const ly = y + (height * i) / 4;
    doc.text(String(val), x - 3, ly + 2, { align: 'right' });
    doc.setDrawColor(230, 230, 230);
    doc.line(x, ly, x + width, ly);
  }

  // Bars
  groups.forEach((group, gi) => {
    const gx = x + gi * groupWidth + gap;

    group.values.forEach((v, vi) => {
      const barH = (v.value / maxVal) * height;
      const bx = gx + vi * barWidth;
      const by = y + height - barH;

      doc.setFillColor(v.color[0], v.color[1], v.color[2]);
      doc.roundedRect(bx, by, barWidth - 1, barH, 1, 1, 'F');
    });

    // X label
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(group.label, gx + (barCount * barWidth) / 2, y + height + 7, { align: 'center' });
  });

  // Legend
  const legendY = y + height + 14;
  let lx = x;
  doc.setFontSize(7);
  const names = groups[0].values.map(v => v.name);
  const colors = groups[0].values.map(v => v.color);
  names.forEach((name, i) => {
    doc.setFillColor(colors[i][0], colors[i][1], colors[i][2]);
    doc.rect(lx, legendY - 3, 5, 5, 'F');
    doc.setTextColor(80, 80, 80);
    doc.text(name, lx + 7, legendY + 1);
    lx += doc.getTextWidth(name) + 14;
  });
}

/**
 * Draw an area/line chart directly in the PDF.
 */
export function drawAreaChart(
  doc: jsPDF,
  points: AreaPoint[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number],
  title?: string
) {
  if (title) {
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(title, x + width / 2, y - 5, { align: 'center' });
  }

  if (points.length === 0) return;

  const maxVal = Math.max(...points.map(p => p.value), 1);

  // Axes
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(x, y, x, y + height);
  doc.line(x, y + height, x + width, y + height);

  // Y-axis labels
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal * (4 - i)) / 4);
    const ly = y + (height * i) / 4;
    doc.text(String(val), x - 3, ly + 2, { align: 'right' });
    doc.setDrawColor(230, 230, 230);
    doc.line(x, ly, x + width, ly);
  }

  const stepX = width / Math.max(points.length - 1, 1);

  // Fill area with lighter color (simulate opacity)
  const lightColor: [number, number, number] = [
    Math.min(255, color[0] + Math.round((255 - color[0]) * 0.82)),
    Math.min(255, color[1] + Math.round((255 - color[1]) * 0.82)),
    Math.min(255, color[2] + Math.round((255 - color[2]) * 0.82)),
  ];
  doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);

  // Build area polygon as triangles from baseline
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = x + i * stepX;
    const y1 = y + height - (points[i].value / maxVal) * height;
    const x2 = x + (i + 1) * stepX;
    const y2 = y + height - (points[i + 1].value / maxVal) * height;
    const baseY = y + height;

    doc.triangle(x1, y1, x2, y2, x1, baseY, 'F');
    doc.triangle(x2, y2, x2, baseY, x1, baseY, 'F');
  }

  // Draw line
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.8);
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = x + i * stepX;
    const y1 = y + height - (points[i].value / maxVal) * height;
    const x2 = x + (i + 1) * stepX;
    const y2 = y + height - (points[i + 1].value / maxVal) * height;
    doc.line(x1, y1, x2, y2);
  }

  // Data points
  doc.setFillColor(color[0], color[1], color[2]);
  points.forEach((p, i) => {
    const px = x + i * stepX;
    const py = y + height - (p.value / maxVal) * height;
    doc.circle(px, py, 1.2, 'F');
  });

  // X labels
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  points.forEach((p, i) => {
    const px = x + i * stepX;
    doc.text(p.label, px, y + height + 7, { align: 'center' });
  });
}
