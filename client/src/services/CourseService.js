// client/src/services/CourseService.js
import Api from '@/Api'

export default {
  // Courses
  getAll() {
    return Api.get('/courses')
  },

  getMine() {
    return Api.get('/courses/mine')
  },

  getById(id) {
    return Api.get(`/courses/${id}`)
  },

  create(payload) {
    return Api.post('/courses', payload)
  },

  update(id, payload) {
    return Api.patch(`/courses/${id}`, payload)
  },

  remove(id) {
    return Api.delete(`/courses/${id}`)
  },

  // Teaching assignment: assign teacher to course
  assignTeacher(courseId, teacherId) {
    return Api.post(`/courses/${courseId}/teachingAssignments`, { teacher: teacherId })
  },

  // List assignments for a course (optional)
  getAssignments(courseId) {
    return Api.get(`/courses/${courseId}/teachingAssignments`)
  }
}
