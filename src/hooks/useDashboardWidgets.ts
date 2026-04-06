import { useState, useCallback } from 'react';

export type DashboardWidget = 
  | 'stats'
  | 'guestStatus'
  | 'checkInActivity'
  | 'recentActivity'
  | 'recentScans'
  | 'usageTracker'
  | 'resourceMonitor';

const ALL_WIDGETS: { id: DashboardWidget; label: string }[] = [
  { id: 'stats', label: 'Statystyki' },
  { id: 'guestStatus', label: 'Status gości' },
  { id: 'checkInActivity', label: 'Aktywność check-in' },
  { id: 'recentActivity', label: 'Ostatnia aktywność' },
  { id: 'recentScans', label: 'Ostatnie skany' },
  { id: 'usageTracker', label: 'Użycie systemu' },
  { id: 'resourceMonitor', label: 'Zasoby' },
];

const STORAGE_KEY = 'dashboard_widgets';

const getStoredWidgets = (): DashboardWidget[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return ALL_WIDGETS.map(w => w.id);
};

export function useDashboardWidgets() {
  const [visibleWidgets, setVisibleWidgets] = useState<DashboardWidget[]>(getStoredWidgets);

  const toggleWidget = useCallback((id: DashboardWidget) => {
    setVisibleWidgets(prev => {
      const next = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isVisible = useCallback((id: DashboardWidget) => visibleWidgets.includes(id), [visibleWidgets]);

  return { allWidgets: ALL_WIDGETS, visibleWidgets, toggleWidget, isVisible };
}
