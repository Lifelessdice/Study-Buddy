<template>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Quizzes</h5>
        <BaseButton
          v-if="isTeacher"
          :to="{ name: 'CreateQuiz', params: { courseSlug } }"
          variant="primary"
          outline
          size="sm"
        >
          + Create Quiz
        </BaseButton>
      </div>

      <div v-if="loading" class="text-muted">Loading quizzes...</div>
      <div v-else>
        <div v-if="error" class="alert alert-warning">
          {{ error }}
        </div>
        <div v-if="!quizzes.length" class="alert alert-info">
          No quizzes have been created for this course yet.
          <span v-if="isTeacher">Click "Create Quiz" to add one.</span>
        </div>

        <div v-for="quiz in quizzes" :key="quiz._id" class="quiz-card mb-3 p-3 border rounded">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1">{{ quiz.title }}</h6>
              <div class="small text-muted">
                Questions: {{ (quiz.questions && quiz.questions.length) || 0 }}
              </div>
              <div class="small text-muted">Created: {{ formatDate(quiz.createdAt) }}</div>
              <div v-if="!isTeacher && myParticipationByQuiz[quiz._id]" class="small text-success">
                Score: {{ myParticipationByQuiz[quiz._id].score ?? 'N/A' }}%
              </div>
            </div>
            <div class="d-flex gap-2">
              <BaseButton
                v-if="isTeacher"
                :to="{ name: 'EditQuiz', params: { quizSlug: quizSlug(quiz) } }"
                variant="secondary"
                outline
                size="sm"
              >
                <span class="btn-text btn-text-long">Edit</span>
                <span class="btn-text btn-text-short">Edit</span>
                <span class="btn-icon">E</span>
              </BaseButton>

              <BaseButton
                v-else-if="!myParticipationByQuiz[quiz._id]"
                :to="{ name: 'TakeQuiz', params: { quizSlug: quizSlug(quiz) } }"
                variant="primary"
                outline
                size="sm"
              >
                <span class="btn-text btn-text-long">Take Quiz</span>
                <span class="btn-text btn-text-short">Take</span>
                <span class="btn-icon">T</span>
              </BaseButton>

              <BaseButton
                v-if="isTeacher"
                variant="secondary"
                outline
                size="sm"
                @click="$emit('view-attempts', quiz)"
              >
                <span class="btn-text btn-text-long">View Attempts</span>
                <span class="btn-text btn-text-short">Attempts</span>
                <span class="btn-icon">Rpt</span>
              </BaseButton>

              <BaseButton
                v-if="isTeacher"
                variant="danger"
                outline
                size="sm"
                @click="$emit('delete-quiz', quiz)"
              >
                <span class="btn-text btn-text-long">Delete</span>
                <span class="btn-text btn-text-short">Delete</span>
                <span class="btn-icon">Del</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseQuizzes',
  props: {
    quizzes: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    isTeacher: { type: Boolean, default: false },
    error: { type: String, default: '' },
    courseSlug: { type: String, default: '' },
    myParticipationByQuiz: { type: Object, default: () => ({}) },
    quizSlug: { type: Function, required: true },
    formatDate: { type: Function, required: true }
  },
  emits: ['view-attempts', 'delete-quiz']
}
</script>
