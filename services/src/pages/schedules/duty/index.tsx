import Layout from '@/components/Layout'
import { useEditMode } from '@/hooks/useEditMode'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Person, Availability, DutySchedule, findPerson, findAvailablePeopleForWeek, mapResultFieldsToSource } from '@/util/airtable'
import Modal, { modalEvents } from '@/components/Modal'
import Header from '@/components/Header'
import BoxButtonContainer from '@/components/BoxButtonContainer'
import Footer from '@/components/Footer'
import { DUTY_SCHEDULE } from '@/util/fieldMappings'
import { useStore } from '@/stores/auth'
import { formatWeek } from '@/util/formatWeek'
import { If } from '@twocatmoon/react-template-helpers'

const NUM_CREW_PER_SCHEDULE = 4

interface PageData {
    people: Person[]
    availability: Availability[]
    dutySchedules: DutySchedule[]
}

export default function DutySchedulePage () {
    const [ authState ] = useStore()
    const [ isEditing, canEdit, setEditMode ] = useEditMode()
    const [ pageData, dispatchPageData ] = useState<null | PageData>(null)
    const [ openModal, setOpenModal ] = useState<'' | 'set_coxswain' | 'set_crew'>('')
    const [ currentWeek, setCurrentWeek ] = useState('')
    const [ currentIndex, setCurrentIndex ] = useState(0)
    const [ isDataDirty, setDataDirty ] = useState(false)
    const [ isLoading, setLoading ] = useState(false)

    useEffect(() => {
        (async () => {
            const response = await fetch('/api/schedules/duty')
            const result = await response.json()
            dispatchPageData(result.data)
        })()

        const modalCloseHandler = () => setOpenModal('');
        modalEvents.on('close', modalCloseHandler)

        return () => {
            modalEvents.off('close', modalCloseHandler)
        }
    }, [])

    const setPageData = (data: PageData) => {
        setDataDirty(true)
        dispatchPageData(data)
    }

    const openSelectCoxswainModal = (week: string) => {
        setCurrentWeek(week)
        setOpenModal('set_coxswain')
    }

    const openSelectCrewMemberModal = (week: string, index: number) => {
        setCurrentWeek(week)
        setCurrentIndex(index)
        setOpenModal('set_crew')
    }

    const addWeek = () => {
        const schedules = JSON.parse(JSON.stringify(pageData!.dutySchedules))
        const lastSchedule = schedules[ schedules.length - 1 ] || { fields: { week: format(new Date(), 'yyyy-MM-dd') } }
        const newSchedule = { fields: {} } as DutySchedule

        const nextWeek = new Date(lastSchedule.fields.week)
        nextWeek.setDate(nextWeek.getDate() + 8)
        newSchedule.fields.week = format(nextWeek, 'yyyy-MM-dd')

        schedules.push(newSchedule)

        setPageData({
            ...pageData!,
            dutySchedules: schedules
        })
    }

    const selectCoxswain = (id?: Person[ 'id' ]) => {
        const schedules: DutySchedule[] = JSON.parse(JSON.stringify(pageData!.dutySchedules))
        const schedule = schedules.find((schedule: DutySchedule) => schedule.fields.week === currentWeek)

        if (!schedule) return

        if (id) {
            if (!schedule.fields.coxswain) schedule!.fields.coxswain = []
            schedule!.fields.coxswain = [ id ]
        } else {
            schedule!.fields.coxswain = []
        }

        setPageData({
            ...pageData!,
            dutySchedules: schedules
        })

        modalEvents.trigger('close')
    }

    const selectCrewMember = (id?: Person[ 'id' ]) => {
        const schedules: DutySchedule[] = JSON.parse(JSON.stringify(pageData!.dutySchedules))
        const schedule = schedules.find((schedule: DutySchedule) => schedule.fields.week === currentWeek)
        
        if (!schedule) return

        if (id) {
            if (!schedule.fields.crew) schedule!.fields.crew = []

            if (schedule.fields.crew[ currentIndex ]) {
                schedule.fields.crew[ currentIndex ] = id
            } else {
                schedule.fields.crew.push(id)
            }
        } else {
            if (schedule.fields.crew && currentIndex < schedule.fields.crew.length) schedule.fields.crew.splice(currentIndex, 1)
        }

        setPageData({
            ...pageData!,
            dutySchedules: schedules
        })

        modalEvents.trigger('close')
    }

    const isPersonSelected = (personId: Person[ 'id' ]) => {
        const schedule = pageData!.dutySchedules.find((schedule: DutySchedule) => schedule.fields.week === currentWeek)
        if (!schedule) return false

        if (schedule.fields.coxswain && schedule.fields.coxswain.includes(personId)) return true
        if (schedule.fields.crew && schedule.fields.crew.includes(personId)) return true

        return false
    }

    const saveChanges = async () => {
        setLoading(true)

        try {
            await fetch('/api/schedules/duty', {
                method: 'POST', 
                headers: { 'X-Auth-Token': authState.token },
                body: JSON.stringify({
                    data: pageData?.dutySchedules.map((schedule: DutySchedule) => {
                        return {
                            ...schedule,
                            fields: mapResultFieldsToSource(schedule.fields, DUTY_SCHEDULE)
                        }
                    })
                })
            })
            setDataDirty(false)
        } catch (err) {
            console.error(err)
        }
        
        setLoading(false)
    }

    return (
        <Layout 
            title='Duty Schedule' 
            showSubNav={canEdit}
            subNavItems={
                canEdit && (
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
                )
            }
            modal={(() => {
                if (!openModal) return false

                if (openModal === 'set_coxswain') {
                    return (
                        <Modal title='Select Coxswain'>
                            <BoxButtonContainer>
                                <button 
                                    data-type-box 
                                    onClick={() => selectCoxswain()}
                                >
                                    <h4>
                                        No Selection
                                    </h4>
                                    <dl>
                                        <dt><h6>&nbsp;</h6></dt>
                                        <dd>&nbsp;</dd>
                                    </dl>
                                </button>
                            {
                                pageData && findAvailablePeopleForWeek(currentWeek, pageData.people, pageData.availability, true).map(person => (
                                    <button 
                                        key={person.id} 
                                        data-type-box 
                                        onClick={() => selectCoxswain(person.id)}
                                        disabled={isPersonSelected(person.id)}
                                    >
                                        <h4>
                                            <span data-type-label data-label-color={person.fields.labelColor || ''} />
                                            {person.fields.name}
                                        </h4>
                                        <dl>
                                            <dt><h6>Exp. Level</h6></dt>
                                            <dd>{person.fields.experienceLevel}</dd>
                                        </dl>
                                    </button>
                                ))
                            }
                            </BoxButtonContainer>
                        </Modal>
                    )
                }

                if (openModal === 'set_crew') {
                    return (
                        <Modal title='Select Crew Member'>
                            <BoxButtonContainer>
                                <button 
                                    data-type-box 
                                    onClick={() => selectCrewMember()}
                                >
                                    <h4>
                                        No Selection
                                    </h4>
                                    <dl>
                                        <dt><h6>&nbsp;</h6></dt>
                                        <dd>&nbsp;</dd>
                                    </dl>
                                </button>
                            {
                                pageData && findAvailablePeopleForWeek(currentWeek, pageData.people, pageData.availability).map((person) => (
                                    <button 
                                        key={person.id} 
                                        data-type-box
                                        onClick={() => selectCrewMember(person.id)} 
                                        disabled={isPersonSelected(person.id)}
                                    >
                                        <h4>
                                            <span data-type-label data-label-color={person.fields.labelColor || ''} />
                                            {person.fields.name}
                                        </h4>
                                        <dl>
                                            <dt><h6>Exp. Level</h6></dt>
                                            <dd>{person.fields.experienceLevel}</dd>
                                        </dl>
                                    </button>
                                ))
                            }
                            </BoxButtonContainer>
                        </Modal>
                    )
                }
            })()}
        >
            <Header
                title={'Duty Schedule'}
                aside={(<>
                    {/* <LinkList marginRight>
                        <a>View Calendar</a>
                        <a>Embed</a>
                    </LinkList> */}
                    {
                        isEditing && (
                            <button 
                                data-type-primary
                                disabled={isLoading || !isDataDirty}
                                onClick={saveChanges}
                            >
                                {
                                    isLoading ? 'Saving...' : 'Save Changes'
                                }
                            </button>
                        )
                    }
                </>)}
            />

            <table>
                <thead>
                    <tr>
                        <th />
                        <th><h6>Week</h6></th>
                        <th><h6>Coxswain</h6></th>
                        <th><h6>Crew Members</h6></th>
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
                    pageData && pageData.dutySchedules.map((schedule, index) => (
                        <tr key={index} data-alt-row={index % 2 === 1}>
                            <th className={'--alignCenter'}>
                                {parseInt(format(new Date(schedule.fields.week!), 'w')) + 1}
                            </th>
                            <td>
                                {formatWeek(schedule.fields.week!)}
                            </td>
                            <td>
                                {
                                    If(!isEditing && schedule.fields.coxswain?.length, () => (<>{
                                        schedule.fields.coxswain!.map((personId) => (
                                            <button 
                                                key={personId + '_view'}
                                                data-type-label
                                                data-label-color={findPerson(personId, pageData.people)!.fields.labelColor || ''}
                                            >
                                                {findPerson(personId, pageData.people)!.fields.name}
                                            </button>
                                        ))
                                    }</>)).EndIf()
                                }
                                {
                                    If(isEditing && schedule.fields.coxswain?.length, () => (<>{
                                        schedule.fields.coxswain!.map((personId) => (
                                            <button 
                                                key={personId + '_edit'}
                                                data-type-control
                                                data-label-color={findPerson(personId, pageData.people)!.fields.labelColor || ''}
                                                onClick={() => openSelectCoxswainModal(schedule.fields.week!)}
                                            >
                                                {findPerson(personId, pageData.people)!.fields.name}
                                            </button>
                                        ))
                                    }</>)).EndIf()
                                }
                                {
                                    If(!isEditing && !schedule.fields.coxswain?.length, () => (<>{
                                        <button data-type-label className={'--placeholder'} />
                                    }</>)).EndIf()
                                }
                                {
                                    If(isEditing && !schedule.fields.coxswain?.length, () => (<>{
                                        <button data-type-control onClick={() => openSelectCoxswainModal(schedule.fields.week!)}><i>+</i> Add Crew</button>
                                    }</>)).EndIf()
                                }
                            </td>
                            <td>
                                {
                                    If(schedule.fields.crew?.length, () => (<>{
                                        schedule.fields.crew!.map((personId, index) => (
                                            !isEditing ? (
                                                <button 
                                                    key={personId + '_view'}
                                                    data-type-label
                                                    data-label-color={findPerson(personId, pageData.people)!.fields.labelColor || ''}
                                                >
                                                    {findPerson(personId, pageData.people)!.fields.name}
                                                </button>
                                            ) : (
                                                <button 
                                                    key={personId + '_edit'}
                                                    data-type-control
                                                    data-label-color={findPerson(personId, pageData.people)!.fields.labelColor || ''}
                                                    onClick={() => openSelectCrewMemberModal(schedule.fields.week!, index)}
                                                >
                                                    {findPerson(personId, pageData.people)!.fields.name}
                                                </button>
                                            )
                                        ))
                                    }</>)).EndIf()
                                }
                                {
                                    If(!schedule.fields.crew?.length && !isEditing, () => (<>{
                                        <button data-type-label className={'--placeholder'} />
                                    }</>)).EndIf()
                                }
                                {
                                    If((schedule.fields.crew?.length || 0) < NUM_CREW_PER_SCHEDULE && isEditing, () => (<>{
                                        (() => {
                                            const buttons = []
                                            let i = schedule.fields.crew?.length || 0
                                            while (buttons.length < NUM_CREW_PER_SCHEDULE - (schedule.fields.crew?.length || 0)) {
                                                buttons.push(<button data-type-control key={i} onClick={() => openSelectCrewMemberModal(schedule.fields.week!, i)}><i>+</i> Add Crew</button>)
                                                i++
                                            }
                                            return buttons
                                        })()
                                    }</>)).EndIf()
                                }
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
            {
                isEditing && (<>
                    <Footer>
                        <button data-type-control onClick={addWeek}><i>+</i> Add Week</button>
                    </Footer>
                </>)
            }
        </Layout>
    )
}

