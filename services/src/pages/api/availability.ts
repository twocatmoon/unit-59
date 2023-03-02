import { cleanData, deleteAvailability, getAvailabilityForPerson, getBase, insertAvailability } from '@/util/airtable'
import { User, verifyToken } from '@/util/airtableAuth'
import { NextApiRequest, NextApiResponse } from 'next'

async function getMethod (req: NextApiRequest, res: NextApiResponse) {
    const token = req.headers[ 'x-auth-token' ] as string
    
    let decodedToken: User
    try {
        decodedToken = await verifyToken(token)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    const base = getBase(process.env.AIRTABLE_API_KEY!)

    let availability
    try {
        availability = await getAvailabilityForPerson(base, decodedToken.id)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    res.status(200).json({
        ok: true,
        data: {
            availability: availability?.map(record => cleanData(record)),
        }
    })
}

async function postMethod (req: NextApiRequest, res: NextApiResponse) {
    const token = req.headers[ 'x-auth-token' ] as string
    
    let decodedToken: User
    try {
        decodedToken = await verifyToken(token)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    const body: {
        fromDate: string
        toDate?: string
    } = JSON.parse(req.body)
    const base = getBase(process.env.AIRTABLE_API_KEY!)

    try {
        await insertAvailability(base, decodedToken.id, body.fromDate, body.toDate)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    let availability
    try {
        availability = await getAvailabilityForPerson(base, decodedToken.id)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    res.status(200).json({
        ok: true,
        data: {
            availability: availability?.map(record => cleanData(record)),
        }
    })
}

async function deleteMethod (req: NextApiRequest, res: NextApiResponse) {
    const token = req.headers[ 'x-auth-token' ] as string
    
    let decodedToken: User
    try {
        decodedToken = await verifyToken(token)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    const body: {
        recordId: string
    } = JSON.parse(req.body)
    const base = getBase(process.env.AIRTABLE_API_KEY!)
    
    try {
        await deleteAvailability(base, body.recordId)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    let availability
    try {
        availability = await getAvailabilityForPerson(base, decodedToken.id)
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            error: error.message
        })
    }

    res.status(200).json({
        ok: true,
        data: {
            availability: availability?.map(record => cleanData(record)),
        }
    })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        return getMethod(req, res)
    }

    if (req.method === 'POST') {
        return postMethod(req, res)
    }

    if (req.method === 'DELETE') {
        return deleteMethod(req, res)
    }

    return res.status(500).json({ 
        ok: false, 
        error: 'Invalid request method'
    })
}
