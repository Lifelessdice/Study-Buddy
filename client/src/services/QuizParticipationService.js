import Api from '@/Api'

export default {
  getAll(params) {
    return Api.get('/quizparticipations', { params })
  }
}
