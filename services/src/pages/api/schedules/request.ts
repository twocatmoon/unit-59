import fetch from 'node-fetch'
import { NextApiRequest, NextApiResponse } from 'next'
import { User, verifyToken } from '@/util/airtableAuth'
import jwt from 'jsonwebtoken'
import { format } from 'date-fns'
import { getBase } from '@/util/airtable'

interface TokenPayload { 
    personId: string
    scheduleId: string
    approved?: boolean
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const token = req.query.token as string

        const decodedToken = await new Promise<TokenPayload>((resolve, reject) => {
            jwt.verify(token, process.env.JWT_TOKEN_SECRET!, function (err, result) {
                if (err) return reject(err)
                resolve(result as TokenPayload)
            })
        })
        
        if (!decodedToken) {
            return res.status(500).json({
                ok: false,
                error: 'Invalid token.'
            })
        }

        const base = getBase(process.env.AIRTABLE_API_KEY!)
        const { approved, personId, scheduleId } = decodedToken

        if (approved) {
            // TODO: approve request
            // - update schedule record
            return
        } else {
            // TODO: deny request
            // - update schedule record
            return
        }
    }

    if (req.method === 'POST') {
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
            scheduleId: string
            scheduleType: string
            week: string
        } = JSON.parse(req.body)

        const tokenPayload: TokenPayload = { 
            personId: decodedToken.id,
            scheduleId: body.scheduleId,
        }
        const approveToken = jwt.sign({
            ...tokenPayload,
            approved: true
        }, process.env.JWT_SECRET!)
        const denyToken = jwt.sign({
            ...tokenPayload,
            approved: false
        }, process.env.JWT_SECRET!)
        
        const localUrl = 'https://local.twocatmoon.com'
        const webhookUrl = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appVoEaSzYuTjbhev/wflSVBrq0gbT4bCnu/wtrn6nAnPSmNIQFT8'

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personName: decodedToken.fields.name,
                    personEmail: decodedToken.fields.email,
                    scheduleType: body.scheduleType,
                    week: body.week,
                    weekNumber: parseInt(format(new Date(body.week), 'w')) + 1,
                    approveUrl: `${localUrl}/api/schedules/request?token=${approveToken}`,
                    denyUrl: `${localUrl}/api/schedules/request?token=${denyToken}`,
                })
            })
            return res.status(200).json({
                ok: true
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
