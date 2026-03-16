'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import {
  Button,
  Table,
  Surface,
  Modal,
  Select,
  ListBox,
  Label,
  TextField,
  TextArea,
} from '@heroui/react'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'
import { addStudentRecord, getPointCategories, type StudentWithScore, type DashboardStats, type PointCategory } from './actions'

interface AdminDashboardClientProps {
  initialStudents: StudentWithScore[]
  initialStats: DashboardStats
}

export function AdminDashboardClient({
  initialStudents,
  initialStats,
}: AdminDashboardClientProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<PointCategory[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentWithScore | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const statsRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // Load categories on mount
  useEffect(() => {
    getPointCategories().then(setCategories)
  }, [])

  // Use useMemo to derive state from props instead of setState in effect
  const students = useMemo(() => initialStudents, [initialStudents])
  const stats = useMemo(() => initialStats, [initialStats])

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate stats cards with stagger
      gsap.from(statsRef.current?.children || [], {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2,
      })

      // Animate table
      gsap.from(tableRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      })
    })

    return () => ctx.revert()
  }, [])

  async function handleAddRecord(formData: FormData) {
    if (!selectedStudent) return

    setIsSubmitting(true)
    setError(null)

    const categoryId = formData.get('categoryId') as string
    const notes = formData.get('notes') as string

    if (!categoryId) {
      setError('Pilih kategori terlebih dahulu')
      setIsSubmitting(false)
      return
    }

    if (!selectedStudent) return
    
    const studentId = selectedStudent.student_id
    const result = await addStudentRecord(
      studentId,
      categoryId,
      notes || null
    )

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      // Refresh the page data
      router.refresh()
      
      setIsModalOpen(false)
      setSelectedStudent(null)
      setIsSubmitting(false)
      setError(null)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.2}
          duration={4}
          repeatDelay={2}
        />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Stats Cards */}
        <div ref={statsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Surface variant="default" className="rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Siswa
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </Surface>

          <Surface variant="default" className="rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Catatan
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalRecords}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </Surface>

          <Surface variant="default" className="rounded-2xl p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rata-rata Catatan/Siswa
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalStudents > 0
                    ? (stats.totalRecords / stats.totalStudents).toFixed(1)
                    : '0'}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </Surface>
        </div>

        {/* Student Table */}
        <div ref={tableRef}>
          <Surface variant="default" className="rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Daftar Siswa
              </h2>
            </div>

            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Student list" className="min-w-[800px]">
                  <Table.Header>
                    <Table.Column isRowHeader>Nama</Table.Column>
                    <Table.Column>NIS</Table.Column>
                    <Table.Column>Total Skor</Table.Column>
                    <Table.Column>Jumlah Catatan</Table.Column>
                    <Table.Column className="text-end">Aksi</Table.Column>
                  </Table.Header>
                  <Table.Body
                    renderEmptyState={() => (
                      <Table.Row>
                        <Table.Cell colSpan={5} className="text-center text-gray-500">
                          Tidak ada data siswa
                        </Table.Cell>
                      </Table.Row>
                    )}
                  >
                    {students.map((student: StudentWithScore) => (
                      <Table.Row key={student.student_id}>
                        <Table.Cell className="font-medium text-gray-900 dark:text-white">
                          {student.full_name}
                        </Table.Cell>
                        <Table.Cell className="text-gray-600 dark:text-gray-400">
                          {student.nis || '-'}
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            className={`font-semibold ${
                              student.total_score >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {student.total_score > 0 ? '+' : ''}
                            {student.total_score}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-gray-600 dark:text-gray-400">
                          {student.total_records}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                              onPress={() => {
                                setSelectedStudent({
                                  ...student,
                                  id: student.student_id,
                                } as StudentWithScore & { id: string })
                                setIsModalOpen(true)
                              }}
                            >
                              Tambah Catatan
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Surface>
        </div>
      </div>

      {/* Add Record Modal */}
      <Modal.Backdrop isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-gray-900 dark:text-white">
                Tambah Catatan untuk {selectedStudent?.full_name}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form action={handleAddRecord} className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Kategori *
                  </Label>
                  <Select
                    name="categoryId"
                    isRequired
                    placeholder="Pilih kategori"
                    variant="secondary"
                    className="w-full"
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {categories.map((category) => (
                          <ListBox.Item
                            key={category.id}
                            id={category.id}
                            textValue={category.name}
                            className="text-zinc-900 dark:text-white data-[hovered]:bg-zinc-100 dark:data-[hovered]:bg-zinc-800 data-[selected]:bg-zinc-200 dark:data-[selected]:bg-zinc-700"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{category.name}</div>
                                {category.description && (
                                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                    {category.description}
                                  </div>
                                )}
                              </div>
                            <span
                              className={`ml-2 font-semibold ${
                                category.point_value >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {category.point_value > 0 ? '+' : ''}
                              {category.point_value}
                            </span>
                          </div>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Catatan <span className="font-normal text-zinc-500 dark:text-zinc-400">(Opsional)</span>
                  </Label>
                  <TextArea
                    id="notes"
                    name="notes"
                    placeholder="Masukkan detail kejadian..."
                    rows={4}
                    variant="secondary"
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onPress={() => {
                      setIsModalOpen(false)
                      setSelectedStudent(null)
                      setError(null)
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    isDisabled={isSubmitting}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  )
}

