'use client'

import { useState, useEffect, useRef, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import {
  Button,
  Table,
  Modal,
  Alert,
  Input,
} from '@heroui/react'
import {
  createStudent,
  updateStudent,
  deleteStudent,
  type StudentProfile,
} from './actions'
import { StudentFormModal } from './StudentFormModal'

type SortKey = 'nis' | 'full_name' | 'class_name' | 'student_wa'

interface StudentsClientProps {
  initialStudents: StudentProfile[]
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const router = useRouter()
  const [isPending] = useTransition()
  const [students, setStudents] = useState<StudentProfile[]>(initialStudents)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null)
  const [detailStudent, setDetailStudent] = useState<StudentProfile | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<StudentProfile | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('nis')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setStudents(initialStudents)
  }, [initialStudents])

  const sortedStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = q
      ? students.filter((s) => {
          const nis = (s.nis ?? '').toLowerCase()
          const name = (s.full_name ?? '').toLowerCase()
          const kelas = (s.class_name ?? '').toLowerCase()
          const wa = (s.student_wa ?? '').toLowerCase()
          const ayah = (s.father_name ?? '').toLowerCase()
          const ibu = (s.mother_name ?? '').toLowerCase()
          return (
            nis.includes(q) ||
            name.includes(q) ||
            kelas.includes(q) ||
            wa.includes(q) ||
            ayah.includes(q) ||
            ibu.includes(q)
          )
        })
      : [...students]
    list.sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      let cmp = 0
      if (aStr < bStr) cmp = -1
      else if (aStr > bStr) cmp = 1
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [students, sortKey, sortDir, searchQuery])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortHeader = ({
    columnKey,
    label,
    className = '',
  }: {
    columnKey: SortKey
    label: string
    className?: string
  }) => (
    <button
      type="button"
      onClick={() => handleSort(columnKey)}
      className={`inline-flex items-center gap-1 font-bold text-zinc-900 dark:text-white hover:opacity-80 ${className}`}
    >
      {label}
      {sortKey === columnKey ? (
        sortDir === 'asc' ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )
      ) : (
        <svg className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0l4 4m-4-4l-4 4m14 4V4m0 0l4 4m-4-4l-4 4" />
        </svg>
      )}
    </button>
  )

  useEffect(() => {
    if (tableRef.current && students.length > 0) {
      const ctx = gsap.context(() => {
        const rows = tableRef.current?.querySelectorAll('tr')
        if (rows?.length) {
          gsap.from(rows, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power3.out',
            delay: 0.2,
          })
        }
      })
      return () => ctx.revert()
    }
  }, [students])

  const openAdd = () => {
    setEditingStudent(null)
    setFormError(null)
    setIsFormOpen(true)
  }

  const openEdit = (s: StudentProfile) => {
    setEditingStudent(s)
    setFormError(null)
    setIsFormOpen(true)
  }

  const openDetail = (s: StudentProfile) => {
    setDetailStudent(s)
    setIsDetailOpen(true)
  }

  const handleFormSubmit = async (formData: FormData) => {
    setFormError(null)
    if (editingStudent) {
      return updateStudent(editingStudent.id, formData)
    }
    return createStudent(formData)
  }

  const onFormSuccess = () => {
    router.refresh()
  }

  const openDelete = (s: StudentProfile) => {
    setDeletingStudent(s)
    setDeleteError(null)
    setIsDeleteOpen(true)
  }

  const closeDelete = () => {
    setIsDeleteOpen(false)
    setDeletingStudent(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!deletingStudent) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      const result = await deleteStudent(deletingStudent.id)
      if (result.success) {
        closeDelete()
        router.refresh()
      } else {
        setDeleteError(result.error ?? 'Gagal menghapus siswa')
      }
    } catch {
      setDeleteError('Terjadi kesalahan tidak terduga')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Kelola Data Siswa
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tambah, edit, dan hapus data siswa (tanpa login)
          </p>
        </div>
        <Button
          onPress={openAdd}
          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Tambah Siswa
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            placeholder="Cari NIS, nama, kelas, WA, atau nama orang tua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="secondary"
            className="w-full pl-10"
          />
        </div>
        {searchQuery.trim() && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {sortedStudents.length} dari {students.length} siswa
          </span>
        )}
      </div>

      {/* Table */}
      <div
        ref={tableRef}
        className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      >
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="Tabel data siswa" className="min-w-[700px]">
              <Table.Header className="bg-zinc-100 dark:bg-zinc-800">
                <Table.Column isRowHeader>
                  <SortHeader columnKey="nis" label="NIS" />
                </Table.Column>
                <Table.Column>
                  <SortHeader columnKey="full_name" label="Nama Lengkap" />
                </Table.Column>
                <Table.Column>
                  <SortHeader columnKey="class_name" label="Kelas" />
                </Table.Column>
                <Table.Column>
                  <SortHeader columnKey="student_wa" label="No. WA Anak" />
                </Table.Column>
                <Table.Column className="text-end font-bold text-zinc-900 dark:text-white">
                  Aksi
                </Table.Column>
              </Table.Header>
              <Table.Body
                items={sortedStudents}
                renderEmptyState={() => (
                  <div className="py-12 text-center">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {searchQuery.trim()
                        ? 'Tidak ada siswa yang cocok dengan pencarian. Coba kata kunci lain.'
                        : 'Belum ada data siswa. Klik "Tambah Siswa" untuk menambahkan.'}
                    </p>
                  </div>
                )}
              >
                {(student) => (
                  <Table.Row
                    key={student.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Table.Cell className="font-medium text-zinc-900 dark:text-white">
                      {student.nis ?? '-'}
                    </Table.Cell>
                    <Table.Cell className="text-zinc-800 dark:text-zinc-200">
                      {student.full_name}
                    </Table.Cell>
                    <Table.Cell className="text-zinc-700 dark:text-zinc-300">
                      {student.class_name ?? '-'}
                    </Table.Cell>
                    <Table.Cell className="text-zinc-700 dark:text-zinc-300">
                      {student.student_wa ?? '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => openDetail(student)}
                          className="text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          aria-label="Lihat detail"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => openEdit(student)}
                          className="text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          aria-label="Edit"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => openDelete(student)}
                          className="text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          aria-label="Hapus"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {/* Form Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={editingStudent}
        error={formError}
        onClearError={() => setFormError(null)}
        onSubmit={async (fd) => {
          const result = await handleFormSubmit(fd)
          if (!result.success && result.error) setFormError(result.error)
          return result
        }}
        onSuccess={onFormSuccess}
        isPending={isPending}
      />

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="max-w-3xl">
              <Modal.CloseTrigger />
              <Modal.Header className="pb-4">
                <Modal.Heading className="text-xl font-bold text-zinc-900 dark:text-white">
                  Detail Data Siswa
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="px-6 py-4">
                {detailStudent ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          NIS
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.nis ?? '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Nama Lengkap
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.full_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Kelas
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.class_name ?? '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Tempat, Tanggal Lahir
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.birth_place ?? '-'}
                          {detailStudent.birth_date
                            ? `, ${detailStudent.birth_date}`
                            : ''}
                        </p>
                      </div>
                    </div>

                    <hr className="border-zinc-200 dark:border-zinc-700" />

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Alamat
                      </p>
                      <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {detailStudent.address ?? '-'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          No. WA Siswa
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.student_wa ?? '-'}
                        </p>
                      </div>
                    </div>

                    <hr className="border-zinc-200 dark:border-zinc-700" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Nama Ayah
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.father_name ?? '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          No. WA Ayah
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.father_wa ?? '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Nama Ibu
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.mother_name ?? '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          No. WA Ibu
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {detailStudent.mother_wa ?? '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Data siswa tidak ditemukan.
                  </p>
                )}
              </Modal.Body>
              <Modal.Footer className="flex-row-reverse gap-3 px-6 pb-6 pt-4">
                <Button
                  variant="secondary"
                  onPress={() => setIsDetailOpen(false)}
                  className="border border-zinc-300 dark:border-zinc-700"
                >
                  Tutup
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header className="pb-4">
                <Modal.Heading className="text-xl font-bold text-zinc-900 dark:text-white">
                  Hapus Data Siswa
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="px-6 py-4">
                {deleteError && (
                  <Alert
                    status="danger"
                    className="mb-4 border border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20"
                  >
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description className="text-sm text-red-800 dark:text-red-300">
                        {deleteError}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  Apakah Anda yakin ingin menghapus siswa{' '}
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {deletingStudent?.full_name}
                  </span>
                  {deletingStudent?.nis && (
                    <> (NIS: {deletingStudent.nis})</>
                  )}
                  ? Semua catatan BK terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
                </p>
              </Modal.Body>
              <Modal.Footer className="flex-row-reverse gap-3 px-6 pb-6 pt-4">
                <Button
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  onPress={handleDelete}
                  isPending={deleteLoading}
                  isDisabled={deleteLoading}
                >
                  Hapus
                </Button>
                <Button
                  variant="secondary"
                  onPress={closeDelete}
                  isDisabled={deleteLoading}
                  className="border border-zinc-300 dark:border-zinc-700"
                >
                  Batal
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}
