import styles from '@/styles/LinkList.module.css'

interface LinkListProps {
    children?: React.ReactNode
    marginRight?: boolean
}

export default function LinkList (props: LinkListProps) {
    return (
        <div className={styles.linkList + (props.marginRight && ` ${styles.marginRight}`)}>
            {props.children}
        </div>
    )
}
