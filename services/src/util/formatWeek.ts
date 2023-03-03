import { normalizeDate } from '@/util/normalizeDate'
import { format } from 'date-fns'

export function formatWeek (week: string) {
    const date = normalizeDate(week)
    return format(date, 'MMM dd')
}
