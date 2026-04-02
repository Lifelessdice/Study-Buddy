export function createAiState() {
  return {
    summary: '',
    quiz: [],
    flashcards: [],
    loadingSummary: false,
    loadingQuiz: false,
    loadingFlashcards: false,
    error: '',
    activeTab: 'summary'
  }
}
