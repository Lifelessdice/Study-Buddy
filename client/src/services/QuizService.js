import Api from '@/Api'

export default {
  getAll(params, config = {}) {
    return Api.get('/quizzes', {
      params,
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'If-None-Match': '',
        'If-Modified-Since': '0'
      },
      // accept all statuses; caller decides
      validateStatus: () => true,
      ...config
    })
  },
  get(id) {
    return Api.get(`/quizzes/${id}`)
  },
  create(payload) {
    return Api.post('/quizzes', payload)
  },
  update(id, payload) {
    return Api.patch(`/quizzes/${id}`, payload)
  },
  remove(id) {
    return Api.delete(`/quizzes/${id}`)
  },
  getAnalytics(quizId) {
    return Api.get(`/api/v1/quizzes/${quizId}/analytics`)
  }
}
