import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { toast } from 'react-toastify'

function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    cardRevenue: 0,
    cashRevenue: 0,
    pendingCashPayments: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all orders
      const ordersResponse = await api.get('/admin/orders')
      const allOrders = ordersResponse.data.data

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayOrders = allOrders.filter(
        order => new Date(order.createdAt) >= today
      )

      const pending = allOrders.filter(order => order.orderStatus === 'pending')
      const preparing = allOrders.filter(order => order.orderStatus === 'preparing')
      const ready = allOrders.filter(order => order.orderStatus === 'ready')
      const completed = todayOrders.filter(order => order.orderStatus === 'completed')

      const totalRevenue = completed.reduce((sum, order) => sum + order.totalAmount, 0)
      const cardRevenue = completed
        .filter(order => order.paymentMethod === 'card')
        .reduce((sum, order) => sum + order.totalAmount, 0)
      const cashRevenue = completed
        .filter(order => order.paymentMethod === 'cash')
        .reduce((sum, order) => sum + order.totalAmount, 0)
      const pendingCash = allOrders.filter(
        order => order.paymentMethod === 'cash' && order.paymentStatus === 'pending'
      ).length

      setStats({
        todayOrders: todayOrders.length,
        pendingOrders: pending.length,
        preparingOrders: preparing.length,
        readyOrders: ready.length,
        completedOrders: completed.length,
        totalRevenue,
        cardRevenue,
        cashRevenue,
        pendingCashPayments: pendingCash
      })

      // Get recent orders (last 5)
      const recent = allOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
      setRecentOrders(recent)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'blue', onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Orders
              </button>
              <button
                onClick={() => navigate('/admin/menu')}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Menu
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders}
            subtitle={`${stats.completedOrders} completed`}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />

          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            subtitle="Awaiting preparation"
            color="yellow"
            onClick={() => navigate('/admin/orders?status=pending')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="Ready for Pickup"
            value={stats.readyOrders}
            subtitle="Notify students"
            color="green"
            onClick={() => navigate('/admin/orders?status=ready')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="Total Revenue"
            value={`₦${stats.totalRevenue.toLocaleString()}`}
            subtitle="Today's earnings"
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Revenue Breakdown & Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Card Payments</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ₦{stats.cardRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Cash Payments</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ₦{stats.cashRevenue.toLocaleString()}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Pending Cash</span>
                  <span className="text-yellow-600 font-semibold">
                    {stats.pendingCashPayments} orders
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Orders Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Orders</h2>
            <div className="space-y-4">
              <div
                onClick={() => navigate('/admin/orders?status=pending')}
                className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition"
              >
                <span className="text-gray-700 font-medium">Pending</span>
                <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {stats.pendingOrders}
                </span>
              </div>
              <div
                onClick={() => navigate('/admin/orders?status=preparing')}
                className="flex justify-between items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition"
              >
                <span className="text-gray-700 font-medium">Preparing</span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {stats.preparingOrders}
                </span>
              </div>
              <div
                onClick={() => navigate('/admin/orders?status=ready')}
                className="flex justify-between items-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition"
              >
                <span className="text-gray-700 font-medium">Ready for Pickup</span>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {stats.readyOrders}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map(order => (
                    <tr
                      key={order._id}
                      onClick={() => navigate('/admin/orders')}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {order.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatTime(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₦{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {order.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
