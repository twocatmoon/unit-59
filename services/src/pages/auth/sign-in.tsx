import BoxForm, { BoxFormContainer } from '@/components/BoxForm'
import Layout from '@/components/Layout'
import { actions, useStore } from '@/stores/auth'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

export default function TrainingSchedulePage () {
    const router = useRouter()
    const [ authState, dispatchAuthAction ] = useStore()
    const [ formVisible, setFormVisible ] = useState<'signIn' | 'password' | 'choosePassword' | null>('signIn')
    const [ isLoading, setLoading ] = useState(false)

    // Sign in form

    const emailRef = useRef<HTMLInputElement>(null)
    const [ email, setEmail ] = useState<string>('')

    const next = async () => {
        const email = emailRef.current?.value

        if (!email) {
            alert('Please enter an email address.')
            return
        }

        try {
            setLoading(true)
            
            const response = await fetch(`/api/auth/get-user?email=${email}`)
            const result = await response.json()

            setEmail(email)

            if (result.data.hasSetPassword) {
                setFormVisible('password')
            } else {
                setFormVisible('choosePassword')
            }
        } catch (error) {
            console.error(error)
        }

        setLoading(false)
    }

    // Password form

    const passwordRef = useRef<HTMLInputElement>(null)

    const signIn = async () => {
        const password = passwordRef.current?.value

        if (!password) {
            alert('Please enter a password.')
            return
        }

        try {
            setLoading(true)

            const response = await fetch('/api/auth/sign-in', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                }),
            })
            const result = await response.json()

            dispatchAuthAction(actions.setAuth(result.data))
        } catch (error) {
            console.error(error)
            dispatchAuthAction(actions.unsetAuth())
        }

        setLoading(false)
    }

    // Choose password form

    const newPasswordRef = useRef<HTMLInputElement>(null)
    const newPasswordAgainRef = useRef<HTMLInputElement>(null)

    const setPassword = async () => {
        const password = newPasswordRef.current?.value
        const passwordAgain = newPasswordAgainRef.current?.value

        if (!password || password.length < 6) {
            alert('Please enter a password that is at least 6 characters long.')
            return
        }

        if (password !== passwordAgain) {
            alert('Passwords do not match.')
            return
        }

        try {
            setLoading(true)

            const response = await fetch('/api/auth/set-password', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                }),
            })
            const result = await response.json()

            dispatchAuthAction(actions.setAuth(result.data))
        } catch (error) {
            console.error(error)
            dispatchAuthAction(actions.unsetAuth())
        }

        setLoading(false)
    }

    useEffect(() => {
        if (authState.user) {
            router.push('/')
        }
    }, [ authState.user ])
    
    return (
        <Layout 
            title='Training Schedule' 
            isFormPage
        >
            <BoxFormContainer>
            {
                formVisible === 'signIn' && (
                    <BoxForm 
                        key='signIn'
                        title='Sign In' 
                        subtitle='Enter your email to get started.'
                    >
                        <>
                            <fieldset data-group>
                                <input ref={emailRef} type='email' name='email' placeholder='Email' data-large />
                                <button data-type-primary data-large onClick={next} disabled={isLoading}>Next</button>
                            </fieldset>
                        </>
                    </BoxForm>
                )
            }
            {
                formVisible === 'password' && (
                    <BoxForm 
                        key='password'
                        title='Enter Your Password' 
                        subtitle='Enter your password to get continue.'
                    >
                        <>
                            <fieldset data-group>
                                <input ref={passwordRef} type='password' name='password' placeholder='Password' data-large />
                                <button data-type-primary data-large onClick={signIn} disabled={isLoading}>Sign In</button>
                            </fieldset>
                            <p data-center>
                                Please contact an administrator if you have forgotten your password.
                            </p>
                        </>
                    </BoxForm>
                )
            }
            {
                formVisible === 'choosePassword' && (
                    <BoxForm 
                        key='choosePassword'
                        title='Choose a Password' 
                    >
                        <>
                            <p>Welcome to {process.env.NEXT_PUBLIC_APP_TITLE}!</p>
                            <p>Since this is your first time signing in, you'll need to choose a password. You'll use this password in combination with your email any time you want to sign in.</p>
                            <p>Please contact an administrator if you need to reset or change your password.</p>
                            <fieldset>
                                <input ref={newPasswordRef} type='password' name='password' placeholder='Password' data-large />
                                <input ref={newPasswordAgainRef} type='password' name='passwordAgain' placeholder='Password (again)' data-large />
                                <button data-type-primary data-large onClick={setPassword} disabled={isLoading}>Set Password</button>
                            </fieldset>
                        </>
                    </BoxForm>
                )
            }
            </BoxFormContainer>
        </Layout>
    )
}
