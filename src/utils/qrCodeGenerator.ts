
/**
 * Generator kodów QR dla akredytacji
 */
export const generateQRCode = async (data: string): Promise<string> => {
  // W rzeczywistej aplikacji można użyć bardziej zaawansowanego mechanizmu
  // generowania kodów QR, np. z wykorzystaniem biblioteki qrcode
  // Tutaj dla uproszczenia używamy prostego szyfrowania base64
  const hash = await generateHash(data);
  return `${hash.substring(0, 16)}-${Date.now().toString(36)}`;
};

// Pomocnicza funkcja do generowania hasza
const generateHash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};
