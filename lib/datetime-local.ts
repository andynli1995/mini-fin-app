/**
 * Format a Date (UTC instant) as "yyyy-MM-ddThh:mm" in the viewer's local timezone.
 * Use this to pre-fill datetime-local inputs so the displayed time matches what the user sees elsewhere.
 */
export function toLocalDatetimeLocalString(date: Date): string {
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
