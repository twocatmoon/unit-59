import { getAvailability, getBase, getTrainingSchedules, getPeople } from '@/util/airtable'
import { NextApiRequest, NextApiResponse } from 'next'

async function get (_req: NextApiRequest, res: NextApiResponse) {
    const base = getBase(process.env.AIRTABLE_API_KEY!)

    let people
    try {
        people = await getPeople(base)
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    let availability
    try {
        availability = await getAvailability(base)
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    let trainingSchedules
    try {
        trainingSchedules = await getTrainingSchedules(base)
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    res.status(200).json({
        ok: true,
        data: {
            people,
            availability,
            trainingSchedules,
        }
    })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        return get(req, res)
    }
}
