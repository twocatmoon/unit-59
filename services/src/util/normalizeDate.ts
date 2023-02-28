export function normalizeDate (date: Date | string) {
    if (typeof date === 'string') date = new Date(date)
    return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000))
}
