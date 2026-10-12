import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { onForegroundMessage } from '../../services/notifications'
import { toast } from 'react-toastify'

function OrderStatus() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [orders, setOrders] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [pastOrders, setPastOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('active') // 'active' or 'history'
  const audioCtxRef = useRef(null)

  // Warm up AudioContext on first user interaction — Chrome blocks audio
  // until the user has clicked/typed on the page (autoplay policy).
  useEffect(() => {
    const warmUp = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      document.removeEventListener('click', warmUp)
      document.removeEventListener('keydown', warmUp)
    }
    document.addEventListener('click', warmUp)
    document.addEventListener('keydown', warmUp)
    return () => {
      document.removeEventListener('click', warmUp)
      document.removeEventListener('keydown', warmUp)
    }
  }, [])

  const playAlert = () => {
    try {
      const ctx = audioCtxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      const playBeep = (freq, start, duration) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.5, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + duration)
      }
      playBeep(880, 0, 0.2)
      playBeep(1100, 0.25, 0.2)
      playBeep(880, 0.5, 0.3)
    } catch (_) {
      // Audio not available — silent fallback
    }
  }

  useEffect(() => {
    fetchOrders()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  // Listen for foreground FCM messages (app is open)
  useEffect(() => {
    let unsubscribe = () => {}
    onForegroundMessage((payload) => {
      const title = payload.notification?.title || 'Order ready!'
      const body = payload.notification?.body || 'Your order is ready for pickup.'
      toast.success(`${title} ${body}`, { autoClose: false })
      playAlert()
      fetchOrders()
    }).then((unsub) => {
      unsubscribe = unsub
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    categorizeOrders()
  }, [orders])

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/orders/student/${user.studentId}`)
      setOrders(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
      setLoading(false)
    }
  }

  const categorizeOrders = () => {
    const active = orders.filter(
      order => ['pending', 'preparing', 'ready'].includes(order.orderStatus)
    )
    const past = orders.filter(
      order => ['completed', 'cancelled'].includes(order.orderStatus)
    )
    setActiveOrders(active)
    setPastOrders(past)
  }

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'preparing':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'ready':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(
            order.orderStatus
          )}`}
        >
          {order.orderStatus}
        </span>
      </div>

      {/* Status Indicator */}
      {order.orderStatus === 'ready' && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <div className="flex items-center">
            <div className="text-green-600 mr-3">{getStatusIcon('ready')}</div>
            <div>
              <p className="font-semibold text-green-900">Your order is ready!</p>
              <p className="text-sm text-green-700">Please proceed to the cafe to collect your order</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-900 font-medium">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Footer */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-lg font-bold text-gray-900">
            ₦{order.totalAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Payment Method</span>
          <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.paymentMethod === 'card' ? 'Card' : 'Cash'} - {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Order Timeline */}
      {['pending', 'preparing', 'ready'].includes(order.orderStatus) && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${order.orderStatus !== 'pending' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.orderStatus !== 'pending' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {getStatusIcon(order.orderStatus !== 'pending' ? 'completed' : 'pending')}
              </div>
              <span className="text-xs mt-2 font-medium">Placed</span>
            </div>

            <div className={`flex-1 h-1 mx-2 ${order.orderStatus === 'preparing' || order.orderStatus === 'ready' ? 'bg-green-500' : 'bg-gray-300'}`}></div>

            <div className={`flex flex-col items-center ${order.orderStatus === 'preparing' || order.orderStatus === 'ready' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.orderStatus === 'preparing' || order.orderStatus === 'ready' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {getStatusIcon('preparing')}
              </div>
              <span className="text-xs mt-2 font-medium">Preparing</span>
            </div>

            <div className={`flex-1 h-1 mx-2 ${order.orderStatus === 'ready' ? 'bg-green-500' : 'bg-gray-300'}`}></div>

            <div className={`flex flex-col items-center ${order.orderStatus === 'ready' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.orderStatus === 'ready' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {getStatusIcon('ready')}
              </div>
              <span className="text-xs mt-2 font-medium">Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <button
              onClick={() => navigate('/menu')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setView('active')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              view === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              view === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Order History ({pastOrders.length})
          </button>
        </div>

        {/* Orders Display */}
        {view === 'active' ? (
          activeOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No active orders</h3>
              <p className="mt-2 text-gray-600">Place an order from the menu to get started</p>
              <button
                onClick={() => navigate('/menu')}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeOrders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )
        ) : pastOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No past orders yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastOrders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default OrderStatus
