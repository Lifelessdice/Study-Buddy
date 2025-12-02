// client/src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Signup from './views/Signup.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import CoursesPage from './views/courses/CoursesPage.vue'
import CreateCourse from './views/courses/CreateCourse.vue'
import EditCourse from './views/courses/EditCourse.vue'
import AllCoursesPage from './views/courses/AllCoursesPage.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  // Courses (teacher)
  {
    path: '/courses',
    name: 'Courses',
    component: CoursesPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/all',
    name: 'AllCourses',
    component: AllCoursesPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/create',
    name: 'CreateCourse',
    component: CreateCourse,
    meta: { requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/courses/:id/edit',
    name: 'EditCourse',
    component: EditCourse,
    props: true,
    meta: { requiresAuth: true, requiresTeacher: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Client-side guard: checks for auth token and optional teacher role
router.beforeEach((to, from, next) => {
  const userJson = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  const user = userJson ? JSON.parse(userJson) : null

  // Require auth for any route with meta.requiresAuth or requiresTeacher
  if (to.meta && (to.meta.requiresAuth || to.meta.requiresTeacher)) {
    if (!token || !user) {
      return next({ name: 'Login' })
    }
  }

  if (to.meta && to.meta.requiresTeacher) {
    if (!user || user.role !== 'teacher') {
      // redirect to login (or dashboard) if not a teacher
      return next({ name: 'Login' })
    }
  }
  return next()
})

export default router
