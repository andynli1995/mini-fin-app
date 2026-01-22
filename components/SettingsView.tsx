'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, Save, Download, Sun, Moon, Monitor } from 'lucide-react'
import { useInstallPWA } from './useInstallPWA'
import { useTheme } from './ThemeProvider'

export default function SettingsView() {
  const [hasPin, setHasPin] = useState(false)
  const [hideBalancesByDefault, setHideBalancesByDefault] = useState(false)
  const [lockTimeoutMinutes, setLockTimeoutMinutes] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const { install, canInstall, isInstalled, hasPrompt } = useInstallPWA()
  
  // PIN update form
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setHasPin(data.hasPin)
        setHideBalancesByDefault(data.hideBalancesByDefault || false)
        setLockTimeoutMinutes(data.lockTimeoutMinutes || 5)
        // Also update localStorage for dashboard
        localStorage.setItem('hideBalances', data.hideBalancesByDefault ? 'true' : 'false')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    setSaveError('')
    setSaveSuccess('')
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hideBalancesByDefault,
          lockTimeoutMinutes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('hideBalances', hideBalancesByDefault ? 'true' : 'false')
        setSaveSuccess('Preferences saved successfully!')
        setTimeout(() => setSaveSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setSaveError(errorData.error || 'Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      setSaveError('Failed to save preferences. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError('')
    setPinSuccess('')

    if (newPin.length < 4) {
      setPinError('New PIN must be at least 4 digits')
      return
    }

    if (newPin !== confirmNewPin) {
      setPinError('New PINs do not match')
      return
    }

    try {
      const response = await fetch('/api/settings/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: currentPin,
          newPin: newPin,
        }),
      })

      if (response.ok) {
        setPinSuccess('PIN updated successfully!')
        setCurrentPin('')
        setNewPin('')
        setConfirmNewPin('')
        setTimeout(() => setPinSuccess(''), 3000)
      } else {
        const error = await response.json()
        setPinError(error.error || 'Failed to update PIN')
      }
    } catch (error) {
      setPinError('Failed to update PIN')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-900 dark:text-gray-100">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred color scheme
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <Sun className={`w-6 h-6 mb-2 ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`text-sm font-medium ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <Moon className={`w-6 h-6 mb-2 ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                theme === 'system'
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <Monitor className={`w-6 h-6 mb-2 ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`text-sm font-medium ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>System</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Privacy Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hide Balances by Default
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Balances will be hidden on dashboard load. You can still toggle visibility.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={hideBalancesByDefault}
                onChange={(e) => setHideBalancesByDefault(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
          {saveError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">{saveSuccess}</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      {hasPin && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Security Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-lock Timeout
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                How long to keep the app unlocked after entering PIN (in minutes). The app will automatically lock after this period of inactivity.
              </p>
              <select
                value={lockTimeoutMinutes}
                onChange={(e) => setLockTimeoutMinutes(parseInt(e.target.value, 10))}
                  className="block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* PIN Settings */}
      {hasPin && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Update PIN Code
          </h2>
          <form onSubmit={handleUpdatePin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current PIN
              </label>
              <div className="relative">
                <input
                  type={showCurrentPin ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPin ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New PIN (4-6 digits)
              </label>
              <div className="relative">
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 pr-10"
                  required
                  minLength={4}
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPin ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New PIN
              </label>
              <div className="relative">
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value)}
                  className="block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 pr-10"
                  required
                  minLength={4}
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPin ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {pinError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{pinError}</p>
              </div>
            )}

            {pinSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">{pinSuccess}</p>
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Update PIN
            </button>
          </form>
        </div>
      )}

      {!hasPin && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            PIN is not set. Set up a PIN from the lock screen to enable PIN management here.
          </p>
        </div>
      )}

      {/* PWA Install */}
      {canInstall && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Install App
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isInstalled
                ? 'App is already installed on your device.'
                : hasPrompt
                  ? 'Install this app on your device for quick access and offline functionality.'
                  : 'Add this app to your home screen for quick access and a better experience.'}
            </p>
            {!isInstalled && (
              <button
                onClick={install}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                {hasPrompt ? 'Install App' : 'Show Install Instructions'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
