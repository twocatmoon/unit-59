import Airtable from 'airtable'
import { AVAILABILITY, DUTY_SCHEDULE, PERSON, TRAINING_SCHEDULE, USER } from './fieldMappings'
import { valuesUnique } from './valuesUnique'



// #region Types

export interface Person {
    id: string
    fields: {
        experienceLevel?: string
        labelColor?: string
        name?: string
        canCoxswain?: boolean
    }
}

export interface Availability {
    id: string
    fields: {
        person?: Person[ 'id' ][]
        fromDate?: string
        toDate?: string
        availability?: 'Available' | 'Unavailable'
    }
}

export interface DutySchedule {
    id: string
    fields: {
        coxswain?: Person[ 'id' ][]
        crew?: Person[ 'id' ][]
        week?: string
    }
}

export interface TrainingSchedule {
    id: string
    fields: {
        coxswain?: Person[ 'id' ][]
        crew?: Person[ 'id' ][]
        week?: string
        scenario?: string
    }
}

// #endregion



// #region Setup

export function getBase (key: string) {
    Airtable.configure({
        apiKey: key,
    })
    
    return Airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)
}

// #endregion
  


// #region Data Functions

export async function getPeople (base: Airtable.Base) {
    try {
        const result = await base(process.env.NEXT_PUBLIC_PERSON_TABLE!).select({
            view: process.env.NEXT_PUBLIC_PERSON_VIEW!,
            fields: valuesUnique(PERSON)
        }).all() as never as Person[]

        return result.map(record => {
            const canCoxswainRawField = (
                (record.fields[PERSON.canCoxswain as keyof Person['fields']] as any as string[]) ||
                []
            )
            const canCoxswain = canCoxswainRawField.includes(process.env.NEXT_PUBLIC_COXSWAIN_LEVEL!)

            return {
                ...record,
                fields: {
                    ...mapSourceFieldsToResult(record.fields, PERSON),
                    canCoxswain,
                }
            }
        })
    } catch (error: any) {
        console.log('error', error)
        throw error
    }
}

export async function getAvailability (base: Airtable.Base) {
    try {
        const result = await base(process.env.NEXT_PUBLIC_AVAILABILITY_TABLE!).select({
            view: process.env.NEXT_PUBLIC_AVAILABILITY_VIEW!,
            fields: valuesUnique(AVAILABILITY)
        }).all() as never as Availability[]

        return result.map(record => ({
            ...record,
            fields: mapSourceFieldsToResult(record.fields, AVAILABILITY)
        }))
    } catch (error: any) {
        throw error
    }
}

export async function getAvailabilityForPerson (base: Airtable.Base, personId: string) {
    try {
        const result = await base(process.env.NEXT_PUBLIC_AVAILABILITY_TABLE!).select({
            filterByFormula: `SEARCH("${personId}",{${AVAILABILITY.personId}})`,
            view: process.env.NEXT_PUBLIC_AVAILABILITY_VIEW!,
            fields: valuesUnique(AVAILABILITY)
        }).all() as never as Availability[]

        return result.map(record => {
            const newRecord = {
                ...record,
                fields: mapSourceFieldsToResult(record.fields, AVAILABILITY)
            }
            delete newRecord.fields.personId
            return newRecord
        })
    } catch (error: any) {
        throw error
    }
}

export async function insertAvailability (base: Airtable.Base, personId: string, fromDate: string, toDate?: string) {
    const fields = {
        [ AVAILABILITY.person ]: [ personId ],
        [ AVAILABILITY.fromDate ]: fromDate,
        [ AVAILABILITY.availability ]: 'Unavailable',
    }

    if (toDate) fields[ AVAILABILITY.toDate ] = toDate

    try {
        await base(process.env.NEXT_PUBLIC_AVAILABILITY_TABLE!).create([ { fields } ]) as never as DutySchedule[]
    } catch (error: any) {
        throw error
    }
}

export async function deleteAvailability (base: Airtable.Base, recordId: string) {
    try {
        await base(process.env.NEXT_PUBLIC_AVAILABILITY_TABLE!).destroy(recordId) as never as DutySchedule[]
    } catch (error: any) {
        throw error
    }
}

export async function getDutySchedules (base: Airtable.Base) {
    try {
        const result = await base(process.env.NEXT_PUBLIC_DUTY_SCHEDULE_TABLE!).select({
            view: process.env.NEXT_PUBLIC_DUTY_SCHEDULE_VIEW!,
            fields: valuesUnique(DUTY_SCHEDULE),
        }).all() as never as DutySchedule[]

        return result.map(record => ({
            ...record,
            fields: mapSourceFieldsToResult(record.fields, DUTY_SCHEDULE)
        }))
    } catch (error: any) {
        throw error
    }
}

