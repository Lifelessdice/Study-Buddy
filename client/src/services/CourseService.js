// client/src/services/CourseService.js
import Api from '@/Api'

export default {
  // Courses
  getAll() {
    return Api.get('/courses')
  },

  getStudentEnrollments() {
    return Api.get('/courses/attendances/mine')
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

  // Course attendances (students)
  addStudent(courseId, studentId) {
    return Api.post(`/courses/${courseId}/attendances`, { student: studentId })
  },
  getStudents(courseId) {
    return Api.get(`/courses/${courseId}/attendances`)
  },
  removeStudent(courseId, attendanceId) {
    return Api.delete(`/courses/${courseId}/attendances/${attendanceId}`)
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
