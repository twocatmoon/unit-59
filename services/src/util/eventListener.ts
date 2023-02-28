export type EventMap = {
    [key: string]: (...args: any[]) => void
}

export type ListenerMap<Event> = {
    [Property in keyof Event]: ((...args: any[]) => void)[]
}

export class EventListener<Events extends EventMap> {
    private listeners: ListenerMap<Events> = {} as ListenerMap<Events>

    on <E extends keyof Events> (event: E, listener: Events[E]) {
        const listeners = this.listeners[event] || []
        listeners.push(listener)
        this.listeners[event] = listeners as ListenerMap<Events>[E]
    }

    off <E extends keyof Events> (event: E, listener: Events[E]) {
        const listeners = this.listeners[event] || []
        const index = listeners.indexOf(listener)
        listeners.splice(index, 1)
        this.listeners[event] = listeners as ListenerMap<Events>[E]
    }

    offAll (event?: keyof Events) {
        if (!event) this.listeners = {} as ListenerMap<Events>
        else this.listeners[event!] = [] as ListenerMap<Events>[keyof Events]
    }

    trigger (event: keyof Events, data?: any): any[] {
        const listeners = this.listeners[event] || []
        return listeners.map((listener) => listener(data))
    }
}
