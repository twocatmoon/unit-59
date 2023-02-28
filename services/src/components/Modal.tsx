import styles from '@/styles/Modal.module.css'
import { EventListener, EventMap } from '@/util/eventListener'

interface ModalEvents extends EventMap {
    'close': () => void
}

class ModalEventListener extends EventListener<ModalEvents> {}

export const modalEvents = new ModalEventListener()

interface ModalProps {
    title: string
    children?: React.ReactNode
}

export default function Layout (props: ModalProps) {
    return (
        <div className={styles.modal}>
            <header>
                <h2>{props.title}</h2>
                <aside>
                    <button data-type-close onClick={() => modalEvents.trigger('close')}>
                        <span>&times;</span>
                    </button>
                </aside>
            </header>
            <div>
                {props.children}
            </div>
        </div>
    )
}
