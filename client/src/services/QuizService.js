import Api from '@/Api'

export default {
  getAll(params) {
    return Api.get('/quizzes', { params })
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
  }
}
