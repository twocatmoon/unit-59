export function valuesUnique <T = any[]> (obj: any): T {
    const values = Object.values(obj)
    const found: any = {}

    return values.filter((item) => {
        return found.hasOwnProperty(item) 
            ? false 
            : (found[item as any] = true)
    }) as T
}
