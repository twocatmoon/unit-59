import { useState } from 'react'

export function useEditMode () {
    const [ isEditing, setEditMode ] = useState(false)
    const [ canEdit, setCanEdit ] = useState(true)

    return [ isEditing, canEdit, setEditMode ] as [
        isEditing: boolean,
        canEdit: boolean,
        setEditMode: (isEditing: boolean) => void
    ]
}
