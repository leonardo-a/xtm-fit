import { WatchedList } from '@/core/entities/watched-list'
import { WorkoutPlanExercise } from './workout-plan-exercise'

export class WorkoutPlanExerciseList extends WatchedList<WorkoutPlanExercise> {
  compareItems(a: WorkoutPlanExercise, b: WorkoutPlanExercise): boolean {
    return a.exerciseId.equals(b.exerciseId) && a.weekDay === b.weekDay
  }
}
