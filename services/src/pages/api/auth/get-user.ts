import { getBase } from '@/util/airtable'
import { getUser } from '@/util/airtableAuth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const base = getBase(process.env.AIRTABLE_API_KEY!)

        try {
            const user = await getUser(base, req.query.email as string)

            return res.status(200).json({
                ok: true,
                data: {
                    hasSetPassword: !!user.fields.password
                }
            })
        }  catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    }

    return res.status(500).json({ 
        ok: false, 
        error: 'Invalid request method'
    })
}
