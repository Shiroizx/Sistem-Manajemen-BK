import { getStudents, getDashboardStats } from './actions'
import { GuruBKDashboardClient } from './dashboard-client'

export default async function GuruBKDashboardPage() {
  const [students, stats] = await Promise.all([
    getStudents(),
    getDashboardStats(),
  ])

  return (
    <GuruBKDashboardClient
      initialStudents={students}
      initialStats={stats}
    />
  )
}

