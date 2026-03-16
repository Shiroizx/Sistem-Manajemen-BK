'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  Input,
  TextArea,
  Label,
  Alert,
} from '@heroui/react'
import type { StudentProfile } from './actions'

export interface StudentFormModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  student: StudentProfile | null
  error: string | null
  onClearError: () => void
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  onSuccess: () => void
  isPending: boolean
}

const emptyForm = {
  nis: '',
  full_name: '',
  class_name: '',
  birth_place: '',
  birth_date: '',
  address: '',
  student_wa: '',
  father_name: '',
  father_wa: '',
  mother_name: '',
  mother_wa: '',
}

export function StudentFormModal({
  isOpen,
  onOpenChange,
  student,
  error,
  onClearError,
  onSubmit,
  onSuccess,
  isPending,
}: StudentFormModalProps) {
  const [formData, setFormData] = useState(emptyForm)

  // Prefill form when editing; reset when closing
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (student) {
      setFormData({
        nis: student.nis ?? '',
        full_name: student.full_name ?? '',
        class_name: student.class_name ?? '',
        birth_place: student.birth_place ?? '',
        birth_date: student.birth_date ?? '',
        address: student.address ?? '',
        student_wa: student.student_wa ?? '',
        father_name: student.father_name ?? '',
        father_wa: student.father_wa ?? '',
        mother_name: student.mother_name ?? '',
        mother_wa: student.mother_wa ?? '',
      })
    } else {
      setFormData(emptyForm)
    }
  }, [student, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onClearError()
    const form = e.currentTarget
    const fd = new FormData(form)
    const result = await onSubmit(fd)
    if (result.success) {
      onOpenChange(false)
      onSuccess()
    }
  }

  const isEdit = !!student

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-3xl">
            <Modal.CloseTrigger />
            <Modal.Header className="pb-4">
              <Modal.Heading className="text-xl font-bold text-zinc-900 dark:text-white">
                {isEdit ? 'Edit Data Siswa' : 'Tambah Siswa'}
              </Modal.Heading>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
              <Modal.Body className="px-6 py-4">
                {error && (
                  <Alert
                    status="danger"
                    className="mb-4 animate-in fade-in slide-in-from-top-2 border border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20"
                  >
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description className="text-sm text-red-800 dark:text-red-300">
                        {error}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}

                {/* Section 1: Data Pribadi */}
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                  Data Pribadi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nis" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      NIS *
                    </Label>
                    <Input
                      id="nis"
                      name="nis"
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      placeholder="Nomor Induk Siswa"
                      required
                      variant="secondary"
                      className="w-full"
                      readOnly={isEdit}
                      aria-readonly={isEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Nama Lengkap *
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Nama lengkap siswa"
                      required
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class_name" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Kelas
                    </Label>
                    <Input
                      id="class_name"
                      name="class_name"
                      value={formData.class_name}
                      onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                      placeholder="Contoh: X IPA 1"
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1" />
                  <div className="space-y-2">
                    <Label htmlFor="birth_place" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Tempat Lahir
                    </Label>
                    <Input
                      id="birth_place"
                      name="birth_place"
                      value={formData.birth_place}
                      onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                      placeholder="Kota/kabupaten"
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Tanggal Lahir
                    </Label>
                    <Input
                      id="birth_date"
                      name="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                </div>

                <hr className="my-4 border-zinc-200 dark:border-zinc-700" />

                {/* Section 2: Kontak & Alamat */}
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                  Kontak & Alamat
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Alamat Lengkap
                    </Label>
                    <TextArea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Alamat lengkap tempat tinggal"
                      rows={2}
                      variant="secondary"
                      className="w-full resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student_wa" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      No. WA Siswa
                    </Label>
                    <Input
                      id="student_wa"
                      name="student_wa"
                      type="tel"
                      value={formData.student_wa}
                      onChange={(e) => setFormData({ ...formData, student_wa: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2" />
                </div>

                <hr className="my-4 border-zinc-200 dark:border-zinc-700" />

                {/* Section 3: Data Orang Tua */}
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                  Data Orang Tua
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="father_name" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Nama Ayah
                    </Label>
                    <Input
                      id="father_name"
                      name="father_name"
                      value={formData.father_name}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      placeholder="Nama lengkap ayah"
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="father_wa" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      No. WA Ayah
                    </Label>
                    <Input
                      id="father_wa"
                      name="father_wa"
                      type="tel"
                      value={formData.father_wa}
                      onChange={(e) => setFormData({ ...formData, father_wa: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_name" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Nama Ibu
                    </Label>
                    <Input
                      id="mother_name"
                      name="mother_name"
                      value={formData.mother_name}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      placeholder="Nama lengkap ibu"
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_wa" className="text-sm font-semibold text-zinc-900 dark:text-white">
                      No. WA Ibu
                    </Label>
                    <Input
                      id="mother_wa"
                      name="mother_wa"
                      type="tel"
                      value={formData.mother_wa}
                      onChange={(e) => setFormData({ ...formData, mother_wa: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      variant="secondary"
                      className="w-full"
                    />
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="flex-row-reverse gap-3 px-6 pb-6 pt-4">
                <Button
                  type="submit"
                  className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  isPending={isPending}
                  isDisabled={isPending}
                >
                  {isEdit ? 'Simpan Perubahan' : 'Simpan'}
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => onOpenChange(false)}
                  isDisabled={isPending}
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
  )
}
