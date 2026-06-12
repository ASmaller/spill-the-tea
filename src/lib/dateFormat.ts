const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

function parseFeedDate(date: Date | string): Date | null {
  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(
    DATE_KEY_PATTERN.test(date) ? `${date}T00:00:00.000Z` : date
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getFeedDateKey(date: Date | string): string {
  const parsed = parseFeedDate(date);
  return parsed ? parsed.toISOString().slice(0, 10) : date.toString();
}

export function formatFeedDate(date: Date | string): string {
  const parsed = parseFeedDate(date);
  if (!parsed) return date.toString();

  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).formatToParts(parsed);

  const weekday = parts.find(p => p.type === "weekday")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  const month = parts.find(p => p.type === "month")?.value.toUpperCase();

  if (!weekday || !day || !month) return getFeedDateKey(parsed);
  return `${weekday} · ${day} ${month}`;
}

export function formatFeedDayLabel(date: Date | string): string {
  const parsed = parseFeedDate(date);
  if (!parsed) return date.toString();

  const dateKey = getFeedDateKey(parsed);
  const todayKey = getFeedDateKey(new Date());
  const dayStart = new Date(`${dateKey}T00:00:00.000Z`);
  const todayStart = new Date(`${todayKey}T00:00:00.000Z`);
  const daysFromToday = Math.round(
    (dayStart.getTime() - todayStart.getTime()) / DAY_MS
  );

  if (daysFromToday === 0) return "Today";
  if (daysFromToday === -1) return "Yesterday";
  if (daysFromToday < -1) return `${Math.abs(daysFromToday)} days ago`;

  if (daysFromToday === 1) return "Tomorrow";
  return `In ${daysFromToday} days`;
}

export function isFeedDateToday(date: Date | string): boolean {
  return getFeedDateKey(date) === getFeedDateKey(new Date());
}

export function formatPostedDate(date: Date): string {
  const time = date.getTime();
  const now = Date.now();
  const elapsed = time - now;
  if (elapsed <= 0) return "Just now";

  const daysAgo = Math.floor(elapsed / DAY_MS);
  if (daysAgo > 0) {
    return `${daysAgo}d ago`;
  }

  const hoursAgo = Math.floor(elapsed / HOUR_MS);
  if (hoursAgo > 0) {
    return `${hoursAgo}h ago`;
  }

  const minutesAgo = Math.floor(elapsed / MINUTE_MS);
  if (minutesAgo > 0) {
    return `${minutesAgo}m ago`;
  }

  return "Just now";
}

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function formatShortDate(date: Date | string): string {
  const parsed = typeof date === "string" ? parseDateKey(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

export function formatDailyTrendLabel(
  dateKey: string,
  totalDays: number
): string {
  const date = parseDateKey(dateKey);

  if (totalDays <= 14) {
    return new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatRelativeDate(
  date: Date | null,
  now = new Date()
): string {
  if (!date) return "never";

  const today = getStartOfToday(now);
  const dateStart = getStartOfToday(date);
  const daysAgo = Math.round((today.getTime() - dateStart.getTime()) / DAY_MS);

  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo > 1 && daysAgo < 7) return `${daysAgo}d ago`;
  if (daysAgo >= 7 && daysAgo < 56) return `${Math.floor(daysAgo / 7)}w ago`;

  return formatShortDate(date);
}

export function getStartOfToday(now: Date): Date {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return startOfToday;
}

export function getStartOfWeek(now: Date): Date {
  const startOfWeek = getStartOfToday(now);
  const daysSinceMonday = (startOfWeek.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
  return startOfWeek;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
