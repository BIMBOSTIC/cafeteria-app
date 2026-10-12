import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import api from '../../services/api'
import { toast } from 'react-toastify'

function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [verifying, setVerifying] = useState(true)
  const [paymentData, setPaymentData] = useState(null)

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id')

      if (!sessionId) {
        toast.error('Invalid payment session')
        navigate('/cart')
        return
      }

      try {
        // Verify payment with backend
        const response = await api.post('/payment/verify', { sessionId })

        if (response.data.success) {
          setPaymentData(response.data.data)
          clearCart()
        } else {
          toast.error('Payment verification failed')
          navigate('/cart')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        toast.error(error.response?.data?.message || 'Payment verification failed')
        navigate('/cart')
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, navigate, clearCart])

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Payment Successful!
          </h2>

          <p className="mt-2 text-gray-600">
            Your payment has been processed successfully.
          </p>

          {paymentData && (
            <div className="mt-6 border-t border-b border-gray-200 py-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold text-gray-900">
                    {paymentData.metadata?.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-gray-900">
                    ${paymentData.amount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {paymentData.sessionId}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="mt-6 text-sm text-gray-600">
            You will receive a notification when your order is ready for pickup.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate('/order-status')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Order Status
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="w-full bg-white text-gray-700 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
