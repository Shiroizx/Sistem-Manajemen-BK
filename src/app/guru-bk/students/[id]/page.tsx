import { notFound } from 'next/navigation'
import { StudentDetailClient } from './student-detail-client'
import { getStudentDetail } from './actions'

interface StudentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params
  const studentDetail = await getStudentDetail(id)

  if (!studentDetail) {
    notFound()
  }

  return <StudentDetailClient studentDetail={studentDetail} />
}

