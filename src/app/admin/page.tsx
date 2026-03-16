import { getStudents, getDashboardStats } from './actions'
import { AdminDashboardClient } from './dashboard-client'

export default async function AdminDashboardPage() {
  const [students, stats] = await Promise.all([
    getStudents(),
    getDashboardStats(),
  ])

  return (
    <AdminDashboardClient
      initialStudents={students}
      initialStats={stats}
    />
  )
}

