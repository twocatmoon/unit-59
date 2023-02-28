import { decodeToken, generateToken } from '@/util/airtableAuth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        let decodedToken
        try {
            decodedToken = await decodeToken(req.body.token as string)
        } catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message
            })
        }

        if (req.body.id !== decodedToken.id) {
            return res.status(500).json({
                ok: false,
                error: 'Token does not match user.'
            })
        }

        const token = await generateToken(decodedToken.id)

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
