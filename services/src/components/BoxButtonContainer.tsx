import styles from '@/styles/BoxButtonContainer.module.css'

interface BoxButtonContainer {
    children?: React.ReactNode
}

export default function Header (props: BoxButtonContainer) {
    return (
        <div className={styles.boxButtonContainer}>
            {props.children}
        </div>
    )
}
