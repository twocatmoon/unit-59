import Airtable from 'airtable'
import { mapSourceFieldsToResult } from './airtable'
import { USER } from './fieldMappings'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { valuesUnique } from './valuesUnique'

export interface User {
    id: string
    fields: {
        email?: string
        password?: string
        role?: '' | 'Administrator'
        name?: string
    }
}

export async function getUser (base: Airtable.Base, email: string) {
    try {
        const result = await base(process.env.NEXT_PUBLIC_PERSON_TABLE!).select({
            filterByFormula: `SEARCH("${email}",{${USER.email}})`,
            fields: valuesUnique(USER)
        }).all() as never as User[]

        if (result.length === 0) {
            throw new Error('No user with specified email found.')
        }

        return {
            id: result[0].id,
            fields: mapSourceFieldsToResult(result[0].fields, USER)
        }
    } catch (error: any) {
        throw error
    }
}

export async function setUserPassword (base: Airtable.Base, id: string, password: string) {
    let hashedAndSaltedPassword

    try {
        hashedAndSaltedPassword = await hashPassword(password)
    } catch (error: any) {
        throw error
    }

    try {
        const result = await base(process.env.NEXT_PUBLIC_PERSON_TABLE!).update([
            {
                id,
                fields: {
                    [ USER.password ]: hashedAndSaltedPassword
                }
            }
        ]) as never as User[]

        if (result.length === 0) {
            throw new Error('No user with specified email found.')
        }

        return true
    } catch (error: any) {
        throw error
    }
}

export async function verifyUserPassword (base: Airtable.Base, email: string, password: string) {
    let user

    try {
        user = await getUser(base, email)
    } catch (error: any) {
        throw error
    }

    try {
        await comparePasswords(password, user.fields.password!)
    } catch (error: any) {
        throw error
    }

    return user
}

export async function generateToken (user: User): Promise<string> {
    return jwt.sign({ ...user }, process.env.JWT_TOKEN_SECRET!)
}

export async function decodeToken (token: string): Promise<User> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_TOKEN_SECRET!, function (err, result) {
            if (err) return reject(err)
            resolve(result as User)
        })
    })
}

export async function verifyToken (token: string, requiresAdmin?: boolean) {
    let decodedToken: User
    try {
        decodedToken = await decodeToken(token)
    } catch (error: any) {
        throw error
    }

    if (!decodedToken) {
        throw new Error('Invalid token.')
    }

    if (requiresAdmin && decodedToken.fields.role !== 'Administrator') {
        throw new Error('You do not have permission to perform this action.')
    }

    return decodedToken
}

async function hashPassword (password: string): Promise<string> {
    const saltRounds = 10

    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return reject(err)

            bcrypt.hash(password, salt, function (err, hash) {
                if (err) return reject(err)
                resolve(hash)
            })
        })
    })
}

async function comparePasswords (password: string, hashedPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, function (err, result) {
            if (err) return reject(err)
            resolve()
        })
    })
}
