import { cleanData, createDutySchedules, DutySchedule, getAvailability, getBase, getDutySchedules, getPeople, updateDutySchedules } from '@/util/airtable'
import { decodeToken, User, verifyToken } from '@/util/airtableAuth'
import { NextApiRequest, NextApiResponse } from 'next'

async function get (_req: NextApiRequest, res: NextApiResponse) {
    const base = getBase(process.env.AIRTABLE_API_KEY!)

    let people
    try {
        people = await getPeople(base)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    let availability
    try {
        availability = await getAvailability(base)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    let dutySchedules
    try {
        dutySchedules = await getDutySchedules(base)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    res.status(200).json({
        ok: true,
        data: {
            people: people?.map(record => cleanData(record)),
            availability: availability?.map(record => cleanData(record)),
            dutySchedules: dutySchedules?.map(record => cleanData(record)),
        }
    })
}

async function post (req: NextApiRequest, res: NextApiResponse) {
    const token = req.headers[ 'x-auth-token' ] as string
    
    let decodedToken: User
    try {
        decodedToken = await verifyToken(token, true)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    const base = getBase(process.env.AIRTABLE_API_KEY!)

    let data: DutySchedule[] = []
    try {
        const result = JSON.parse(req.body)
        data = result.data
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    let numCallsRequired = 0

    const existingRecords = data.filter(record => record.id).map(record => cleanData(record))
    numCallsRequired = Math.ceil(existingRecords.length / 10)

    for (let i = 0; i < numCallsRequired; i++) {
        const recordsToUpdate = existingRecords.slice(i * 10, (i + 1) * 10)
        try {
            await updateDutySchedules(base, recordsToUpdate)
        } catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    }

    const newRecords = data.filter(record => !record.id).map(record => cleanData(record))
    numCallsRequired = Math.ceil(newRecords.length / 10)

    for (let i = 0; i < numCallsRequired; i++) {
        const recordsToUpdate = newRecords.slice(i * 10, (i + 1) * 10)
        try {
            await createDutySchedules(base, recordsToUpdate)
        } catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    }

    let dutySchedules
    try {
        dutySchedules = await getDutySchedules(base)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    res.status(200).json({
        ok: true,
        data: {
            dutySchedules: dutySchedules?.map(record => cleanData(record)),
        }
    })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        return get(req, res)
    }

    if (req.method === 'POST') {
        return post(req, res)
    }

    return res.status(500).json({ 
        ok: false, 
        error: 'Invalid request method'
    })
}
