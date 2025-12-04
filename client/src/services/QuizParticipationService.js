import Api from '@/Api'

export default {
  getAll(params) {
    return Api.get('/quizparticipations', { params })
  },
  getStudentAnalytics(studentId) {
    return api.get(`/api/v1/quizparticipations/student/${studentId}/analytics`)
  }
}
