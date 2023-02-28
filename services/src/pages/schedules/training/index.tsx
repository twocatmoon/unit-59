import Layout from '@/components/Layout'
import { useEditMode } from '@/hooks/useEditMode'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Person, Availability, findPerson, TrainingSchedule } from '@/util/airtable'

interface PageData {
    people: Person[]
    availability: Availability[]
    trainingSchedules: TrainingSchedule[]
}

export default function TrainingSchedulePage () {
    const [ isEditing, canEdit, setEditMode ] = useEditMode()

    const [ pageData, setPageData ] = useState<null | PageData>(null);

    useEffect(() => {
        (async () => {
            const response = await fetch('/api/schedules/training')
            const result = await response.json()
            setPageData(result.data)
        })()
    }, [])

    return (
        <Layout 
            title='Training Schedule' 
            showSubNav={canEdit}
            subNavItems={
                <>
                    <button 
                        data-type-tab 
                        data-active={!isEditing}
                        onClick={() => setEditMode(false)}
                    >
                        View
                    </button>
                    <button 
                        data-type-tab 
                        data-active={isEditing}
                        onClick={() => setEditMode(true)}
                    >
                        Edit
                    </button>
                </>
            }
        >
            <h1>Training Schedule</h1>
            <br />
            <br />
            <table>
                <thead>
                    <tr>
                        <th />
                        <th><h6>Week</h6></th>
                        <th><h6>Coxswain</h6></th>
                        <th><h6>Crew Members</h6></th>
                        <th className={'--alignCenter'}><h6>Scenario</h6></th>
                    </tr>
                </thead>
                <tbody>
                {
                    !pageData && (<>
                        <tr>
                            <th colSpan={4} className={'--alignCenter'}>— Loading —</th>
                        </tr>
                    </>)
                }
                {
                    pageData && pageData.trainingSchedules.map((schedule, index) => (
                        <tr key={index} data-alt-row={index % 2 === 1}>
                            <th className={'--alignCenter'}>
                                {parseInt(format(new Date(schedule.fields.week!), 'w')) + 1}
                            </th>
                            <td>
                                {schedule.fields.week}
                            </td>
                            <td>
                                {
                                    !isEditing && schedule.fields.coxswain?.length && schedule.fields.coxswain.map((personId) => (
                                        <button 
                                            key={personId + '_view'}
                                            data-type-label
                                            data-label-color={findPerson(personId, pageData.people)!.fields['labelColor'] || ''}
                                        >
                                            {findPerson(personId, pageData.people)!.fields.name}
                                        </button>
                                    ))
                                }
                                {
                                    isEditing && schedule.fields.coxswain?.length && schedule.fields.coxswain.map((personId) => (
                                        <button 
                                            key={personId + '_edit'}
                                            data-type-control
                                            data-label-color={findPerson(personId, pageData.people)!.fields['labelColor'] || ''}
                                        >
                                            {findPerson(personId, pageData.people)!.fields.name}
                                        </button>
                                    ))
                                }
                                {
                                    (!schedule.fields.coxswain?.length && !isEditing) && 
                                        <button data-type-label className={'--placeholder'} />
                                }
                                {
                                    (!schedule.fields.coxswain?.length && isEditing) &&
                                        <button data-type-control><i>+</i> Add Crew</button>
                                }
                            </td>
                            <td>
                                {
                                    schedule.fields.crew?.length && schedule.fields.crew.map((personId) => (
                                        !isEditing ? (
                                            <button 
                                                key={personId + '_view'}
                                                data-type-label
                                                data-label-color={findPerson(personId, pageData.people)!.fields['labelColor'] || ''}
                                            >
                                                {findPerson(personId, pageData.people)!.fields.name}
                                            </button>
                                        ) : (
                                            <button 
                                                key={personId + '_edit'}
                                                data-type-control
                                                data-label-color={findPerson(personId, pageData.people)!.fields['labelColor'] || ''}
                                            >
                                                {findPerson(personId, pageData.people)!.fields.name}
                                            </button>
                                        )
                                    ))
                                }
                                {
                                    (!schedule.fields.crew?.length && !isEditing) && 
                                        <button data-type-label className={'--placeholder'} />
                                }
                                {
                                    ((schedule.fields.crew?.length || 0) < 4 && isEditing) && (() => {
                                        const buttons = []
                                        while (buttons.length < 4 - (schedule.fields.crew?.length || 0)) {
                                            buttons.push(<button data-type-control key={buttons.length}><i>+</i> Add Crew</button>)
                                        }
                                        return buttons
                                    })()
                                }
                            </td>
                            <td className={'--alignCenter'}>
                                {
                                    schedule.fields.scenario && (
                                        <strong>{schedule.fields.scenario}</strong>
                                    )
                                }
                                {
                                    !schedule.fields.scenario && !isEditing && (
                                        <button data-type-label className={'--placeholder'} />
                                    )
                                }
                                {
                                    !schedule.fields.scenario && isEditing && (
                                        <button data-type-control><i>+</i></button>
                                    )
                                }
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
            {
                isEditing && (<>
                    <br />
                    <div>
                        <button data-type-control><i>+</i> Add Week</button>
                    </div>
                </>)
            }
        </Layout>
    )
}
