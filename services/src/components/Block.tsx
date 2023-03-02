import styles from '@/styles/Block.module.css'

interface BlockProps {
    children?: React.ReactNode
}

export default function Block (props: BlockProps) {
    return (
        <footer className={styles.block}>
            {props.children}
        </footer>
    )
}
