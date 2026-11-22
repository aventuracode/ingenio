// ============================================
// DATE FORMATTING HELPERS
// ============================================
// Zona horaria fija de la app para evitar que las fechas renderizadas
// en Server Components (que corren en UTC) muestren un día distinto
// al del usuario.

export const APP_TIMEZONE = 'America/Argentina/Buenos_Aires'

/**
 * Convierte un valor a Date.
 * - Strings 'YYYY-MM-DD' (columnas DATE de Postgres) se interpretan como
 *   fecha local (mediodía para evitar desbordes por zona horaria).
 * - Timestamps ISO se interpretan como instante absoluto (UTC).
 */
function toDate(value: string | Date): Date {
  if (value instanceof Date) return value
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`)
  }
  return new Date(value)
}

/**
 * Formatea una fecha/timestamp en la zona horaria de la app.
 * @param value - ISO timestamp, 'YYYY-MM-DD' o Date
 * @param options - opciones de Intl.DateTimeFormat (se fusionan con los defaults)
 */
export function formatDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (value == null) return '-'
  return toDate(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
    ...options,
  })
}

/**
 * Formatea fecha y hora en la zona horaria de la app.
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (value == null) return '-'
  return toDate(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: APP_TIMEZONE,
    ...options,
  })
}
