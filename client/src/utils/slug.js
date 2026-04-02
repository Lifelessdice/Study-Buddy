/*
  Slug utilities

  This file provides helper functions to generate URL-safe,
  human-readable identifiers ("slugs") for different entities
  such as courses, notes, and quizzes.

  Slugs are derived from titles/names combined with timestamps
  to ensure readability while minimizing collisions.
*/

// Converts a string into a URL-safe slug.
// Example: "Intro to AI!" -> "intro-to-ai"
export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Pads a number to two digits (e.g. 3 -> "03").
// Used when constructing sortable date-based keys.
function pad2(num) {
  return String(num).padStart(2, '0')
}

// Converts an ISO date string into a compact timestamp key.
// Format: YYYYMMDDHHmmss
// Used to make slugs unique and chronologically sortable.
function dateKey(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return [
    d.getFullYear(),
    pad2(d.getMonth() + 1),
    pad2(d.getDate()),
    pad2(d.getHours()),
    pad2(d.getMinutes()),
    pad2(d.getSeconds())
  ].join('')
}

export function courseSlug(course) {
  const name = slugify(course?.name)
  const code = slugify(course?.code)
  if (name && code) return `${name}-${code}`
  return name || code || 'course'
}

export function noteSlug(note) {
  const base = slugify(note?.topic)
  const key = dateKey(note?.createdAt)
  if (base && key) return `${base}-${key}`
  return base || key || 'note'
}

export function quizSlug(quiz) {
  const base = slugify(quiz?.title)
  const key = dateKey(quiz?.createdAt)
  if (base && key) return `${base}-${key}`
  return base || key || 'quiz'
}
