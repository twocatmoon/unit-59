import Block from '@/components/Block'
import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { useStore } from '@/stores/auth'
import { Availability } from '@/util/airtable'
import { formatWeek } from '@/util/formatWeek'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

interface PageData {
    availability: Availability[]
}

export default function ManageAvailability () {
    const router = useRouter()
    const [ authState ] = useStore()
    const hasFetchedDataRef = useRef(false)
    const [ pageData, setPageData ] = useState<null | PageData>(null)
    const [ isLoading, setLoading ] = useState(false);
    const fromDateRef = useRef<HTMLInputElement>(null)
    const toDateRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (authState.ready && !authState.user) {
            router.push('/auth/sign-in')
        }

        if (!hasFetchedDataRef.current && authState.ready && authState.user) {
            (async () => {
                hasFetchedDataRef.current = true
                const response = await fetch('/api/availability', {
                    method: 'GET', 
                    headers: { 'X-Auth-Token': authState.token }
                })
                const result = await response.json()
                setPageData(() => result.data)
            })()
        }
    }, [ authState.ready, authState.user ])

    const addAvailability = async () => {
        const fromDate = fromDateRef.current?.value
        const toDate = toDateRef.current?.value

        if (!fromDate) {
            alert('Please enter an on/from date.')
            return
        }

        if (new Date(fromDate) < new Date()) {
            alert('The on/from date must be today or later.')
            return
        }

        if (toDate && new Date(toDate) < new Date()) {
            alert('The to date must be today or later.')
            return
        }

        if (toDate && new Date(fromDate) > new Date(toDate)) {
            alert('The to date must be after the from date.')
            return
        }

        try {
            setLoading(true)

            const response = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'X-Auth-Token': authState.token },
                body: JSON.stringify({
                    fromDate,
                    toDate
                })
            })
            const result = await response.json()

            setPageData(() => result.data)

            fromDateRef.current!.value = ''
            toDateRef.current!.value = ''
        } catch (error) {
            console.error(error)
        }

        setLoading(false)
    }

    const deleteAvailability = async (recordId: string) => {
        if (!confirm('Are you sure?')) return

        const currentAvailabilityIndex = pageData?.availability.findIndex(availability => availability.id === recordId)
        const clonedPageData = JSON.parse(JSON.stringify(pageData))
        clonedPageData.availability.splice(currentAvailabilityIndex, 1)

        setPageData(() => clonedPageData)

        try {
            const response = await fetch('/api/availability', {
                method: 'DELETE',
                headers: { 'X-Auth-Token': authState.token },
                body: JSON.stringify({ recordId })
            })
            const result = await response.json()

            setPageData(() => result.data)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Layout title='Manage Availability'>
            <Block>
                <Header
                    title={'Availability'}
                />

                <p>Please select any days or ranges of days that you are <strong>not available</strong> to take shifts on.</p>

                <hr />

                <p>I'm <strong>UNAVAILABLE</strong> on/from...</p>

                <fieldset>
                    <fieldset data-group>
                        <label>
                            <span>On/From (required)</span>
                            <input type='date' ref={fromDateRef} />
                        </label>
                        <label>
                            <span>To (optional)</span>
                            <input type='date' ref={toDateRef} />
                        </label>
                    </fieldset>
                    <fieldset>
                        <button 
                            data-type-primary
                            disabled={isLoading}
                            onClick={addAvailability}
                        >
                            {
                                isLoading ? 'Saving...' : 'Save'
                            }
                        </button>
                    </fieldset>
                </fieldset>
            </Block>

            <Block>
                <Header
                    title={'Current Availability'}
                />

                <table>
                    <thead>
                        <tr />
                    </thead>
                    <tbody>
                        {
                            !pageData && (<>
                                <tr>
                                    <th colSpan={1} className={'--alignCenter'}>— Loading —</th>
                                </tr>
                            </>)
                        }
                        {
                            pageData && (
                                <>
                                    {
                                        pageData.availability.length === 0 && (
                                            <tr>
                                                <td colSpan={1} className={'--alignCenter'}>— Add your availability above —</td>
                                            </tr>
                                        )
                                    }
                                    {
                                        pageData.availability.length > 0 && pageData.availability.map((availability) => (
                                            <tr key={availability.id}>
                                                <td data-flex>
                                                    <div>
                                                        Unavailable&nbsp;<strong>
                                                        {
                                                            availability.fields.toDate && (
                                                                <>
                                                                    {formatWeek(availability.fields.fromDate!)} — {formatWeek(availability.fields.toDate)}
                                                                </>
                                                            )
                                                        }
                                                        {
                                                            !availability.fields.toDate && (
                                                                <>
                                                                    {formatWeek(availability.fields.fromDate!)}
                                                                </>
                                                            )
                                                        }
                                                        </strong>
                                                    </div>
                                                    <aside>
                                                        <button 
                                                            data-type-primary 
                                                            data-dangerous
                                                            onClick={() => deleteAvailability(availability.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </aside>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </>
                            )
                        }
                    </tbody>
                </table>

            </Block>
        </Layout>
    )
}
