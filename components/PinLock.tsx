'use client'

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import { Lock, Unlock } from 'lucide-react'

// INACTIVITY_TIMEOUT is now dynamic based on user settings

interface PinLockContextType {
  lockApp: () => void
  isLocked: boolean
}

const PinLockContext = createContext<PinLockContextType | undefined>(undefined)

export function usePinLock() {
  const context = useContext(PinLockContext)
  if (!context) {
    throw new Error('usePinLock must be used within PinLock')
  }
  return context
}

export default function PinLock({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [enteredPin, setEnteredPin] = useState('')
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [lockTimeoutMinutes, setLockTimeoutMinutes] = useState(5)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch PIN status from database
  useEffect(() => {
    const fetchPinStatus = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setHasPin(data.hasPin)
          setLockTimeoutMinutes(data.lockTimeoutMinutes || 5)
          
          if (data.hasPin) {
            // Check if user was recently unlocked and timeout hasn't expired
            const unlockTimestamp = localStorage.getItem('appUnlockTimestamp')
            const timeoutMs = (data.lockTimeoutMinutes || 5) * 60 * 1000
            
            if (unlockTimestamp) {
              const timeSinceUnlock = Date.now() - parseInt(unlockTimestamp, 10)
              if (timeSinceUnlock < timeoutMs) {
                // Still within timeout period, don't lock
                setIsLocked(false)
              } else {
                // Timeout expired, lock the app
                setIsLocked(true)
                localStorage.removeItem('appUnlockTimestamp')
                await fetch('/api/settings/pin', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ isLocked: true }),
                })
              }
            } else {
              // No unlock timestamp, lock by default
              setIsLocked(true)
              await fetch('/api/settings/pin', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLocked: true }),
              })
            }
          } else {
            setIsLocked(false)
          }
          setIsSettingUp(!data.hasPin)
        }
      } catch (error) {
        console.error('Error fetching PIN status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPinStatus()
  }, [])

  const lockApp = useCallback(async () => {
    try {
      await fetch('/api/settings/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: true }),
      })
      setIsLocked(true)
      setEnteredPin('')
      setError('')
      // Clear unlock timestamp when manually locking
      localStorage.removeItem('appUnlockTimestamp')
    } catch (error) {
      console.error('Error locking app:', error)
      setIsLocked(true)
      setEnteredPin('')
      setError('')
      localStorage.removeItem('appUnlockTimestamp')
    }
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    const timeoutMs = lockTimeoutMinutes * 60 * 1000
    inactivityTimerRef.current = setTimeout(() => {
      lockApp()
      localStorage.removeItem('appUnlockTimestamp')
    }, timeoutMs)
  }, [lockApp, lockTimeoutMinutes])

  const unlockApp = useCallback(async () => {
    if (enteredPin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    try {
      const response = await fetch('/api/settings/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin, isLocked: false }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsLocked(false)
        setEnteredPin('')
        setError('')
        // Store unlock timestamp in localStorage
        localStorage.setItem('appUnlockTimestamp', Date.now().toString())
        resetInactivityTimer()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Incorrect PIN. Please try again.')
        setEnteredPin('')
      }
    } catch (error) {
      console.error('Error unlocking app:', error)
      setError('Failed to unlock. Please try again.')
      setEnteredPin('')
    }
  }, [enteredPin, resetInactivityTimer])

  useEffect(() => {
    // Set up inactivity timer
    if (hasPin && !isLocked && !isSettingUp) {
      resetInactivityTimer()
    }

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const resetTimer = () => {
      if (!isLocked && hasPin && !isSettingUp) {
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
  }, [isLocked, hasPin, isSettingUp, resetInactivityTimer])

  const setupPin = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }
    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    try {
      const response = await fetch('/api/settings/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (response.ok) {
        setHasPin(true)
        setIsSettingUp(false)
        setIsLocked(false)
        setShowConfirm(false)
        setPin('')
        setConfirmPin('')
        setError('')
        // Store unlock timestamp in localStorage
        localStorage.setItem('appUnlockTimestamp', Date.now().toString())
        resetInactivityTimer()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to set PIN. Please try again.')
      }
    } catch (error) {
      console.error('Error setting PIN:', error)
      setError('Failed to set PIN. Please try again.')
    }
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

  // Auto-submit when PIN is complete (for unlock)
  useEffect(() => {
    if (!isSettingUp && enteredPin.length >= 4 && enteredPin.length <= 6) {
      // Try to unlock when PIN length is reasonable
      const timer = setTimeout(() => {
        if (enteredPin.length >= 4) {
          unlockApp()
        }
      }, 300) // Small delay to allow user to continue typing
      return () => clearTimeout(timer)
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
            if (confirmPin === pin && confirmPin.length >= 4) {
              setupPin()
            } else if (confirmPin.length === pin.length && confirmPin !== pin) {
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
          if (enteredPin.length >= 4) {
            unlockApp()
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (isSettingUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl dark:shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-slate-700">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Set Up PIN</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create a 4-6 digit PIN to secure your financial data</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">You can use your keyboard or click the buttons</p>
          </div>

          {!showConfirm ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter PIN (4-6 digits)
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border-2 ${
                        i < pin.length
                          ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">{pin.length} / 6</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinInput(num.toString())}
                    className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleBackspace}
                  className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
                >
                  ⌫
                </button>
                <button
                  onClick={() => handlePinInput('0')}
                  className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
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
                  className="py-4 px-6 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-xl font-semibold text-white transition-colors"
                >
                  ✓
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm PIN
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border-2 ${
                        i < confirmPin.length
                          ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">{confirmPin.length} / 6</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleConfirmPinInput(num.toString())}
                    className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleConfirmPinBackspace}
                  className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
                >
                  ⌫
                </button>
                <button
                  onClick={() => handleConfirmPinInput('0')}
                  className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
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
                  className="py-4 px-6 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-xl font-semibold text-white transition-colors"
                >
                  ✓
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl dark:shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-slate-700">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">App Locked</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your PIN to unlock</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">You can use your keyboard or click the buttons</p>
          </div>

          <div className="mb-6">
            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2 ${
                    i < enteredPin.length
                      ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">{enteredPin.length} / 6</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinInput(num.toString())}
                className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
            >
              ⌫
            </button>
            <button
              onClick={() => handlePinInput('0')}
              className="py-4 px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors"
            >
              0
            </button>
            <button
              onClick={unlockApp}
              disabled={enteredPin.length < 4}
              className="py-4 px-6 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-xl font-semibold text-white transition-colors"
            >
              Unlock
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <PinLockContext.Provider value={{ lockApp, isLocked }}>
      {children}
    </PinLockContext.Provider>
  )
}
