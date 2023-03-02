import styles from '@/styles/BoxForm.module.css'

interface BoxFormProps {
    title: string
    subtitle?: string
    children?: React.ReactNode
    footer?: React.ReactNode
}

export default function BoxForm (props: BoxFormProps) {
    return (
        <div className={styles.boxForm}>
            <div className={styles.box}>
                <header>
                    <h1>{props.title}</h1>
                    {
                        props.subtitle && (
                            <p>{props.subtitle}</p>
                        )
                    }
                </header>
                <div className={styles.content}>
                    {props.children}
                </div>
            </div>
            {
                props.footer && (
                    <footer>
                        {props.children}
                    </footer>
                )
            }
        </div>
    )
}

export function BoxFormContainer (props: { children?: React.ReactNode }) {
    return (
        <div className={styles.container}>
            {props.children}
        </div>
    )
}
