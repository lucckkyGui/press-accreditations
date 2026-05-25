import qrcode from 'qrcode-generator';

/**
 * Generate a QR code as a data URL (base64 PNG).
 * Uses qrcode-generator (~13KB) instead of qrcode (~359KB).
 */
export function qrToDataURL(data: string, size: number = 200): string {
  const qr = qrcode(0, 'M');
  qr.addData(data);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = Math.max(Math.floor(size / moduleCount), 1);
  const margin = Math.floor(cellSize * 2);
  const totalSize = moduleCount * cellSize + margin * 2;

  const canvas = document.createElement('canvas');
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, totalSize, totalSize);

  // Draw modules
  ctx.fillStyle = '#000000';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          margin + col * cellSize,
          margin + row * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  return canvas.toDataURL('image/png');
}
