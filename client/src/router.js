// client/src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Signup from './views/Signup.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import CoursesPage from './views/courses/CoursesPage.vue'
import CreateCourse from './views/courses/CreateCourse.vue'
import EditCourse from './views/courses/EditCourse.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },

  // Courses (teacher)
  { path: '/courses', name: 'Courses', component: CoursesPage },
  { 
    path: '/courses/create',
    name: 'CreateCourse',
    component: CreateCourse,
    meta: { requiresTeacher: true }
  },
  {
    path: '/courses/:id/edit',
    name: 'EditCourse',
    component: EditCourse,
    props: true,
    meta: { requiresTeacher: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Simple client-side guard: checks localStorage user role === 'teacher'
router.beforeEach((to, from, next) => {
  const userJson = localStorage.getItem('user')
  const user = userJson ? JSON.parse(userJson) : null

  if (to.meta && to.meta.requiresTeacher) {
    if (!user || user.role !== 'teacher') {
      // redirect to login (or dashboard) if not a teacher
      return next({ name: 'Login' })
    }
  }
  return next()
})

export default router
