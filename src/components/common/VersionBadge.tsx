/**
 * Dyskretna etykieta wersji (lewy dolny róg, niski kontrast).
 * Wartości wstrzykiwane przy buildzie przez Vite `define` (patrz vite.config.ts):
 * commit (skrócony SHA), branch, czas builda. Widoczna na wszystkich środowiskach.
 */
const formatBuiltAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
};

const VersionBadge = () => {
  const commit = __APP_COMMIT__;
  const branch = __APP_BRANCH__;
  const builtAt = formatBuiltAt(__APP_BUILT_AT__);

  const title = `branch: ${branch}\ncommit: ${commit}\nbuild: ${builtAt}`;

  return (
    <div
      aria-hidden="true"
      title={title}
      className="fixed bottom-1 left-1 z-40 max-w-[60vw] select-none truncate whitespace-nowrap font-mono text-[10px] leading-none text-muted-foreground/35 transition-colors hover:text-muted-foreground/70"
    >
      {branch} · {commit} · {builtAt}
    </div>
  );
};

export default VersionBadge;
