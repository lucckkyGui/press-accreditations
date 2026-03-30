import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

export const relativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: pl });
};