export async function createDutySchedules (base: Airtable.Base, records: any[]) {
    try {
        await base(process.env.NEXT_PUBLIC_DUTY_SCHEDULE_TABLE!).create(records) as never as DutySchedule[]
    } catch (error: any) {
        throw error
    }
}

export async function updateDutySchedules (base: Airtable.Base, records: any[]) {
    console.log(records)
    
    try {
        await base(process.env.NEXT_PUBLIC_DUTY_SCHEDULE_TABLE!).update(records) as never as DutySchedule[]
    } catch (error: any) {
        throw error
    }
}

export async function getTrainingSchedules (base: Airtable.Base) {
    try {
        const result = await base(process.env.NEXT_PUBLIC_TRAINING_SCHEDULE_TABLE!).select({
            view: process.env.NEXT_PUBLIC_TRAINING_SCHEDULE_VIEW!,
            fields: valuesUnique(TRAINING_SCHEDULE),
        }).all() as never as DutySchedule[]
        
        return result.map(record => ({
            ...record,
            fields: mapSourceFieldsToResult(record.fields, TRAINING_SCHEDULE)
        }))
    } catch (error: any) {
        throw error
    }
}

export async function createTrainingSchedules (base: Airtable.Base, records: any[]) {
    try {
        await base(process.env.NEXT_PUBLIC_TRAINING_SCHEDULE_TABLE!).create(records) as never as TrainingSchedule[]
    } catch (error: any) {
        throw error
    }
}

export async function updateTrainingSchedules (base: Airtable.Base, records: any[]) {
    try {
        await base(process.env.NEXT_PUBLIC_TRAINING_SCHEDULE_TABLE!).update(records) as never as TrainingSchedule[]
    } catch (error: any) {
        throw error
    }
}

// #endregion



// #region Helper Functions

export function cleanData (data: any) {
    data = JSON.parse(JSON.stringify(data))

    for (const [ key ] of Object.entries(data)) {
        if (key !== 'id' && key !== 'fields') delete data[ key ]
    }

    return data
}

export function mapSourceFieldsToResult <T extends Record<string, any>> (fields: Record<string, any>, mapping: Record<string, string>): T {
    const mappedFields: Record<string, any> = {}

    const entries = Object.entries(mapping)

    for (const [ key, value ] of Object.entries(fields)) {
        const entry = entries.find(([ , v ]) => v === key)
        if (!entry) continue

        mappedFields[ entry![ 0 ] ] = value
    }

    return mappedFields as T
}

export function mapResultFieldsToSource <T extends Record<string, any>> (fields: Record<string, any>, mapping: Record<string, string>): T {
    const mappedFields: Record<string, any> = {}

    const entries = Object.entries(mapping)

    for (const [ key, value ] of Object.entries(fields)) {
        const entry = entries.find(([ k ]) => k === key)
        if (!entry) continue

        mappedFields[ entry![ 1 ] ] = value
    }

    return mappedFields as T
}

export function findPerson (id: Person[ 'id' ], people: Person[]) {
    return people.find(person => person.id === id)
}

export function findAvailablePeopleForWeek (weekOfStr: string, people: Person[], availability: Availability[], canCoxswain?: boolean) {
    const weekOf = new Date(weekOfStr)

    return people.filter(person => {
        if (canCoxswain && !person.fields.canCoxswain) return false

        const personAvailability = availability.filter(av => av.fields.person![ 0 ] === person.id && av.fields.availability === 'Unavailable')

        return !personAvailability.some(av => {
            const fromDate = new Date(av.fields.fromDate!)

            const nextWeek = new Date(weekOf)
            nextWeek.setDate(nextWeek.getDate() + 6)
            
            const toDate = av.fields.toDate
                ? new Date(av.fields.toDate)
                : nextWeek

            return fromDate >= weekOf && toDate <= nextWeek 
        })
    })
}

export function findAvailablePeopleForDay (dayStr: string, people: Person[], availability: Availability[], canCoxswain?: boolean) {
    const day = new Date(dayStr)

    return people.filter(person => {
        if (canCoxswain && !person.fields.canCoxswain) return false

        const personAvailability = availability.filter(av => av.fields.person![ 0 ] === person.id && av.fields.availability === 'Unavailable')

        return !personAvailability.some(av => {
            const fromDate = new Date(av.fields.fromDate!)

            const tomorrow = new Date(day)
            tomorrow.setDate(tomorrow.getDate() + 1)
            
            const toDate = av.fields.toDate
                ? new Date(av.fields.toDate)
                : tomorrow

            return fromDate >= day && toDate <= tomorrow 
        })
    })
}

// #endregion
