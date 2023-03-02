import { User } from '@/util/airtableAuth'
import { action, createStoreContext, CreateStoreOptions } from '@twocatmoon/react-actions'

type AuthState = {
    ready: boolean
    token: string
    user: User | null
}

const initialState = {
    ready: false,
    token: '',
    user: null,
}

export const actions = {
    setAuth: action<AuthState, AuthState>((_prevState, nextState) => {
        return {
            ...nextState,
            ready: true,
        }
    }),

    unsetAuth: action<AuthState, undefined>((_prevState) => {
        return {
            ...JSON.parse(JSON.stringify(initialState)),
            ready: true,
        }
    })
}

const options: CreateStoreOptions = {
    storageKey: 'auth',
    storageType: 'local',
    ssr: true,
}

export const { Provider, useStore } = createStoreContext<AuthState>(initialState, actions, options)
