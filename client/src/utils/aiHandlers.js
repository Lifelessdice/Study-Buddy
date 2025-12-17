import { normalizeAiFlashcards } from './aiFlashcards'
import { normalizeAiQuiz } from './aiQuiz'

export const AI_MESSAGES = {
  summaryFail: 'Failed to generate summary. Please try again.',
  quizFail: 'Failed to generate quiz. Please try again.',
  flashcardsFail: 'Failed to generate flashcards. Please try again.',
  emptyQuiz: 'No quiz questions were returned.',
  emptyFlashcards: 'No flashcards were returned.',
  emptySummary: 'No summary returned'
}

export async function handleAiSummary({
  request,
  setLoading,
  setSummary,
  setError,
  emptyMessage = AI_MESSAGES.emptySummary,
  failMessage = AI_MESSAGES.summaryFail
}) {
  setLoading(true)
  setError('')
  setSummary('')
  try {
    const res = await request()
    const summary = res?.data?.summary || res?.data?.data?.summary || emptyMessage
    setSummary(summary)
  } catch (err) {
    setError(failMessage)
  } finally {
    setLoading(false)
  }
}

export async function handleAiQuiz({
  request,
  setLoading,
  setQuiz,
  setError,
  normalize = normalizeAiQuiz,
  emptyMessage = AI_MESSAGES.emptyQuiz,
  failMessage = AI_MESSAGES.quizFail
}) {
  setLoading(true)
  setError('')
  setQuiz([])
  try {
    const res = await request()
    const rawQuiz = res?.data?.quiz || res?.data?.data?.quiz || []
    const normalized = normalize(rawQuiz)
    if (!normalized.length) {
      setError(emptyMessage)
      return
    }
    setQuiz(normalized)
  } catch (err) {
    setError(failMessage)
  } finally {
    setLoading(false)
  }
}

export async function handleAiFlashcards({
  request,
  setLoading,
  setFlashcards,
  setError,
  normalize = normalizeAiFlashcards,
  emptyMessage = AI_MESSAGES.emptyFlashcards,
  failMessage = AI_MESSAGES.flashcardsFail
}) {
  setLoading(true)
  setError('')
  setFlashcards([])
  try {
    const res = await request()
    const payload = res?.data?.flashcards || res?.data?.data?.flashcards || []
    const flashcards = normalize(payload)
    setFlashcards(flashcards)
    if (!flashcards.length) {
      setError(emptyMessage)
    }
  } catch (err) {
    setError(failMessage)
  } finally {
    setLoading(false)
  }
}
