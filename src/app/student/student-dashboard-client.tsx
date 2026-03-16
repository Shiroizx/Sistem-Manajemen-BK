'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Surface, Table, TextField, Button, Alert, Label, Input } from '@heroui/react'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'
import { getStudentDataByNIS } from './student-actions'
import type { StudentData } from './student-actions'

export function StudentDashboardClient() {
  const [nis, setNis] = useState('')
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const scoreRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // GSAP animations
  useEffect(() => {
    if (studentData) {
      const ctx = gsap.context(() => {
        // Animate score card
        if (scoreRef.current) {
          gsap.from(scoreRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.6,
            delay: 0.2,
            ease: 'power3.out',
          })
        }

        // Animate timeline
        if (timelineRef.current) {
          gsap.from(timelineRef.current, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.4,
            ease: 'power3.out',
          })
        }
      })

      return () => ctx.revert()
    }
  }, [studentData])

  // Animate form on mount
  useEffect(() => {
    if (formRef.current && !hasSearched) {
      gsap.from(formRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out',
      })
    }
  }, [hasSearched])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setHasSearched(true)

    try {
      const data = await getStudentDataByNIS(nis.trim())
      if (data) {
        setStudentData(data)
      } else {
        setError('NIS tidak ditemukan. Pastikan NIS yang Anda masukkan benar.')
        setStudentData(null)
      }
    } catch {
      setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi.')
      setStudentData(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Portal Siswa & Orang Tua
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Masukkan NIS siswa untuk melihat data catatan dan skor
          </p>
        </div>

        {/* NIS Input Form */}
        {!studentData && (
          <div ref={formRef}>
            <Surface variant="default" className="rounded-2xl p-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <TextField
                  name="nis"
                  isRequired
                  className="w-full [&_label]:text-gray-700 [&_label]:dark:text-gray-300 [&_label[data-required=true]]:after:content-['*'] [&_label[data-required=true]]:after:text-gray-500 [&_label[data-required=true]]:after:ml-1 [&_input]:text-lg"
                >
                  <Label>Nomor Induk Siswa (NIS)</Label>
                  <Input
                    placeholder="Masukkan NIS siswa"
                    value={nis}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNis(e.target.value)}
                    autoComplete="off"
                  />
                </TextField>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
                isDisabled={loading}
              >
                {loading ? 'Mencari...' : 'Cari Data Siswa'}
              </Button>
              </form>

              {error && (
                <Alert
                  status="danger"
                  className="mt-4 border border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20"
                >
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description className="text-sm text-red-800 dark:text-red-300">
                      {error}
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
            </Surface>
          </div>
        )}

        {/* Student Data Display */}
        {studentData && (
          <>
            {/* Back Button */}
            <Button
              variant="ghost"
              onPress={() => {
                setStudentData(null)
                setNis('')
                setError(null)
                setHasSearched(false)
              }}
              className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ← Kembali ke Pencarian
            </Button>

            {/* Welcome Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Data Siswa: {studentData.profile.full_name}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                NIS: {studentData.profile.nis || '-'}
              </p>
            </div>

            {/* Total Score Card */}
            <div ref={scoreRef}>
              <Surface variant="default" className="rounded-2xl p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Skor
                    </p>
                    <p
                      className={`mt-2 text-5xl font-bold ${
                        studentData.totalScore >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {studentData.totalScore > 0 ? '+' : ''}
                      {studentData.totalScore}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {studentData.records.length} catatan tersimpan
                    </p>
                  </div>
                  <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                    <svg
                      className="h-8 w-8 text-gray-600 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                </div>
              </Surface>
            </div>

            {/* Records Timeline */}
            <div ref={timelineRef}>
              <Surface variant="default" className="rounded-2xl p-6">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Riwayat Catatan
                </h3>

                {studentData.records.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Belum ada catatan untuk ditampilkan
                    </p>
                  </div>
                ) : (
                  <Table>
                    <Table.ScrollContainer>
                      <Table.Content aria-label="Student records" className="min-w-[800px]">
                        <Table.Header>
                          <Table.Column>Tanggal</Table.Column>
                          <Table.Column>Kategori</Table.Column>
                          <Table.Column>Tipe</Table.Column>
                          <Table.Column>Poin</Table.Column>
                          <Table.Column>Catatan</Table.Column>
                        </Table.Header>
                        <Table.Body>
                          {studentData.records.map((record) => (
                            <Table.Row key={record.id}>
                              <Table.Cell className="text-gray-600 dark:text-gray-400">
                                {formatDate(record.created_at)}
                              </Table.Cell>
                              <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                {record.category_name}
                              </Table.Cell>
                              <Table.Cell>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    record.category_type === 'achievement'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}
                                >
                                  {record.category_type === 'achievement'
                                    ? 'Prestasi'
                                    : 'Pelanggaran'}
                                </span>
                              </Table.Cell>
                              <Table.Cell>
                                <span
                                  className={`font-semibold ${
                                    record.point_value >= 0
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  {record.point_value > 0 ? '+' : ''}
                                  {record.point_value}
                                </span>
                              </Table.Cell>
                              <Table.Cell className="text-gray-600 dark:text-gray-400">
                                {record.notes || '-'}
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Content>
                    </Table.ScrollContainer>
                  </Table>
                )}
              </Surface>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
