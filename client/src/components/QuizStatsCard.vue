<template>
  <div class="small">
    <div v-if="loading" class="text-muted">Loading stats...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else-if="!hasAttempts" class="text-muted">No attempts yet</div>
    <div v-else class="d-flex flex-wrap gap-3 align-items-baseline">
      <div>
        <div class="text-uppercase text-muted small">Avg</div>
        <strong>{{ averageScore }}%</strong>
      </div>
      <div>
        <div class="text-uppercase text-muted small">Best</div>
        <span>{{ maxScore }}%</span>
      </div>
      <div>
        <div class="text-uppercase text-muted small">Lowest</div>
        <span>{{ minScore }}%</span>
      </div>
      <div>
        <div class="text-uppercase text-muted small">Attempts</div>
        <span>{{ attempts }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import QuizParticipationService from '@/services/QuizParticipationService'

export default {
  name: 'QuizStatsCard',
  props: {
    quizId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      attempts: 0,
      scores: [] // normalized numeric scores
    }
  },
  computed: {
    hasAttempts() {
      return this.attempts > 0 && this.scores.length > 0
    },
    averageScore() {
      if (!this.hasAttempts) return null
      const sum = this.scores.reduce((acc, s) => acc + s, 0)
      return Math.round((sum / this.scores.length) * 10) / 10
    },
    minScore() {
      if (!this.hasAttempts) return null
      return Math.min(...this.scores)
    },
    maxScore() {
      if (!this.hasAttempts) return null
      return Math.max(...this.scores)
    }
  },
  methods: {
    async loadStats() {
      try {
        this.loading = true
        this.error = null
        this.attempts = 0
        this.scores = []

        const res = await QuizParticipationService.getAll({ quiz: this.quizId })
        const data = res.data.data || res.data || []
        this.attempts = data.length

        // normalize scores (handle numbers and numeric strings)
        this.scores = data
          .map(p => {
            const v = p.score
            if (v === undefined || v === null) return null
            const num = Number(v)
            return Number.isNaN(num) ? null : num
          })
          .filter(v => v !== null)
      } catch (err) {
        console.error('QuizStatsCard loadStats error', err)
        this.error = 'Could not load stats'
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.loadStats()
  }
}
</script>
