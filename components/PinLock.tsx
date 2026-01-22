'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Lock, Unlock } from 'lucide-react'

const PIN_STORAGE_KEY = 'app_pin'
const LOCK_STATE_KEY = 'app_locked'
const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export default function PinLock({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [enteredPin, setEnteredPin] = useState('')
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if PIN exists
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY)
    const locked = localStorage.getItem(LOCK_STATE_KEY) === 'true'
    
    setHasPin(!!storedPin)
    setIsLocked(locked)
    setIsSettingUp(!storedPin)

    // Set up inactivity timer
    if (storedPin && !locked) {
      resetInactivityTimer()
    }

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const resetTimer = () => {
      if (!isLocked && hasPin) {
        resetInactivityTimer()
      }
    }

    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [isLocked, hasPin, resetInactivityTimer])

  const lockApp = useCallback(() => {
    setIsLocked(true)
    localStorage.setItem(LOCK_STATE_KEY, 'true')
    setEnteredPin('')
    setError('')
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    inactivityTimerRef.current = setTimeout(() => {
      lockApp()
    }, INACTIVITY_TIMEOUT)
  }, [lockApp])

  const unlockApp = useCallback(() => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY)
    if (enteredPin === storedPin) {
      setIsLocked(false)
      localStorage.setItem(LOCK_STATE_KEY, 'false')
      setEnteredPin('')
      setError('')
      resetInactivityTimer()
    } else {
      setError('Incorrect PIN. Please try again.')
      setEnteredPin('')
    }
  }, [enteredPin, resetInactivityTimer])

  const setupPin = () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }
    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }
    localStorage.setItem(PIN_STORAGE_KEY, pin)
    localStorage.setItem(LOCK_STATE_KEY, 'false')
    setHasPin(true)
    setIsSettingUp(false)
    setIsLocked(false)
    setShowConfirm(false)
    setPin('')
    setConfirmPin('')
    setError('')
  }

  const handlePinInput = (digit: string) => {
    if (isSettingUp) {
      if (pin.length < 6) {
        setPin(pin + digit)
        setError('')
      }
    } else {
      if (enteredPin.length < 6) {
        setEnteredPin(enteredPin + digit)
        setError('')
      }
    }
  }

  const handleBackspace = () => {
    if (isSettingUp) {
      setPin(pin.slice(0, -1))
    } else {
      setEnteredPin(enteredPin.slice(0, -1))
    }
    setError('')
  }

  const handleConfirmPinInput = (digit: string) => {
    if (confirmPin.length < 6) {
      setConfirmPin(confirmPin + digit)
      setError('')
    }
  }

  const handleConfirmPinBackspace = () => {
    setConfirmPin(confirmPin.slice(0, -1))
    setError('')
  }

  // Auto-submit when PIN is complete (for unlock) - only when length matches stored PIN
  useEffect(() => {
    if (!isSettingUp && enteredPin.length >= 4) {
      const storedPin = localStorage.getItem(PIN_STORAGE_KEY)
      if (storedPin && enteredPin.length === storedPin.length && enteredPin === storedPin) {
        unlockApp()
      }
    }
  }, [enteredPin, isSettingUp, unlockApp])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard input when locked or setting up
      if (!isLocked && !isSettingUp) return

      // Handle number keys (0-9)
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        if (isSettingUp) {
          if (showConfirm) {
            if (confirmPin.length < 6) {
              setConfirmPin(confirmPin + e.key)
              setError('')
            }
          } else {
            if (pin.length < 6) {
              setPin(pin + e.key)
              setError('')
            }
          }
        } else {
          if (enteredPin.length < 6) {
            setEnteredPin(enteredPin + e.key)
            setError('')
          }
        }
      }
      // Handle backspace/delete
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        if (isSettingUp) {
          if (showConfirm) {
            setConfirmPin(confirmPin.slice(0, -1))
          } else {
            setPin(pin.slice(0, -1))
          }
        } else {
          setEnteredPin(enteredPin.slice(0, -1))
        }
        setError('')
      }
      // Handle Enter key
      else if (e.key === 'Enter') {
        e.preventDefault()
        if (isSettingUp) {
          if (showConfirm) {
            // Check if PINs match and are valid
            const currentPin = pin
            const currentConfirmPin = confirmPin
            if (currentPin.length >= 4 && currentConfirmPin === currentPin) {
              // Setup PIN
              localStorage.setItem(PIN_STORAGE_KEY, currentPin)
              localStorage.setItem(LOCK_STATE_KEY, 'false')
              setHasPin(true)
              setIsSettingUp(false)
              setIsLocked(false)
              setShowConfirm(false)
              setPin('')
              setConfirmPin('')
              setError('')
            } else if (currentConfirmPin.length === currentPin.length && currentConfirmPin !== currentPin) {
              setError('PINs do not match. Please try again.')
              setConfirmPin('')
            }
          } else {
            if (pin.length >= 4) {
              setShowConfirm(true)
              setError('')
            }
          }
        } else {
          // Unlock app
          const currentEnteredPin = enteredPin
          const storedPin = localStorage.getItem(PIN_STORAGE_KEY)
          if (currentEnteredPin.length >= 4 && storedPin && currentEnteredPin === storedPin) {
            setIsLocked(false)
            localStorage.setItem(LOCK_STATE_KEY, 'false')
            setEnteredPin('')
            setError('')
            resetInactivityTimer()
          } else if (currentEnteredPin.length >= 4) {
            setError('Incorrect PIN. Please try again.')
            setEnteredPin('')
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked, isSettingUp, showConfirm, pin, confirmPin, enteredPin])

  if (isSettingUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Set Up PIN</h1>
            <p className="text-gray-600 mt-2">Create a 4-6 digit PIN to secure your financial data</p>
            <p className="text-xs text-gray-500 mt-1">You can use your keyboard or click the buttons</p>
          </div>

          {!showConfirm ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter PIN (4-6 digits)
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border-2 ${
                        i < pin.length
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500">{pin.length} / 6</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinInput(num.toString())}
                    className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleBackspace}
                  className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
                >
                  ⌫
                </button>
                <button
                  onClick={() => handlePinInput('0')}
                  className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
                >
                  0
                </button>
                <button
                  onClick={() => {
                    if (pin.length >= 4) {
                      setShowConfirm(true)
                      setError('')
                    }
                  }}
                  disabled={pin.length < 4}
                  className="py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-xl font-semibold text-white transition-colors"
                >
                  ✓
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm PIN
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border-2 ${
                        i < confirmPin.length
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500">{confirmPin.length} / 6</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleConfirmPinInput(num.toString())}
                    className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleConfirmPinBackspace}
                  className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
                >
                  ⌫
                </button>
                <button
                  onClick={() => handleConfirmPinInput('0')}
                  className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
                >
                  0
                </button>
            <button
              onClick={() => {
                if (confirmPin === pin && confirmPin.length >= 4) {
                  setupPin()
                } else if (confirmPin.length === pin.length && confirmPin !== pin) {
                  setError('PINs do not match. Please try again.')
                  setConfirmPin('')
                }
              }}
              disabled={confirmPin.length < 4 || confirmPin.length !== pin.length}
              className="py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-xl font-semibold text-white transition-colors"
            >
              ✓
            </button>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">App Locked</h1>
            <p className="text-gray-600 mt-2">Enter your PIN to unlock</p>
            <p className="text-xs text-gray-500 mt-1">You can use your keyboard or click the buttons</p>
          </div>

          <div className="mb-6">
            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2 ${
                    i < enteredPin.length
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">{enteredPin.length} / 6</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinInput(num.toString())}
                className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
            >
              ⌫
            </button>
            <button
              onClick={() => handlePinInput('0')}
              className="py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold text-gray-800 transition-colors"
            >
              0
            </button>
            <button
              onClick={unlockApp}
              disabled={enteredPin.length < 4}
              className="py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-xl font-semibold text-white transition-colors"
            >
              Unlock
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
