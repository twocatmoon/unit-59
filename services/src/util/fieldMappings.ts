const personFields = process.env.NEXT_PUBLIC_PERSON_FIELD_MAPPINGS!.split(',')

export const PERSON = {
    experienceLevel: personFields[ 0 ],
    labelColor: personFields[ 1 ],
    name: personFields[ 2 ],
    canCoxswain: personFields[ 3 ],
} as const

const availabilityFields = process.env.NEXT_PUBLIC_AVAILABILITY_FIELD_MAPPINGS!.split(',')

export const AVAILABILITY = {
    person: availabilityFields[ 0 ],
    fromDate: availabilityFields[ 1 ],
    toDate: availabilityFields[ 2 ],
    availability: availabilityFields[ 3 ],
    personId: availabilityFields[ 4 ],
} as const

const dutyScheduleFields = process.env.NEXT_PUBLIC_DUTY_SCHEDULE_FIELD_MAPPINGS!.split(',')

export const DUTY_SCHEDULE = {
    coxswain: dutyScheduleFields[ 0 ],
    crew: dutyScheduleFields[ 1 ],
    week: dutyScheduleFields[ 2 ],
} as const

const trainingScheduleFields = process.env.NEXT_PUBLIC_TRAINING_SCHEDULE_FIELD_MAPPINGS!.split(',')

export const TRAINING_SCHEDULE = {
    coxswain: trainingScheduleFields[ 0 ],
    crew: trainingScheduleFields[ 1 ],
    week: trainingScheduleFields[ 2 ],
    scenario: trainingScheduleFields[ 3 ],
    time: trainingScheduleFields[ 4 ],
} as const

const userFields = process.env.NEXT_PUBLIC_USER_FIELD_MAPPINGS!.split(',')

export const USER = {
    email: userFields[ 0 ],
    password: userFields[ 1 ],
    role: userFields[ 2 ],
    name: userFields[ 3 ],
} as const
