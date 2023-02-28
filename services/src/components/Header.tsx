import styles from '@/styles/Header.module.css'

interface HeaderProps {
    title: React.ReactNode
    aside?: React.ReactNode
}

export default function Header (props: HeaderProps) {
    return (
        <header className={styles.header}>
            <h1>{props.title}</h1>
            {
                props.aside && (
                    <aside>
                        {props.aside}
                    </aside>
                )
            }
        </header>
    )
}
