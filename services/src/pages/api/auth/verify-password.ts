import { getBase } from '@/util/airtable'
import { generateToken, User, verifyUserPassword } from '@/util/airtableAuth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const base = getBase(process.env.AIRTABLE_API_KEY!)

        let user: User
        try {
            user = await verifyUserPassword(base, req.body.email as string, req.body.password as string)
        }  catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message
            })
        }

        const token = generateToken(user!.id)

        res.status(200).json({
            ok: true,
            data: {
                token
            }
        })
    }

    return res.status(500).json({ 
        ok: false, 
        error: 'Invalid request method'
    })
}
