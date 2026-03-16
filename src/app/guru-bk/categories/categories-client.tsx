'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import {
  Button,
  Table,
  Modal,
  Input,
  Select,
  ListBox,
  TextArea,
  Label,
  Alert,
} from '@heroui/react'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type PointCategory,
  type CategoryFormData,
} from './actions'

interface CategoriesClientProps {
  initialCategories: PointCategory[]
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<PointCategory[]>(initialCategories)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<PointCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<PointCategory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    point_value: 0,
    type: 'violation',
  })

  const tableRef = useRef<HTMLDivElement>(null)

  // Sync categories when initialCategories changes (after router.refresh())
  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  // GSAP animation for table entrance
  useEffect(() => {
    if (tableRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(tableRef.current?.querySelectorAll('tr') || [], {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.2,
        })
      })
      return () => ctx.revert()
    }
  }, [categories])

  const handleOpenFormModal = (category?: PointCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
        point_value: Math.abs(category.point_value),
        type: category.type,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        point_value: 0,
        type: 'violation',
      })
    }
    setError(null)
    setIsFormModalOpen(true)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setEditingCategory(null)
    setError(null)
    setFormData({
      name: '',
      description: '',
      point_value: 0,
      type: 'violation',
    })
  }

  const handleOpenDeleteModal = (category: PointCategory) => {
    setDeletingCategory(category)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, formData)
      } else {
        result = await createCategory(formData)
      }

      if (result.success) {
        handleCloseFormModal()
        // Refresh the page data
        router.refresh()
      } else {
        setError(result.error || 'Terjadi kesalahan')
      }
    } catch (err) {
      setError('Terjadi kesalahan tidak terduga')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    setLoading(true)
    setError(null)

    try {
      const result = await deleteCategory(deletingCategory.id)

      if (result.success) {
        handleCloseDeleteModal()
        // Refresh the page data
        router.refresh()
      } else {
        setError(result.error || 'Gagal menghapus kategori')
      }
    } catch (err) {
      setError('Terjadi kesalahan tidak terduga')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-format point_value based on type
  const handleTypeChange = (type: 'violation' | 'achievement') => {
    setFormData((prev) => {
      let pointValue = prev.point_value
      if (type === 'violation' && pointValue > 0) {
        pointValue = -Math.abs(pointValue)
      } else if (type === 'achievement' && pointValue < 0) {
        pointValue = Math.abs(pointValue)
      }
      return { ...prev, type, point_value: pointValue }
    })
  }

  const handlePointValueChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setFormData((prev) => {
      let pointValue = numValue
      if (prev.type === 'violation' && pointValue > 0) {
        pointValue = -Math.abs(pointValue)
      } else if (prev.type === 'achievement' && pointValue < 0) {
        pointValue = Math.abs(pointValue)
      }
      return { ...prev, point_value: pointValue }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Kelola Kategori Poin
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Kelola jenis pelanggaran dan prestasi siswa
          </p>
        </div>
        <Button
          onPress={() => handleOpenFormModal()}
          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Tambah Kategori
        </Button>
      </div>

      {/* Table */}
      <div ref={tableRef} className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="Categories table" className="min-w-[800px]">
              <Table.Header className="bg-zinc-100 dark:bg-zinc-800">
                <Table.Column isRowHeader className="font-bold text-zinc-900 dark:text-white">
                  Nama
                </Table.Column>
                <Table.Column className="font-bold text-zinc-900 dark:text-white">
                  Deskripsi
                </Table.Column>
                <Table.Column className="font-bold text-zinc-900 dark:text-white">
                  Tipe
                </Table.Column>
                <Table.Column className="font-bold text-zinc-900 dark:text-white">
                  Poin
                </Table.Column>
                <Table.Column className="text-end font-bold text-zinc-900 dark:text-white">
                  Aksi
                </Table.Column>
              </Table.Header>
              <Table.Body
                items={categories}
                renderEmptyState={() => (
                  <div className="py-12 text-center">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Belum ada kategori. Klik &quot;Tambah Kategori&quot; untuk menambahkan.
                    </p>
                  </div>
                )}
              >
                {(category) => (
                  <Table.Row key={category.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <Table.Cell className="font-semibold text-zinc-900 dark:text-white">
                      {category.name}
                    </Table.Cell>
                    <Table.Cell className="text-zinc-800 dark:text-zinc-200">
                      {category.description || '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
                          category.type === 'achievement'
                            ? '!bg-emerald-600 !text-white dark:!bg-emerald-500'
                            : '!bg-red-600 !text-white dark:!bg-red-500'
                        }`}
                      >
                        {category.type === 'achievement' ? 'Prestasi' : 'Pelanggaran'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`font-extrabold text-xl tracking-tight ${
                          category.point_value >= 0
                            ? '!text-emerald-700 dark:!text-emerald-400'
                            : '!text-red-700 dark:!text-red-400'
                        }`}
                      >
                        {category.point_value > 0 ? '+' : ''}
                        {category.point_value}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => handleOpenFormModal(category)}
                          className="text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
                          onPress={() => handleOpenDeleteModal(category)}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
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
      <Modal isOpen={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-lg">
              <Modal.CloseTrigger />
              <Modal.Header className="pb-4">
                <Modal.Heading className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                </Modal.Heading>
              </Modal.Header>
              <form onSubmit={handleSubmit}>
                <Modal.Body className="space-y-5 px-6 py-4">
                  {error && (
                    <Alert
                      status="danger"
                      className="animate-in fade-in slide-in-from-top-2 border border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20"
                    >
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Description className="text-sm text-red-800 dark:text-red-300">
                          {error}
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Nama Kategori *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Terlambat Masuk Sekolah"
                      required
                      variant="secondary"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Tipe *
                    </Label>
                    <Select
                      id="type"
                      selectedKey={formData.type}
                      onSelectionChange={(key) => {
                        if (key) {
                          const selected = key as 'violation' | 'achievement'
                          handleTypeChange(selected)
                        }
                      }}
                      variant="secondary"
                      isRequired
                      className="w-full"
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item
                            id="violation"
                            textValue="Pelanggaran"
                            className="font-medium text-zinc-900 dark:text-white data-[hovered]:bg-zinc-100 dark:data-[hovered]:bg-zinc-800 data-[selected]:bg-zinc-200 dark:data-[selected]:bg-zinc-700"
                          >
                            Pelanggaran
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item
                            id="achievement"
                            textValue="Prestasi"
                            className="font-medium text-zinc-900 dark:text-white data-[hovered]:bg-zinc-100 dark:data-[hovered]:bg-zinc-800 data-[selected]:bg-zinc-200 dark:data-[selected]:bg-zinc-700"
                          >
                            Prestasi
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="point_value" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Nilai Poin *
                    </Label>
                    <Input
                      id="point_value"
                      name="point_value"
                      type="number"
                      value={Math.abs(formData.point_value).toString()}
                      onChange={(e) => handlePointValueChange(e.target.value)}
                      placeholder="0"
                      required
                      variant="secondary"
                      className="w-full"
                    />
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {formData.type === 'violation'
                        ? 'Nilai akan otomatis menjadi negatif'
                        : 'Nilai akan otomatis menjadi positif'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Deskripsi <span className="font-normal text-zinc-500">(Opsional)</span>
                    </Label>
                    <TextArea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Masukkan deskripsi kategori..."
                      rows={4}
                      variant="secondary"
                      className="w-full resize-none"
                    />
                  </div>
                </Modal.Body>
                <Modal.Footer className="flex-row-reverse gap-3 px-6 pb-6 pt-4">
                  <Button
                    type="submit"
                    className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    isPending={loading}
                    isDisabled={loading}
                  >
                    {editingCategory ? 'Simpan Perubahan' : 'Simpan'}
                  </Button>
                  <Button
                    variant="secondary"
                    onPress={handleCloseFormModal}
                    isDisabled={loading}
                    className="border border-zinc-300 dark:border-zinc-700"
                  >
                    Batal
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header className="pb-4">
                <Modal.Heading className="text-xl font-bold text-zinc-900 dark:text-white">
                  Hapus Kategori
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="px-6 py-4">
                {error && (
                  <Alert
                    status="danger"
                    className="mb-4 border border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20"
                  >
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description className="text-sm text-red-800 dark:text-red-300">
                        {error}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  Apakah Anda yakin ingin menghapus kategori{' '}
                  <span className="font-bold text-zinc-900 dark:text-white">
                    &quot;{deletingCategory?.name}&quot;
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>
              </Modal.Body>
              <Modal.Footer className="flex-row-reverse gap-3 px-6 pb-6 pt-4">
                <Button
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  onPress={handleDelete}
                  isPending={loading}
                  isDisabled={loading}
                >
                  Hapus
                </Button>
                <Button
                  variant="secondary"
                  onPress={handleCloseDeleteModal}
                  isDisabled={loading}
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

