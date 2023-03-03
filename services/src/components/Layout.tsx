import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Layout.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useStore } from '@/stores/auth'
import { actions } from '../stores/auth'
import { useEffect, useRef } from 'react'

const inter = Inter({ subsets: ['latin'] })

interface LayoutProps {
    title: string
    children?: React.ReactNode
    className?: string
    showSubNav?: boolean
    subNavItems?: React.ReactNode
    modal?: React.ReactNode
    isFormPage?: boolean
}

export default function Layout (props: LayoutProps) {
    const router = useRouter()
    const [ authState, dispatchAuthAction ] = useStore()

    const signOut = () => {
        dispatchAuthAction(actions.unsetAuth())
    }
    
    const hasFetchedAuthRef = useRef(false)
    useEffect(() => {
        if (hasFetchedAuthRef.current) return

        (async () => {
            if (authState.user) {
                hasFetchedAuthRef.current = true

                try {
                    const response = await fetch('/api/auth/verify-token', {
                        method: 'POST',
                        body: JSON.stringify({
                            id: authState.user.id,
                            token: authState.token,
                        })
                    })
                    const result = await response.json()

                    dispatchAuthAction(actions.setAuth(result.data))
                } catch (error) {
                    dispatchAuthAction(actions.unsetAuth())
                }
            }
        })()
    }, [ authState.user ])

    return (
        <>
            <Head>
                <title>{`${process.env.NEXT_PUBLIC_APP_TITLE} | ${props.title}`}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className} ${props.className || ''} ${props.isFormPage && styles.isFormPage}`}>
                <header className={styles.header}>
                    <div className={styles.container}>
                        <h1>{process.env.NEXT_PUBLIC_APP_TITLE}</h1>
                        {
                            !props.isFormPage && (
                                <>
                                    <nav>
                                        <Link href='/schedules/duty'>
                                            <button data-type-nav data-active={router.asPath === '/schedules/duty'}>Duty Schedule</button>
                                        </Link>
                                        <Link href='/schedules/training'>
                                            <button data-type-nav data-active={router.asPath === '/schedules/training'}>Training Schedule</button>
                                        </Link>
                                        <Link href={(authState.ready && authState.user) ? '/manage-availability' : '/auth/sign-in'}>
                                            <button data-type-nav data-active={router.asPath === '/manage-availability'}>Manage Availability</button>
                                        </Link>
                                    </nav>
                                    <aside>
                                        {
                                            authState.user && (
                                                <>
                                                    <p>
                                                        <span style={{fontSize: '90%'}}>{authState.user.fields.name}</span>
                                                        &nbsp;|&nbsp;
                                                        <button data-type-nav-link onClick={signOut}>Sign Out</button>
                                                    </p>
                                                    <p>
                                                        <span style={{fontSize: '90%'}}>{authState.user.fields.name}</span><br />
                                                        <button data-type-nav-link onClick={signOut}>Sign Out</button>
                                                    </p>
                                                </>
                                            )
                                        }
                                        {
                                            !authState.user && (
                                                <Link href='/auth/sign-in'>
                                                    <button data-type-nav-link>Sign In</button>
                                                </Link>
                                            )
                                        }
                                    </aside>
                                </>
                            )
                        }
                    </div>
                    {
                        props.showSubNav && (
                            <nav>
                                <div className={styles.container}>
                                    {props.subNavItems}
                                </div>
                            </nav>
                        )
                    }
                </header>
                <div className={styles.container}>
                    {props.children}
                </div>
                <footer className={styles.footer}>
                    <div className={styles.container}>
                        <p>
                            Powered by&nbsp;
                            <a href='https://github.com/twocatmoon/unit-59' target='_blank'>Unit 59 ERSS</a>&nbsp;
                        </p>
                        <p>
                            &copy; {(new Date()).getFullYear()}&nbsp;
                            <a href='https://github.com/twocatmoon' target='_blank'>Two-Cat Moon</a>
                        </p>
                    </div>
                </footer>
                {
                    props.modal && (
                        <div className={styles.modal}>
                            {props.modal}
                        </div>
                    )
                }
            </main>
        </>
    )
}
