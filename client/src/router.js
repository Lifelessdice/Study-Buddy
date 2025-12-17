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
import CourseDashboard from './views/courses/CourseDashboard.vue'
import DeleteAllCourses from './views/courses/DeleteAllCourses.vue'
import CreateQuiz from './views/quizzes/CreateQuiz.vue'
import EditQuiz from './views/quizzes/EditQuiz.vue'
import TakeQuiz from './views/quizzes/TakeQuiz.vue'
import StudentResults from './views/quizzes/StudentResults.vue'
import CourseSignupPage from './views/courses/CourseSignupPage.vue'
import NotesList from './views/NotesList.vue'
import NoteDetail from './views/NoteDetail.vue'
import Profile from './views/Profile.vue'

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
    path: '/courses/:courseSlug',
    name: 'CourseDashboard',
    component: CourseDashboard,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/all',
    name: 'AllCourses',
    component: AllCoursesPage,
    meta: { requiresAuth: true }
  },

  {
    path: '/courses/signup',
    name: 'CourseSignup',
    component: CourseSignupPage,
    meta: { requiresAuth: true }
  },

  {
    path: '/courses/delete-all',
    name: 'DeleteAllCourses',
    component: DeleteAllCourses,
    meta: { requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/courses/create',
    name: 'CreateCourse',
    component: CreateCourse,
    meta: { requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/courses/:courseSlug/edit',
    name: 'EditCourse',
    component: EditCourse,
    props: true,
    meta: { requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/courses/:courseSlug/quizzes/create',
    name: 'CreateQuiz',
    component: CreateQuiz,
    props: true,
    meta: { requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/quizzes/:quizSlug/edit',
    name: 'EditQuiz',
    component: EditQuiz,
    props: true,
    meta: { requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/quizzes/:quizSlug/take',
    name: 'TakeQuiz',
    component: TakeQuiz,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/results',
    name: 'StudentResults',
    component: StudentResults,
    meta: { requiresAuth: true }
  },
  {
    path: '/notes',
    name: 'NotesList',
    component: NotesList,
    meta: { requiresAuth: true }
  },
  {
    path: '/notes/:noteSlug',
    name: 'NoteDetail',
    component: NoteDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
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
