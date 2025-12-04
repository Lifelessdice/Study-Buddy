import Api from '@/Api'

export default {
  list(courseId) {
    return Api.get(`/courses/${courseId}/materials`)
  },

  upload(courseId, { file, title, description }) {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    if (description) formData.append('description', description)

    return Api.post(`/courses/${courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  remove(courseId, materialId) {
    return Api.delete(`/courses/${courseId}/materials/${materialId}`)
  }
}
