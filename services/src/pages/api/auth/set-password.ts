import { getBase } from '@/util/airtable'
import { generateToken, getUser, setUserPassword, User } from '@/util/airtableAuth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const body = JSON.parse(req.body)
        const base = getBase(process.env.AIRTABLE_API_KEY!)

        let user: User
        try {
            user = await getUser(base, body.email as string)

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
            await setUserPassword(base, user.id, body.password)
        } catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message
            })
        }

        const token = await generateToken(user)
        delete user.fields.password

        return res.status(200).json({
            ok: true,
            data: {
                token,
                user,
            }
        })
    }

    return res.status(500).json({ 
        ok: false, 
        error: 'Invalid request method'
    })
}
