import { useStore } from '@/stores/auth'
import { useEffect, useState } from 'react'

export function useEditMode () {
    const [ authState ] = useStore()
    const [ isEditing, setEditMode ] = useState(false)
    const [ canEdit, setCanEdit ] = useState(authState.user && authState.user.fields.role === 'Administrator')

    useEffect(() => {
        setCanEdit(authState.user && authState.user.fields.role === 'Administrator')
    }, [ authState.user ])

    return [ isEditing, canEdit, setEditMode ] as [
        isEditing: boolean,
        canEdit: boolean,
        setEditMode: (isEditing: boolean) => void
    ]
}
