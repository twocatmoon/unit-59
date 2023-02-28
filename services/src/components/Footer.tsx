import styles from '@/styles/Footer.module.css'

interface FooterProps {
    children?: React.ReactNode
}

export default function Footer (props: FooterProps) {
    return (
        <footer className={styles.footer}>
            {props.children}
        </footer>
    )
}
