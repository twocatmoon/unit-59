import { normalizeDate } from '@/util/normalizeDate'
import { format } from 'date-fns'

export function formatWeek (week: string) {
    const date = normalizeDate(week)
    return format(date, 'MMM dd')
}

export function formatWeekWithTime (week: string, time: string) {
    const date = normalizeDate(week)

    time = time || '00:00'
    const timeDate = new Date()
    timeDate.setHours(parseInt(time.split(':')[0]))
    timeDate.setMinutes(parseInt(time.split(':')[1]))

    return format(date, 'MMM dd') + format(timeDate, ', h:mm a')
}
