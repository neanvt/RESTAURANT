/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 */
export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export const getTodayLocal = (): string => {
  return formatDateLocal(new Date());
};

/**
 * Get date N days ago in YYYY-MM-DD format (local timezone)
 */
export const getDaysAgoLocal = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateLocal(date);
};
