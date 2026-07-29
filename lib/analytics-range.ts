export type AnalyticsRangeParams = {
  preset?: string;
  from?: string;
  to?: string;
};

const validPresets = new Set([
  "today",
  "yesterday",
  "7d",
  "30d",
  "90d",
  "12m",
  "all",
  "custom",
]);

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftDate(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function resolveAnalyticsRange(params: AnalyticsRangeParams) {
  const preset = validPresets.has(params.preset || "") ? params.preset! : "30d";
  const today = dateKey(new Date());
  let from = today;
  let to = today;
  let start: string | null = `${today}T00:00:00+01:00`;
  let end: string | null = new Date().toISOString();

  if (preset === "yesterday") {
    from = to = shiftDate(today, -1);
    start = `${from}T00:00:00+01:00`;
    end = `${to}T23:59:59.999+01:00`;
  } else if (preset === "7d" || preset === "30d" || preset === "90d") {
    const days = Number(preset.replace("d", ""));
    from = shiftDate(today, -(days - 1));
    start = `${from}T00:00:00+01:00`;
  } else if (preset === "12m") {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCFullYear(date.getUTCFullYear() - 1);
    from = date.toISOString().slice(0, 10);
    start = `${from}T00:00:00+01:00`;
  } else if (preset === "all") {
    from = "";
    start = null;
  } else if (preset === "custom") {
    const valid = /^\d{4}-\d{2}-\d{2}$/;
    from = valid.test(params.from || "") ? params.from! : shiftDate(today, -29);
    to = valid.test(params.to || "") ? params.to! : today;
    if (from > to) [from, to] = [to, from];
    start = `${from}T00:00:00+01:00`;
    end = `${to}T23:59:59.999+01:00`;
  }

  return { preset, from, to, start, end };
}
