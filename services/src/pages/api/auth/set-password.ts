import { getBase } from '@/util/airtable'
import { generateToken, getUser, setUserPassword, User } from '@/util/airtableAuth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const base = getBase(process.env.AIRTABLE_API_KEY!)

        let user: User
        try {
            user = await getUser(base, req.query.email as string)

            if (user.fields.password) {
                return res.status(500).json({
                    ok: true,
                    error: 'User already has a password set.'
                })
            }
        }  catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message
            })
        }

        try {
            await setUserPassword(base, user.id, req.body.password)
        } catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message
            })
        }

        const token = await generateToken(user.id)

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
