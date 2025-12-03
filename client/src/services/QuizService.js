import Api from '@/Api'

export default {
  getAll(params) {
    return Api.get('/quizzes', { params })
  },
  create(payload) {
    return Api.post('/quizzes', payload)
  },
  remove(id) {
    return Api.delete(`/quizzes/${id}`)
  }
}
