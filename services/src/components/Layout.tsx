import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Layout.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

interface LayoutProps {
    title: string
    children?: React.ReactNode
    className?: string
    showSubNav?: boolean
    subNavItems?: React.ReactNode
    modal?: React.ReactNode
}

export default function Layout (props: LayoutProps) {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>{props.title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className} ${props.className || ''}`}>
                <header className={styles.header}>
                    <div className={styles.container}>
                        <h1>Unit 59</h1>
                        <nav>
                            <Link href='/schedules/duty'>
                                <button data-type-nav data-active={router.asPath === '/schedules/duty'}>Duty Schedule</button>
                            </Link>
                            <Link href='/schedules/training'>
                                <button data-type-nav data-active={router.asPath === '/schedules/training'}>Training Schedule</button>
                            </Link>
                            <Link href='/manage-availability'>
                                <button data-type-nav data-active={router.asPath === '/manage-availability'}>Manage Availability</button>
                            </Link>
                        </nav>
                        <aside>
                            <Link href='/api/oauth'>
                                <button data-type-nav-link>Sign In</button>
                            </Link>
                        </aside>
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
                        <p>Footer</p>
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
