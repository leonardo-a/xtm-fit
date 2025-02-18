import { Exercise } from '@/domains/workout/enterprise/entities/exercise'

export class ExercisePresenter {
  static toHTTP(exercise: Exercise) {
    return {
      id: exercise.id.toString(),
      name: exercise.name,
      videoUrl: exercise.videoUrl,
      description: exercise.description,
    }
  }
}
