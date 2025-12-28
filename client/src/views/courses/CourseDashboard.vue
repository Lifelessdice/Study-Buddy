<template>
  <div class="container mt-4" v-if="course">
    <CourseHero
  :course="course"
  :is-teacher="isTeacher"
  :course-slug="courseSlugValue"
  :my-attendance="myAttendance"
  @delete-course="showDeleteCourseConfirm = true"
  @leave-course="showLeaveConfirm = true"
    />

    <CourseTabs
  :current-tab="currentTab"
  @change="setTab"
    />

    <div v-if="currentTab === 'overview'">
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p class="text-uppercase small text-muted mb-1">Overview</p>
            <h5 class="mb-0">Course Overview</h5>
          </div>
            <BaseButton
              v-if="isTeacher"
              variant="primary"
              outline
              size="sm"
              @click="toggleOverviewEdit"
            >
              <span class="btn-text btn-text-long">
                {{ overviewEditing ? 'Cancel Editing' : 'Edit Overview' }}
              </span>
              <span class="btn-text btn-text-short">
                {{ overviewEditing ? 'Cancel' : 'Edit' }}
              </span>
              <span class="btn-icon">
                {{ overviewEditing ? '❌' : '✏️' }}
              </span>
            </BaseButton>
          </div>
          <div v-if="overviewEditing && isTeacher">
            <textarea v-model="overviewDraft" class="form-control mb-2" rows="4"></textarea>
            <div class="d-flex gap-2">
              <BaseButton
                variant="primary"
                size="sm"
                :disabled="savingOverview"
                @click="saveOverview"
              >
                {{ savingOverview ? 'Saving...' : 'Save Overview' }}
              </BaseButton>
              <BaseButton
                variant="secondary"
                outline
                size="sm"
                type="button"
                @click="cancelOverviewEdit"
              >
                Discard
              </BaseButton>
            </div>
          </div>
          <div v-else>
            <p class="text-muted mb-0">
              {{ course.overview || 'No overview provided yet.' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'quizzes'" class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Quizzes</h5>
          <BaseButton
            v-if="isTeacher"
            :to="{ name: 'CreateQuiz', params: { courseSlug: courseSlugValue } }"
            variant="primary"
            outline
            size="sm"
          >
            + Create Quiz
          </BaseButton>
        </div>

        <div v-if="loadingQuizzes" class="text-muted">Loading quizzes...</div>
        <div v-else>
          <div v-if="!quizzes.length" class="alert alert-info">
            No quizzes have been created for this course yet.
            <span v-if="isTeacher">Click "Create Quiz" to add one.</span>
          </div>

          <div v-for="quiz in quizzes" :key="quiz._id" class="quiz-card mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">{{ quiz.title }}</h6>
                <div class="small text-muted">
                  Questions: {{ (quiz.questions && quiz.questions.length) || 0 }}
                </div>
                <div class="small text-muted">Created: {{ formatDate(quiz.createdAt) }}</div>
                <div v-if="!isTeacher && myParticipationByQuiz[quiz._id]" class="small text-success">
                  Score: {{ myParticipationByQuiz[quiz._id].score ?? 'N/A' }}%
                </div>
              </div>
              <div class="d-flex gap-2">
                <!-- Edit quiz (teacher) -->
                <BaseButton
                  v-if="isTeacher"
                  :to="{ name: 'EditQuiz', params: { quizSlug: quizSlug(quiz) } }"
                  variant="secondary"
                  outline
                  size="sm"
                >
                  <span class="btn-text btn-text-long">Edit</span>
                  <span class="btn-text btn-text-short">Edit</span>
                  <span class="btn-icon">✏️</span>
                </BaseButton>

                <!-- Take quiz (student) -->
                <BaseButton
                  v-else-if="!myParticipationByQuiz[quiz._id]"
                  :to="{ name: 'TakeQuiz', params: { quizSlug: quizSlug(quiz) } }"
                  variant="primary"
                  outline
                  size="sm"
                >
                  <span class="btn-text btn-text-long">Take Quiz</span>
                  <span class="btn-text btn-text-short">Take</span>
                  <span class="btn-icon">📝</span>
                </BaseButton>

                <!-- View attempts (teacher) -->
                <BaseButton
                  v-if="isTeacher"
                  variant="secondary"
                  outline
                  size="sm"
                  @click="viewAttempts(quiz)"
                >
                  <span class="btn-text btn-text-long">View Attempts</span>
                  <span class="btn-text btn-text-short">Attempts</span>
                  <span class="btn-icon">📊</span>
                </BaseButton>

                <!-- Delete quiz (teacher) -->
                <BaseButton
                  v-if="isTeacher"
                  variant="danger"
                  outline
                  size="sm"
                  @click="promptDeleteQuiz(quiz)"
                >
                  <span class="btn-text btn-text-long">Delete</span>
                  <span class="btn-text btn-text-short">Delete</span>
                  <span class="btn-icon">🗑️</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'students'" class="card mb-3" ref="studentsCard">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2 position-relative add-student-header">
          <h5 class="card-title mb-0">Enrolled Students</h5>
          <div v-if="isTeacher" class="add-student-actions d-flex align-items-center justify-content-end gap-2">
            <BaseButton
              variant="primary"
              outline
              size="sm"
              class="px-3"
              @click="openAddOverlay"
            >
              + Add Student
            </BaseButton>
          </div>
        </div>

        <div class="mb-3">
          <input
            v-model="studentSearch"
            type="text"
            class="form-control"
            placeholder="Search students..."
          >
        </div>

        <div v-if="filteredEnrolled.length === 0" class="alert alert-info">No students are enrolled yet.</div>

        <div v-else class="table-responsive">
          <table class="table table-sm align-middle table-responsive-stack">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(att, idx) in filteredEnrolled" :key="att._id">
                <td data-label="#">{{ idx + 1 }}</td>
                <td data-label="Name">{{ att.student?.name || 'Unknown' }}</td>
                <td data-label="Email">{{ att.student?.email }}</td>
                <td class="text-end" data-label="Actions">
                  <BaseButton
                    v-if="isTeacher"
                    variant="danger"
                    outline
                    size="sm"
                    @click="removeStudent(att._id)"
                  >
                    Remove
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-muted small">Total enrolled: {{ filteredEnrolled.length }} students</div>
        </div>
      </div>
    </div>

    <div v-if="showAddOverlay" class="overlay">
      <div class="overlay-card wide">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 class="mb-1">Add student to course</h5>
            <div class="small text-muted">Search by name or email and enroll instantly.</div>
          </div>
          <BaseButton variant="secondary" outline size="sm" @click="closeAddOverlay">Close</BaseButton>
        </div>

        <div class="d-flex flex-column gap-2">
          <div class="d-flex gap-2 flex-wrap">
            <input
              ref="addOverlayInput"
              v-model="addStudentSearch"
              type="text"
              class="form-control flex-grow-1"
              placeholder="Search by name or email"
              aria-label="Search students"
              @input="onSearchInput"
              @keyup.enter="onSearchStudents"
            />
          </div>

          <div v-if="studentsLoading" class="small text-muted">Loading students...</div>
          <div v-else-if="searchResults.length" class="list-group suggestion-list">
            <div
              v-for="stu in searchResults"
              :key="stu._id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div class="fw-semibold">{{ stu.name || 'Unnamed' }}</div>
                <div class="small text-muted">{{ stu.email }}</div>
              </div>
              <BaseButton
                variant="success"
                size="sm"
                :loading="addingStudentId === stu._id"
                :disabled="addingStudentId === stu._id || isAlreadyEnrolled(stu._id)"
                @click="addStudentFromResult(stu)"
              >
                {{ isAlreadyEnrolled(stu._id) ? 'Enrolled' : 'Add' }}
              </BaseButton>
            </div>
          </div>
          <div v-else class="small text-muted">
            <span v-if="addStudentSearch.trim().length === 0">Start typing to search students.</span>
            <span v-else>No matching students found.</span>
          </div>

          <div v-if="addStudentError" class="alert alert-warning py-2 mb-0">
            {{ addStudentError }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'notes'" class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Lectures</h5>
          <BaseButton
            v-if="isTeacher"
            variant="primary"
            outline
            size="sm"
            @click="showCreateNote = !showCreateNote"
          >
            {{ showCreateNote ? 'Cancel' : '+ Create Lecture' }}
          </BaseButton>
        </div>

        <div v-if="isTeacher && showCreateNote" class="mb-3">
          <input v-model="newNoteTopic" type="text" class="form-control mb-2" placeholder="Topic" />
          <textarea v-model="newNoteContent" class="form-control mb-2" rows="4" placeholder="Content"></textarea>
          <div class="d-flex gap-2">
            <BaseButton
              variant="primary"
              size="sm"
              :loading="savingNote"
              :disabled="savingNote"
              @click="createNote"
            >
              {{ savingNote ? 'Saving...' : 'Save Lecture' }}
            </BaseButton>
            <BaseButton variant="link" size="sm" @click="showCreateNote = false">Discard</BaseButton>
          </div>
        </div>

        <div v-if="loadingNotes" class="text-muted">Loading lectures...</div>
        <div v-else>
          <div v-if="!filteredNotes.length" class="alert alert-info">
            No lectures available for this course.
          </div>

          <div class="list-group">
            <div v-for="note in filteredNotes" :key="note._id">
              <div v-if="editingNoteId === note._id" class="list-group-item">
                <input v-model="editNoteTopic" type="text" class="form-control mb-2" placeholder="Topic" />
                <textarea v-model="editNoteContent" class="form-control mb-2" rows="4" placeholder="Content"></textarea>
                <div class="d-flex gap-2">
                  <BaseButton
                    variant="primary"
                    size="sm"
                    :loading="savingEditNote"
                    :disabled="savingEditNote"
                    @click="saveEditedNote(note._id)"
                  >
                    {{ savingEditNote ? 'Saving...' : 'Save' }}
                  </BaseButton>
                  <BaseButton
                    variant="secondary"
                    outline
                    size="sm"
                    @click="cancelEditNote"
                  >
                    Cancel
                  </BaseButton>
                </div>
              </div>
              <div
                v-else
                class="list-group-item list-group-item-action text-start w-100"
                role="button"
                tabindex="0"
                @click="toggleNote(note)"
                @keydown.enter.prevent="toggleNote(note)"
                @keydown.space.prevent="toggleNote(note)"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{{ note.topic }}</strong>
                    <div class="small text-muted">Created: {{ formatDate(note.createdAt) }}</div>
                    <div class="small text-muted">Text</div>
                  </div>
                  <div v-if="isTeacher" class="d-flex gap-2 ms-3 flex-wrap">
                    <BaseButton
                      size="sm"
                      variant="secondary"
                      outline
                      @click.stop="editNote(note)"
                    >
                      Edit
                    </BaseButton>
                    <BaseButton
                      size="sm"
                      variant="danger"
                      outline
                      @click.stop="promptDeleteNote(note)"
                    >
                      Delete
                    </BaseButton>
                  </div>
                </div>

                <div v-if="expandedNoteId === note._id" class="mt-3 p-3 border rounded bg-light-subtle">
                  <div class="lecture-text mb-3">
                    <p class="mb-0">{{ note.content }}</p>
                  </div>

                  <ul class="nav nav-tabs mb-3 responsive-tabs">
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: noteAi[note._id]?.activeTab === 'summary' }"
                        @click.stop.prevent="setNoteTab(note._id, 'summary')"
                      >
                        Summary
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: noteAi[note._id]?.activeTab === 'quiz' }"
                        @click.stop.prevent="setNoteTab(note._id, 'quiz')"
                      >
                        Quiz
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: noteAi[note._id]?.activeTab === 'flashcards' }"
                        @click.stop.prevent="setNoteTab(note._id, 'flashcards')"
                      >
                        Flashcards
                      </a>
                    </li>
                  </ul>

                  <div v-if="noteAi[note._id]?.error" class="alert alert-warning mb-3">
                    {{ noteAi[note._id].error }}
                  </div>

                  <div v-show="noteAi[note._id]?.activeTab === 'summary'">
                    <AiSummaryPanel
                      :summary="noteAi[note._id]?.summary || ''"
                      :loading="noteAi[note._id]?.loadingSummary"
                      button-class="mb-2"
                      loading-class="text-center my-2"
                      @generate="generateNoteSummary(note)"
                    />
                  </div>

                  <div v-show="noteAi[note._id]?.activeTab === 'quiz'">
                    <AiQuizPanel
                      :quiz="noteAi[note._id]?.quiz || []"
                      :loading="noteAi[note._id]?.loadingQuiz"
                      button-class="mb-2"
                      loading-class="text-center my-2"
                      @generate="generateNoteQuiz(note)"
                      @select="selectOption"
                    />
                  </div>

                  <div v-show="noteAi[note._id]?.activeTab === 'flashcards'">
                    <FlashcardsPanel
                      :flashcards="noteAi[note._id]?.flashcards || []"
                      :loading="noteAi[note._id]?.loadingFlashcards"
                      @generate="generateNoteFlashcards(note)"
                      @toggle="toggleNoteFlashcard(note, $event)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'notes'" class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Course Materials (PDF)</h5>
        </div>

        <div v-if="isTeacher" class="mb-3">
          <div v-if="uploadError" class="alert alert-danger mb-2">{{ uploadError }}</div>
          <div class="row g-2">
            <div class="col-md-6">
              <input
                v-model="newMaterial.title"
                type="text"
                class="form-control"
                placeholder="Title"
              />
            </div>
            <div class="col-md-6">
              <input
                ref="materialFile"
                type="file"
                class="form-control"
                accept="application/pdf"
                @change="onFileChange"
              />
            </div>
            <div class="col-12">
              <textarea
                v-model="newMaterial.description"
                class="form-control"
                rows="2"
                placeholder="Description (optional)"
              ></textarea>
            </div>
            <div class="col-12">
              <BaseButton
                variant="primary"
                size="sm"
                :loading="uploading"
                :disabled="uploading"
                @click="handleUpload"
              >
                {{ uploading ? 'Uploading...' : 'Upload PDF' }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-if="loadingMaterials" class="text-muted">Loading materials...</div>
        <div v-else>
          <div v-if="!materials.length" class="alert alert-info">
            No PDF materials uploaded yet.
          </div>
          <div v-else class="list-group">
            <div
              v-for="mat in materials"
              :key="mat._id"
              class="list-group-item list-group-item-action text-start w-100"
              role="button"
              tabindex="0"
              @click="toggleMaterial(mat)"
              @keydown.enter.prevent="toggleMaterial(mat)"
              @keydown.space.prevent="toggleMaterial(mat)"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{{ mat.title || mat.originalName }}</strong>
                  <div class="small text-muted">PDF • {{ prettySize(mat.size) }}</div>
                  <div v-if="mat.description" class="small text-muted">{{ mat.description }}</div>
                </div>
                <div class="d-flex align-items-center gap-2 ms-2">
                  <small class="text-muted">{{ formatDate(mat.createdAt) }}</small>
                  <BaseButton
                    v-if="isTeacher"
                    variant="danger"
                    outline
                    size="sm"
                    @click.stop="promptDeleteMaterial(mat)"
                  >
                    Delete
                  </BaseButton>
                </div>
              </div>

              <div v-if="expandedMaterialId === mat._id" class="mt-3 p-3 border rounded bg-light-subtle">
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <BaseButton
                    size="sm"
                    variant="primary"
                    outline
                    :href="materialUrl(mat.filePath)"
                    target="_blank"
                    rel="noopener"
                    :download="mat.originalName || (mat.title || 'material') + '.pdf'"
                    @click.stop
                  >
                    Open PDF
                  </BaseButton>
                </div>

                <ul class="nav nav-tabs mb-3 responsive-tabs">
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      :class="{ active: materialAi[mat._id]?.activeTab === 'summary' }"
                      @click.stop.prevent="setMaterialTab(mat._id, 'summary')"
                    >
                      Summary
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      :class="{ active: materialAi[mat._id]?.activeTab === 'quiz' }"
                      @click.stop.prevent="setMaterialTab(mat._id, 'quiz')"
                    >
                      Quiz
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      :class="{ active: materialAi[mat._id]?.activeTab === 'flashcards' }"
                      @click.stop.prevent="setMaterialTab(mat._id, 'flashcards')"
                    >
                      Flashcards
                    </a>
                  </li>
                </ul>

                <div v-if="materialAi[mat._id]?.error" class="alert alert-warning mb-3">
                  {{ materialAi[mat._id].error }}
                </div>

                <div v-show="materialAi[mat._id]?.activeTab === 'summary'">
                  <AiSummaryPanel
                    :summary="materialAi[mat._id]?.summary || ''"
                    :loading="materialAi[mat._id]?.loadingSummary"
                    button-class="mb-2"
                    loading-class="text-center my-2"
                    @generate="generateMaterialSummary(mat)"
                  />
                </div>

                <div v-show="materialAi[mat._id]?.activeTab === 'quiz'">
                  <AiQuizPanel
                    :quiz="materialAi[mat._id]?.quiz || []"
                    :loading="materialAi[mat._id]?.loadingQuiz"
                    button-class="mb-2"
                    loading-class="text-center my-2"
                    @generate="generateMaterialQuiz(mat)"
                    @select="selectOption"
                  />
                </div>

                <div v-show="materialAi[mat._id]?.activeTab === 'flashcards'">
                  <FlashcardsPanel
                    :flashcards="materialAi[mat._id]?.flashcards || []"
                    :loading="materialAi[mat._id]?.loadingFlashcards"
                    @generate="generateMaterialFlashcards(mat)"
                    @toggle="toggleMaterialFlashcard(mat, $event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>

    <div v-if="showDeleteMaterialConfirm" class="overlay">
      <div class="overlay-card">
        <h5 class="text-danger">Delete Material</h5>
        <p class="mb-3">Are you sure you want to delete "{{ materialToDelete?.title || materialToDelete?.originalName }}"?</p>
        <div class="d-flex justify-content-end gap-2">
          <BaseButton variant="secondary" outline @click="cancelDeleteMaterial">Cancel</BaseButton>
          <BaseButton variant="danger" @click="deleteMaterialConfirmed">Delete</BaseButton>
        </div>
      </div>
    </div>

    <div v-if="showDeleteNoteConfirm" class="overlay">
  <div class="overlay-card">
    <h5 class="text-danger">Delete Lecture</h5>
    <p class="mb-3">Are you sure you want to delete "{{ noteToDelete?.topic }}"?</p>
    <div class="d-flex justify-content-end gap-2">
          <BaseButton variant="secondary" outline @click="cancelDeleteNote">Cancel</BaseButton>
          <BaseButton variant="danger" @click="deleteNoteConfirmed">Delete</BaseButton>
        </div>
      </div>
    </div>

    <div v-if="showMessageModal" class="overlay">
      <div class="overlay-card">
        <h5 class="mb-2">{{ messageTitle || 'Notice' }}</h5>
        <p class="mb-3">{{ messageBody }}</p>
        <div class="d-flex justify-content-end">
          <BaseButton variant="primary" @click="showMessageModal = false">OK</BaseButton>
        </div>
      </div>
    </div>

    <div v-if="showDeleteCourseConfirm" class="overlay">
      <div class="overlay-card">
        <h5 class="text-danger">Delete Course</h5>
        <p class="mb-3">This will permanently delete "{{ course.name }}". Continue?</p>
        <div class="d-flex justify-content-end gap-2">
          <BaseButton variant="secondary" outline @click="cancelDeleteCourse">Cancel</BaseButton>
          <BaseButton variant="danger" @click="confirmDeleteCourse">Delete</BaseButton>
        </div>
      </div>
    </div>

    <div v-if="showRemoveStudentConfirm" class="overlay">
      <div class="overlay-card">
        <h5 class="text-danger">Remove Student</h5>
        <p class="mb-3">Remove this student from the course?</p>
        <div class="d-flex justify-content-end gap-2">
          <BaseButton variant="secondary" outline @click="cancelRemoveStudent">Cancel</BaseButton>
          <BaseButton variant="danger" @click="confirmRemoveStudent">Remove</BaseButton>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="overlay">
      <div class="overlay-card">
        <h5 class="text-danger">Delete Quiz</h5>
        <p class="mb-3">Are you sure you want to delete "{{ quizToDelete?.title }}"?</p>
        <div class="d-flex justify-content-end gap-2">
          <BaseButton variant="secondary" outline @click="cancelDeleteQuiz">Cancel</BaseButton>
          <BaseButton variant="danger" @click="deleteQuizConfirmed">Delete</BaseButton>
        </div>
      </div>
    </div>

    <div v-if="showAttemptsModal" class="overlay">
      <div class="overlay-card wide">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="mb-0">Quiz Attempts - {{ attemptsQuizTitle }}</h5>
          <BaseButton variant="secondary" outline size="sm" @click="closeAttempts">Close</BaseButton>
        </div>
        <div v-if="attemptsLoading" class="text-muted">Loading attempts...</div>
        <div v-else-if="!attempts.length" class="alert alert-info mb-0">No attempts yet.</div>
        <div v-else>
          <div class="d-flex flex-wrap gap-4 mb-3 small">
            <div>
              <div class="text-uppercase text-muted">Attempts</div>
              <strong>{{ attempts.length }}</strong>
            </div>
            <div v-if="hasAttemptScores">
              <div class="text-uppercase text-muted">Average</div>
              <strong>{{ attemptsAverageScore }}%</strong>
            </div>
            <div v-if="hasAttemptScores">
              <div class="text-uppercase text-muted">Best</div>
              <span>{{ attemptsMaxScore }}%</span>
            </div>
            <div v-if="hasAttemptScores">
              <div class="text-uppercase text-muted">Lowest</div>
              <span>{{ attemptsMinScore }}%</span>
            </div>
            <div v-else>
              <div class="text-muted">No scores recorded yet.</div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-sm align-middle mb-0 table-responsive-stack">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(att, idx) in attempts" :key="att._id">
                  <td data-label="#">{{ idx + 1 }}</td>
                  <td data-label="Name">{{ att.student?.name || 'Unknown' }}</td>
                  <td data-label="Email">{{ att.student?.email || 'Unknown' }}</td>
                  <td data-label="Score">{{ att.score ?? 'N/A' }}%</td>
                  <td data-label="Submitted">{{ formatDate(att.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLeaveConfirm" class="overlay">
      <div class="overlay-card">
        <h5 class="text-danger">Leave Course</h5>
        <p class="mb-3">Are you sure you want to leave "{{ course.name }}"?</p>
        <div class="d-flex justify-content-end gap-2">
          <BaseButton variant="secondary" outline @click="showLeaveConfirm = false">Cancel</BaseButton>
          <BaseButton variant="danger" @click="leaveCourse">Leave</BaseButton>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container mt-4">Loading...</div>
</template>

<script>
import CourseService from '@/services/CourseService'
import Api from '@/Api'
import QuizService from '@/services/QuizService'
import QuizParticipationService from '@/services/QuizParticipationService'
import CourseMaterialService from '@/services/CourseMaterialService'
import BaseButton from '@/components/BaseButton.vue'
import AiQuizPanel from '@/components/AiQuizPanel.vue'
import AiSummaryPanel from '@/components/AiSummaryPanel.vue'
import FlashcardsPanel from '@/components/FlashcardsPanel.vue'
import { handleAiFlashcards, handleAiQuiz, handleAiSummary } from '@/utils/aiHandlers'
import { toggleFlashcard } from '@/utils/aiFlashcards'
import { selectQuizOption } from '@/utils/aiQuiz'
import { createAiState } from '@/utils/aiState'
import { courseSlug, quizSlug } from '@/utils/slug'
import CourseHero from './components/CourseHero.vue'
import CourseTabs from './components/CourseTabs.vue'

export default {
  name: 'CourseDashboard',
  components: { AiQuizPanel, AiSummaryPanel, BaseButton, FlashcardsPanel, CourseHero, CourseTabs },
  props: ['courseSlug'],
  data() {
    return {
      course: null,
      addStudentSearch: '',
      searchResults: [],
      addingStudentId: '',
      studentsLoading: false,
      enrolled: [],
      showAddOverlay: false,
      searchDebounce: null,
      addStudentError: '',
      overviewDraft: '',
      overviewEditing: false,
      savingOverview: false,
      currentTab: 'overview',
      studentSearch: '',
      quizzes: [],
      loadingQuizzes: false,
      quizError: null,
      showDeleteConfirm: false,
      quizToDelete: null,
      showLeaveConfirm: false,
      showAttemptsModal: false,
      attemptsLoading: false,
      attempts: [],
      attemptsQuizTitle: '',
      myParticipations: {},
      showDeleteCourseConfirm: false,
      showRemoveStudentConfirm: false,
      studentToRemove: null,
      notes: [],
      loadingNotes: false,
      savingNote: false,
      showCreateNote: false,
      newNoteTopic: '',
      newNoteContent: '',
      newNoteCourse: '',
      editingNoteId: null,
      editNoteTopic: '',
      editNoteContent: '',
      savingEditNote: false,
      showDeleteNoteConfirm: false,
      noteToDelete: null,
      noteAi: {},
      expandedNoteId: null,
      // materials
      materials: [],
      loadingMaterials: false,
      materialAi: {},
      newMaterial: { title: '', description: '', file: null },
      uploading: false,
      uploadError: null,
      expandedMaterialId: null,
      showDeleteMaterialConfirm: false,
      materialToDelete: null,
      showMessageModal: false,
      messageTitle: '',
      messageBody: ''
    }
  },
  computed: {
    currentUser() {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    },
    courseTeacher() {
      const user = this.currentUser
      if (!user) return null
      return user.name || user.email || null
    },
    filteredEnrolled() {
      const term = this.studentSearch.trim().toLowerCase()
      if (!term) return this.enrolled
      return this.enrolled.filter(att => {
        const name = (att.student?.name || '').toLowerCase()
        const email = (att.student?.email || '').toLowerCase()
        return name.includes(term) || email.includes(term)
      })
    },
    isTeacher() {
      const user = this.currentUser
      return user?.role === 'teacher'
    },
    myAttendance() {
      if (!this.currentUser || !Array.isArray(this.enrolled)) return null
      return this.enrolled.find(att => att.student?._id === this.currentUser._id) || null
    },
    myParticipationByQuiz() {
      return this.myParticipations || {}
    },
    courseSlugValue() {
      if (!this.course) return ''
      return courseSlug(this.course)
    },
    filteredNotes() {
      if (!Array.isArray(this.notes) || !this.course?._id) return []
      return this.notes.filter(note => note.course?._id === this.course._id)
    },
    attemptsWithScore() {
      // normalize scores (numbers + numeric strings)
      return this.attempts
        .map(a => {
          const v = a.score
          if (v === undefined || v === null) return null
          const num = Number(v)
          return Number.isNaN(num) ? null : num
        })
        .filter(v => v !== null)
    },
    hasAttemptScores() {
      return this.attemptsWithScore.length > 0
    },
    attemptsAverageScore() {
      if (!this.hasAttemptScores) return null
      const sum = this.attemptsWithScore.reduce((acc, s) => acc + s, 0)
      return Math.round((sum / this.attemptsWithScore.length) * 10) / 10 // 1 decimal
    },
    attemptsMinScore() {
      if (!this.hasAttemptScores) return null
      return Math.min(...this.attemptsWithScore)
    },
    attemptsMaxScore() {
      if (!this.hasAttemptScores) return null
      return Math.max(...this.attemptsWithScore)
    },
    totalQuizQuestions() {
      if (!Array.isArray(this.quizzes)) return 0
      return this.quizzes.reduce((sum, q) => sum + ((q.questions && q.questions.length) || 0), 0)
    },
    hasQuizQuestions() {
      return this.totalQuizQuestions > 0
    },
    avgQuestionsPerQuiz() {
      if (!this.quizzes.length) return 0
      return Math.round((this.totalQuizQuestions / this.quizzes.length) * 10) / 10
    },
    myCompletedQuizzes() {
      if (!this.myParticipations || typeof this.myParticipations !== 'object') return 0
      return Object.keys(this.myParticipations).length
    },
    myScores() {
      const list = Object.values(this.myParticipations || {})
      return list
        .map(p => {
          const n = Number(p.score)
          return Number.isNaN(n) ? null : n
        })
        .filter(n => n !== null)
    },
    hasMyScores() {
      return this.myScores.length > 0
    },
    avgMyScore() {
      if (!this.hasMyScores) return 0
      const sum = this.myScores.reduce((a, b) => a + b, 0)
      return Math.round((sum / this.myScores.length) * 10) / 10
    },
    bestMyScore() {
      if (!this.hasMyScores) return 0
      return Math.max(...this.myScores)
    },
    completionRate() {
      if (!this.quizzes.length) return 0
      const pct = (this.myCompletedQuizzes / this.quizzes.length) * 100
      return Math.round(pct * 10) / 10
    }

  },
  watch: {
    '$route.query.tab'(val) {
      if (val && this.currentTab !== val) {
        this.setTab(val)
      }
    }
  },
  methods: {
    quizSlug(quiz) {
      return quizSlug(quiz)
    },
    async resolveCourseBySlug(slug) {
      if (!slug) return null
      const user = this.currentUser
      let courses = []

      if (user?.role === 'teacher') {
        try {
          const res = await CourseService.getMine()
          courses = res.data.data || res.data || []
        } catch (err) {
          courses = []
        }
      }

      if (!courses.length && user?.role === 'student') {
        try {
          const res = await CourseService.getStudentEnrollments()
          const enrollments = res.data.data || res.data || []
          courses = enrollments.map(att => att.course).filter(Boolean)
        } catch (err) {
          courses = []
        }
      }

      if (!courses.length) {
        try {
          const res = await CourseService.getAll({ limit: 1000 })
          courses = res.data.data || res.data || []
        } catch (err) {
          courses = []
        }
      }

      return courses.find(c => courseSlug(c) === slug) || null
    },
    setTab(tab) {
      this.currentTab = tab
      if (tab !== 'students') {
        this.showAddOverlay = false
      }
      if (tab === 'students') {
        this.$nextTick(() => {
          if (this.$refs.studentsCard) {
            this.$refs.studentsCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
      if (tab === 'quizzes') {
        this.fetchQuizzes()
      }
      if (tab === 'notes') {
        this.fetchNotes()
        this.fetchMaterials(this.course?._id)
      }
    },
    notify(title, message) {
      this.messageTitle = title || ''
      this.messageBody = message || ''
      this.showMessageModal = true
    },
    openAddOverlay() {
      this.showAddOverlay = true
      this.resetAddStudent()
      this.$nextTick(() => {
        const input = this.$refs.addOverlayInput
        if (input) input.focus()
      })
    },
    closeAddOverlay() {
      this.showAddOverlay = false
    },
    onSearchInput() {
      if (this.searchDebounce) {
        clearTimeout(this.searchDebounce)
      }
      this.searchDebounce = setTimeout(() => {
        this.onSearchStudents()
      }, 250)
    },
    handleEsc(event) {
      if (event.key === 'Escape' && this.showAddOverlay) {
        event.preventDefault()
        this.closeAddOverlay()
      }
    },
    resetAddStudent() {
      if (this.searchDebounce) {
        clearTimeout(this.searchDebounce)
        this.searchDebounce = null
      }
      this.addStudentSearch = ''
      this.searchResults = []
      this.addStudentError = ''
      this.addingStudentId = ''
    },

    async fetchCourse() {
      const slug = this.$route.params.courseSlug
      const resolved = await this.resolveCourseBySlug(slug)
      if (!resolved || !resolved._id) {
        this.notify('Error', 'Course not found')
        return
      }

      try {
        const res = await CourseService.getById(resolved._id)
        this.course = res.data.data || res.data || resolved
      } catch (err) {
        this.course = resolved
      }

      this.overviewDraft = this.course.overview || ''
      await this.fetchEnrolled()
      await this.fetchMaterials(this.course?._id)
      if (this.currentTab === 'quizzes') {
        await this.fetchQuizzes()
      }
    },
    async fetchEnrolled() {
      try {
        if (!this.course?._id) return
        const res = await CourseService.getStudents(this.course._id)
        this.enrolled = res.data.data || res.data
      } catch (err) {
        console.error(err)
      }
    },
    async fetchQuizzes() {
      if (!this.course || !this.course._id) {
        return
      }
      this.loadingQuizzes = true
      this.quizError = null
      try {
        const res = await QuizService.getAll({ course: this.course._id, t: Date.now() })
        const payload = res?.data
        const list = (payload && (payload.data || payload)) || []
        if (res.status === 200 || res.status === 201) {
          this.quizzes = Array.isArray(list) ? list : []
        } else if (res.status === 304) {
          // keep existing
        } else {
          this.quizError = payload?.message || 'Failed to load quizzes.'
          this.quizzes = []
        }
        if (!this.isTeacher) {
          await this.fetchMyParticipations()
        }
      } catch (err) {
        console.error('fetchQuizzes error', err)
        this.quizError = err?.response?.data?.message || 'Failed to load quizzes.'
        this.quizzes = []
      } finally {
        this.loadingQuizzes = false
      }
    },
    async fetchMyParticipations() {
      if (!this.currentUser) return
      try {
        const res = await QuizParticipationService.getAll({
          student: this.currentUser._id
        })
        const data = res.data.data || res.data || []
        const map = {}
        data.forEach(p => {
          if (p.quiz) {
            const quizId = typeof p.quiz === 'object' && p.quiz._id ? p.quiz._id : p.quiz
            map[quizId] = p
          }
        })
        this.myParticipations = map
      } catch (err) {
        console.error(err)
      }
    },
    formatDate(d) {
      if (!d) return '-'
      return new Date(d).toLocaleString()
    },
    selectOption(question, index) {
      selectQuizOption(question, index)
    },
    async removeCourse() {
      this.showDeleteCourseConfirm = true
    },
    async confirmDeleteCourse() {
      try {
        await CourseService.remove(this.course._id)
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        this.notify('Error', 'Failed to delete course')
      } finally {
        this.showDeleteCourseConfirm = false
      }
    },
    cancelDeleteCourse() {
      this.showDeleteCourseConfirm = false
    },
    async onSearchStudents() {
      if (this.studentsLoading) return
      const term = this.addStudentSearch.trim()
      if (!term) {
        this.searchResults = []
        return
      }
      this.studentsLoading = true
      this.addStudentError = ''
      try {
        const params = { role: 'student', q: term }
        const res = await Api.get('/users', { params })
        const list = res.data.data || res.data || []
        const enrolledIds = new Set(
          (this.enrolled || []).map(att => att?.student?._id || att.student).filter(Boolean)
        )
        this.searchResults = (Array.isArray(list) ? list : []).filter(s => !enrolledIds.has(s._id))
      } catch (err) {
        console.error(err)
        this.addStudentError = 'Could not load students.'
      } finally {
        this.studentsLoading = false
      }
    },
    isAlreadyEnrolled(studentId) {
      return (this.enrolled || []).some(att => (att.student?._id || att.student) === studentId)
    },
    async addStudentFromResult(student) {
      if (!student || !student._id) return
      if (this.isAlreadyEnrolled(student._id)) {
        this.addStudentError = 'Student is already enrolled.'
        return
      }
      this.addingStudentId = student._id
      this.addStudentError = ''
      try {
        await CourseService.addStudent(this.course._id, student._id)
        await this.fetchEnrolled()
        this.closeAddOverlay()
      } catch (err) {
        console.error(err)
        this.addStudentError = err?.response?.data?.message || 'Failed to add student.'
      } finally {
        this.addingStudentId = ''
      }
    },
    async saveOverview() {
      if (!this.isTeacher) return
      this.savingOverview = true
      try {
        await CourseService.update(this.course._id, { overview: this.overviewDraft })
        this.course.overview = this.overviewDraft
        this.overviewEditing = false
        this.notify('Success', 'Overview saved')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to save overview')
      } finally {
        this.savingOverview = false
      }
    },
    toggleOverviewEdit() {
      this.overviewEditing = !this.overviewEditing
      if (this.overviewEditing) {
        this.overviewDraft = this.course.overview || ''
      }
    },
    cancelOverviewEdit() {
      this.overviewEditing = false
      this.overviewDraft = this.course.overview || ''
    },
    async removeStudent(attendanceId) {
      this.studentToRemove = attendanceId
      this.showRemoveStudentConfirm = true
    },
    async confirmRemoveStudent() {
      if (!this.studentToRemove) return
      try {
        await CourseService.removeStudent(this.course._id, this.studentToRemove)
        await this.fetchEnrolled()
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to remove student')
      } finally {
        this.studentToRemove = null
        this.showRemoveStudentConfirm = false
      }
    },
    cancelRemoveStudent() {
      this.studentToRemove = null
      this.showRemoveStudentConfirm = false
    },
    async leaveCourse() {
      if (!this.myAttendance) return
      try {
        await CourseService.removeStudent(this.course._id, this.myAttendance._id)
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to leave course')
      } finally {
        this.showLeaveConfirm = false
      }
    },
    promptDeleteQuiz(quiz) {
      this.quizToDelete = quiz
      this.showDeleteConfirm = true
    },
    async deleteQuizConfirmed() {
      if (!this.quizToDelete) return
      try {
        await QuizService.remove(this.quizToDelete._id)
        this.quizToDelete = null
        this.showDeleteConfirm = false
        await this.fetchQuizzes()
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to delete quiz')
      }
    },
    cancelDeleteQuiz() {
      this.quizToDelete = null
      this.showDeleteConfirm = false
    },
    async viewAttempts(quiz) {
      this.attemptsQuizTitle = quiz.title
      this.showAttemptsModal = true
      this.attemptsLoading = true
      this.attempts = []
      try {
        const res = await QuizParticipationService.getAll({ quiz: quiz._id })
        this.attempts = res.data.data || res.data || []
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to load attempts')
      } finally {
        this.attemptsLoading = false
      }
    },
    closeAttempts() {
      this.showAttemptsModal = false
      this.attempts = []
      this.attemptsQuizTitle = ''
    },
    async fetchNotes() {
      if (!this.course || !this.course._id) return

      this.loadingNotes = true
      try {
        const res = await Api.get('/notes', {
          params: { course: this.course._id } // fetch notes only for this course
        })
        this.notes = res.data.data || res.data
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to load lectures')
      } finally {
        this.loadingNotes = false
      }
    },
    async fetchMaterials(courseId) {
      if (!courseId) return
      this.loadingMaterials = true
      this.uploadError = null
      try {
        const res = await CourseMaterialService.list(courseId)
        this.materials = res.data.data || res.data || []
      } catch (err) {
        console.error(err)
      } finally {
        this.loadingMaterials = false
      }
    },
    toggleNote(note) {
      if (!note || !note._id) return
      const isSame = this.expandedNoteId === note._id
      this.expandedNoteId = isSame ? null : note._id
      if (!isSame) {
        this.ensureNoteState(note._id)
      }
    },
    ensureNoteState(id) {
      if (!this.noteAi[id]) {
        this.noteAi[id] = createAiState()
      }
      return this.noteAi[id]
    },
    setNoteTab(id, tab) {
      const state = this.ensureNoteState(id)
      state.activeTab = tab
    },
    toggleNoteFlashcard(note, index) {
      const state = this.ensureNoteState(note._id)
      toggleFlashcard(state.flashcards, index)
    },
    async generateNoteSummary(note) {
      const state = this.ensureNoteState(note._id)
      await handleAiSummary({
        request: () => Api.post(`/notes/${note._id}/summaries`),
        setLoading: (value) => { state.loadingSummary = value },
        setSummary: (value) => { state.summary = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateNoteQuiz(note) {
      const state = this.ensureNoteState(note._id)
      await handleAiQuiz({
        request: () => Api.post(`/notes/${note._id}/aiquizzes`),
        setLoading: (value) => { state.loadingQuiz = value },
        setQuiz: (value) => { state.quiz = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateNoteFlashcards(note) {
      const state = this.ensureNoteState(note._id)
      await handleAiFlashcards({
        request: () => Api.post(`/notes/${note._id}/flashcards`),
        setLoading: (value) => { state.loadingFlashcards = value },
        setFlashcards: (value) => { state.flashcards = value },
        setError: (value) => { state.error = value }
      })
    },
    toggleMaterial(mat) {
      if (!mat || !mat._id) return
      const isSame = this.expandedMaterialId === mat._id
      this.expandedMaterialId = isSame ? null : mat._id
      if (!isSame) {
        this.ensureMaterialState(mat._id)
      }
    },
    ensureMaterialState(id) {
      if (!this.materialAi[id]) {
        this.materialAi[id] = createAiState()
      }
      return this.materialAi[id]
    },
    setMaterialTab(id, tab) {
      const state = this.ensureMaterialState(id)
      state.activeTab = tab
    },
    toggleMaterialFlashcard(mat, index) {
      const state = this.ensureMaterialState(mat._id)
      toggleFlashcard(state.flashcards, index)
    },

    async generateMaterialSummary(mat) {
      const state = this.ensureMaterialState(mat._id)
      await handleAiSummary({
        request: () => CourseMaterialService.summarize(this.course._id, mat._id),
        setLoading: (value) => { state.loadingSummary = value },
        setSummary: (value) => { state.summary = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateMaterialQuiz(mat) {
      const state = this.ensureMaterialState(mat._id)
      await handleAiQuiz({
        request: () => CourseMaterialService.quiz(this.course._id, mat._id),
        setLoading: (value) => { state.loadingQuiz = value },
        setQuiz: (value) => { state.quiz = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateMaterialFlashcards(mat) {
      const state = this.ensureMaterialState(mat._id)
      await handleAiFlashcards({
        request: () => CourseMaterialService.flashcards(this.course._id, mat._id),
        setLoading: (value) => { state.loadingFlashcards = value },
        setFlashcards: (value) => { state.flashcards = value },
        setError: (value) => { state.error = value }
      })
    },
    onFileChange(event) {
      const file = event?.target?.files?.[0]
      if (!file) return
      if (file.type !== 'application/pdf') {
        this.uploadError = 'Only PDF files are allowed'
        this.newMaterial.file = null
        event.target.value = ''
        return
      }
      this.uploadError = null
      this.newMaterial.file = file
      if (!this.newMaterial.title) {
        this.newMaterial.title = file.name.replace(/\.pdf$/i, '')
      }
    },
    async handleUpload() {
      if (!this.newMaterial.file) {
        this.uploadError = 'Please choose a PDF file'
        return
      }
      this.uploading = true
      this.uploadError = null
      try {
        const res = await CourseMaterialService.upload(this.course._id, {
          file: this.newMaterial.file,
          title: this.newMaterial.title,
          description: this.newMaterial.description
        })
        const material = res.data.data || res.data
        if (material) {
          this.materials.unshift(material)
        }
        this.newMaterial = { title: '', description: '', file: null }
        if (this.$refs.materialFile) {
          this.$refs.materialFile.value = ''
        }
      } catch (err) {
        this.uploadError = err?.response?.data?.message || 'Failed to upload material'
      } finally {
        this.uploading = false
      }
    },
    promptDeleteMaterial(material) {
      if (!material) return
      this.materialToDelete = material
      this.showDeleteMaterialConfirm = true
    },
    cancelDeleteMaterial() {
      this.materialToDelete = null
      this.showDeleteMaterialConfirm = false
    },
    async deleteMaterialConfirmed() {
      const material = this.materialToDelete
      if (!material || !material._id) return
      try {
        await CourseMaterialService.remove(this.course._id, material._id)
        this.materials = this.materials.filter(m => m._id !== material._id)
      } catch (err) {
        console.error(err)
        if (typeof this.notify === 'function') {
          this.notify('Error', 'Failed to delete material')
        }
      } finally {
        this.cancelDeleteMaterial()
      }
    },
    prettySize(bytes) {
      if (bytes === undefined || bytes === null) return ''
      if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return `${(bytes / 1024).toFixed(1)} KB`
    },
    materialUrl(pathStr) {
      if (!pathStr) return ''
      const base = Api.defaults?.baseURL || ''
      const uploadBase = base.replace(/\/api\/v1$/, '') || base
      return `${uploadBase}${pathStr}`
    },

    async createNote() {
      if (!this.newNoteTopic.trim() || !this.newNoteContent.trim()) {
        this.notify('Missing info', 'Please fill all fields')
        return
      }

      this.savingNote = true
      try {
        const payload = {
          topic: this.newNoteTopic,
          content: this.newNoteContent,
          course: this.course._id // use current course ID automatically
        }
        const res = await Api.post('/notes', payload)

        // Push to notes with course object for filtering
        const newNote = {
          ...res.data.data,
          course: { _id: this.course._id }
        }
        this.notes.push(newNote)

        // Reset input fields
        this.newNoteTopic = ''
        this.newNoteContent = ''
        this.showCreateNote = false
        this.notify('Success', 'Lecture created')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to create note')
      } finally {
        this.savingNote = false
      }
    },

    editNote(note) {
      this.editingNoteId = note._id
      this.editNoteTopic = note.topic
      this.editNoteContent = note.content
    },

    cancelEditNote() {
      this.editingNoteId = null
      this.editNoteTopic = ''
      this.editNoteContent = ''
    },

    async saveEditedNote(id) {
      if (!this.editNoteTopic.trim() || !this.editNoteContent.trim()) {
        this.notify('Missing info', 'Please fill all fields')
        return
      }
      this.savingEditNote = true
      try {
        const payload = { topic: this.editNoteTopic, content: this.editNoteContent }
        const res = await Api.patch(`/notes/${id}`, payload)

        // Keep the course object so filtering still works
        const updatedNote = {
          ...res.data.data,
          course: this.notes.find(n => n._id === id).course
        }

        const idx = this.notes.findIndex(n => n._id === id)
        if (idx !== -1) this.notes[idx] = updatedNote

        this.cancelEditNote()
        this.notify('Success', 'Lecture updated')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to update note')
      } finally {
        this.savingEditNote = false
      }
    },

    async deleteNote(id) {
      try {
        await Api.delete(`/notes/${id}`)
        this.notes = this.notes.filter(n => n._id !== id)
        this.notify('Success', 'Lecture deleted')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to delete note')
      }
    },
    // When user clicks Delete
    promptDeleteNote(note) {
      this.noteToDelete = note
      this.showDeleteNoteConfirm = true
    },

    // Cancel deletion
    cancelDeleteNote() {
      this.noteToDelete = null
      this.showDeleteNoteConfirm = false
    },

    // Confirm deletion
    async deleteNoteConfirmed() {
      if (!this.noteToDelete) return
      try {
        await Api.delete(`/notes/${this.noteToDelete._id}`)
        this.notes = this.notes.filter(n => n._id !== this.noteToDelete._id)
        this.noteToDelete = null
        this.showDeleteNoteConfirm = false
        this.notify('Success', 'Lecture deleted')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to delete note')
      }
    }
  },

  async mounted() {
    document.addEventListener('keydown', this.handleEsc)
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab
    }
    await this.fetchCourse()
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEsc)
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #f8fafc, #eef2f7);
  border: 1px solid #e5e7eb;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
}
.card-body {
  position: relative;
  overflow: visible;
}
.nav-tabs-custom .tab {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  font-weight: 600;
}
.nav-tabs-custom .tab.active {
  background: #2563eb;
  color: #fff;
}
.nav-tabs-custom .tab.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.btn-hover {
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
}
.suggestion-list {
  max-height: 200px;
  overflow-y: auto;
  z-index: 2000;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-start;    /* start near top for short screens */
  justify-content: center;
  padding: 1rem;
  z-index: 3000;
  overflow-y: auto;           /* scroll if content is too tall */
}

.overlay-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 640px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  max-height: 100%;
  overflow-y: auto;           /* card can scroll internally */
}

.overlay-card.wide {
  max-width: 720px;
}

@media (min-height: 700px) {
  .overlay {
    align-items: center;      /* center when we have enough height */
    padding: 2rem;
  }
}
.lecture-text {
  text-align: left;
  white-space: pre-line;
  line-height: 1.5;
}

.add-student-header {
  position: relative;
  overflow: visible;
}

.add-student-actions {
  position: relative;
  overflow: visible;
}

.add-student-search input {
  min-width: 220px;
}

.btn-text-short,
.btn-icon {
  display: none;
}

@media (max-width: 576px) {
  .btn-text-long {
    display: none;
  }

  .btn-text-short {
    display: inline;
  }
}

@media (max-width: 360px) {
  .btn-text-short {
    display: none;
  }

  .btn-icon {
    display: inline;
  }
}
</style>
