export function normalizeAiQuiz(rawQuiz) {
  if (!Array.isArray(rawQuiz)) return []

  return rawQuiz.map(item => {
    const question = item?.question || ''
    const options = Array.isArray(item?.options) ? item.options : []
    const normalizedAnswer = (item?.answer || '')
      .toString()
      .replace(/^[A-D]\.\s*/i, '')
      .trim()
      .toLowerCase()

    const correctIndex = options.findIndex(opt =>
      opt
        .toString()
        .toLowerCase()
        .includes(normalizedAnswer)
    )

    return {
      question,
      options,
      answer: item?.answer,
      correctIndex: correctIndex >= 0 ? correctIndex : null,
      selectedIndex: null
    }
  })
}
