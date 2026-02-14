const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
} as const;

function timestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

export function info(msg: string): void {
  console.log(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${msg}`);
}

export function success(msg: string): void {
  console.log(
    `${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.green}✓${COLORS.reset} ${msg}`
  );
}

export function warn(msg: string): void {
  console.log(
    `${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}⚠${COLORS.reset} ${msg}`
  );
}

export function error(msg: string): void {
  console.error(
    `${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.red}✗${COLORS.reset} ${msg}`
  );
}

export function migrationStart(name: string, dryRun: boolean): void {
  const prefix = dryRun
    ? `${COLORS.yellow}[DRY RUN]${COLORS.reset} `
    : "";
  console.log(
    `\n${prefix}${COLORS.cyan}▶${COLORS.reset} ${COLORS.bold}${name}${COLORS.reset}`
  );
}

export function migrationEnd(name: string, durationMs: number): void {
  console.log(
    `${COLORS.green}✓${COLORS.reset} ${COLORS.bold}${name}${COLORS.reset} completed in ${COLORS.magenta}${durationMs}ms${COLORS.reset}`
  );
}

export function progress(
  label: string,
  current: number,
  total: number
): void {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const bar = progressBar(pct);
  process.stdout.write(
    `\r  ${COLORS.dim}${label}:${COLORS.reset} ${bar} ${current}/${total} (${pct}%)`
  );
  if (current >= total) {
    process.stdout.write("\n");
  }
}

function progressBar(pct: number): string {
  const filled = Math.round(pct / 5);
  const empty = 20 - filled;
  return `${COLORS.green}${"█".repeat(filled)}${COLORS.dim}${"░".repeat(empty)}${COLORS.reset}`;
}

export function table(
  rows: { name: string; status: string; executedAt?: string }[]
): void {
  const nameWidth = Math.max(10, ...rows.map((r) => r.name.length));
  const statusWidth = Math.max(8, ...rows.map((r) => r.status.length));

  const header = `  ${"Migration".padEnd(nameWidth)}  ${"Status".padEnd(statusWidth)}  Executed At`;
  const separator = `  ${"─".repeat(nameWidth)}  ${"─".repeat(statusWidth)}  ${"─".repeat(24)}`;

  console.log(`\n${COLORS.bold}${header}${COLORS.reset}`);
  console.log(COLORS.dim + separator + COLORS.reset);

  for (const row of rows) {
    const statusColor =
      row.status === "applied" ? COLORS.green : COLORS.yellow;
    console.log(
      `  ${row.name.padEnd(nameWidth)}  ${statusColor}${row.status.padEnd(statusWidth)}${COLORS.reset}  ${row.executedAt ?? "—"}`
    );
  }
  console.log();
}
