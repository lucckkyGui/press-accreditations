import { toast } from 'sonner';

export const copyToClipboard = async (text: string, label?: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label || 'Tekst'} skopiowany do schowka`);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success(`${label || 'Tekst'} skopiowany do schowka`);
      return true;
    } catch {
      toast.error('Nie udało się skopiować do schowka');
      return false;
    }
  }
};
