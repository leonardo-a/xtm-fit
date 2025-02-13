import { BedDouble, ClipboardList, CloudAlert, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router'

import { AssignExerciseDrawer } from '@/components/assign-exercise-drawer'
import { Header } from '@/components/header'
import { WeekCarousel } from '@/components/week-caroussel'
import { WorkoutPlanExercise } from '@/components/workout-plan-exercise'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/axios'
import { RequestStatus } from '@/types/app'
import { WorkoutPlanExerciseWithDetails } from '@/types/exercises'
import { WorkoutPlanWithDetails } from '@/types/workout-plan'

export function WorkoutPlan() {
  const { id } = useParams()
  const { user } = useAuth()
  const { search } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [status, setStatus] = useState<RequestStatus>('pending')
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanWithDetails | null>(null)
  const [exercises, setExercises] = useState<WorkoutPlanExerciseWithDetails[]>([])
  const [weekDay, setWeekDay] = useState<number>(() => {
    const weekDay = searchParams.get('dia')

    if (!weekDay) {
      return new Date().getDay() + 1
    }

    return parseInt(weekDay)
  })

  async function fetchWorkoutPlan() {
    setStatus('pending')

    try {
      const response = await api.get(`/workout-plans/${id}`)

      setWorkoutPlan(response.data.workoutPlan)
      setStatus('success')

      fetchExercises()
    } catch (err) {
      setStatus('failed')
      console.log(err)
    }
  }

  async function fetchExercises() {
    try {
      const response = await api.get(`/workout-plans/${id}/exercises`, {
        params: {
          weekDay,
        },
      })

      console.log(exercises)

      setExercises(response.data.weekDayExercises)
      searchParams.delete('upt')
      setSearchParams(searchParams, { replace: true })
    } catch (err) {
      console.log(err)
    }
  }

  function onWeekDayChange(weekDay: number) {
    searchParams.set('dia', weekDay.toString())
    setSearchParams(searchParams, { replace: true })

    setWeekDay(weekDay)
  }

  useEffect(() => {
    fetchExercises()
  }, [weekDay, search])

  useEffect(() => {
    fetchWorkoutPlan()
  }, [id])

  return (
    <>
      <Header />
      <main className="mt-16 flex-1 flex flex-col items-center bg-orange-200 bg-transparent p-4">
        {/* {workoutPlan} */}
        {status === 'pending' && (
          <div className="flex-1 grid place-items-center">
            <Loader2 className="animate-spin text-lime-400" size={32} />
          </div>
        )}
        {status === 'success' && workoutPlan !== null && (
          <div className="w-full flex-1 flex flex-col gap-6 my-4">
            <div className="flex gap-3 justify-between items-center">
              <div className="flex flex-col justify-center items-start">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-300 leading-tight">{workoutPlan.title}</h2>
                <p className="text-sm font-medium text-slate-500 leading-none">{workoutPlan.description}</p>
              </div>
              <ClipboardList size={36} strokeWidth={1.6} />
            </div>
            <div className="flex justify-center w-full">
              <div className="max-w-3xl w-full">
                <WeekCarousel selectedWeekDay={weekDay} onWeekDayPress={onWeekDayChange} />
              </div>
            </div>
            <div className="w-full bg-slate-50 dark:bg-slate-950 flex-1 flex flex-col rounded-md space-y-3 p-1 shadow-xs">
              <div className="flex flex-col flex-1 gap-3 w-full px-5 py-4 border-2 border-orange-200 dark:border-lime-300 rounded-md">
                {
                  user?.role === 'PERSONAL_TRAINER' && (
                    <AssignExerciseDrawer weekDay={weekDay} workoutPlanId={id || ''} />
                  )
                }
                {exercises.length
                  ? (
                    <>
                      {
                        exercises.map((item, i) => (
                          <WorkoutPlanExercise
                            key={item.id}
                            sequence={i + 1}
                            {...item}
                          />
                        ))
                        }
                    </>
                    )
                  : (
                    <div className="place-self-center my-auto flex flex-col items-center">
                      <BedDouble className="text-slate-500" />
                      <div className="leading-tight text-center text-slate-500">
                        <span>Dia de descanso</span>
                        {
                          user?.role === 'STUDENT'
                            ? (
                              <p>Faça algo para relaxar!</p>
                              )
                            : (
                              <p>Nenhum exercício definido</p>
                              )
                        }
                      </div>
                    </div>
                    )}
              </div>
            </div>
          </div>
        )}
        {(status === 'failed' || !workoutPlan) && (
          <div className="flex-1 grid place-items-center">
            <div className="flex flex-col items-center">
              <CloudAlert className="text-lime-500" size={32} />
              <p className="text-lime-500">Houve um erro ao consultar a planilha.</p>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
