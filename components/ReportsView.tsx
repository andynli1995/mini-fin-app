'use client'

import { useState, useMemo } from 'react'
import { Transaction, Category, Wallet } from '@prisma/client'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface TransactionWithRelations extends Transaction {
  category: Category
  wallet: Wallet
}

interface ReportsViewProps {
  transactions: TransactionWithRelations[]
  categories: Category[]
  wallets: Wallet[]
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

export default function ReportsView({
  transactions,
  categories,
  wallets,
}: ReportsViewProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterWallet, setFilterWallet] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('month')

  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.categoryId === filterCategory)
    }

    // Filter by wallet
    if (filterWallet !== 'all') {
      filtered = filtered.filter((t) => t.walletId === filterWallet)
    }

    // Filter by date range
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case '3months':
        startDate = startOfMonth(subMonths(now, 2))
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0)
    }

    filtered = filtered.filter((t) => {
      const tDate = new Date(t.date)
      return tDate >= startDate && tDate <= endDate
    })

    return filtered
  }, [transactions, filterType, filterCategory, filterWallet, dateRange])

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const lend = filteredTransactions
      .filter((t) => t.type === 'lend')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const rent = filteredTransactions
      .filter((t) => t.type === 'rent')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return { income, expense, lend, rent, net: income - expense - lend - rent }
  }, [filteredTransactions])

  // Category breakdown
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>()
    filteredTransactions.forEach((t) => {
      if (t.type === 'expense' || t.type === 'income') {
        const current = categoryMap.get(t.category.name) || 0
        categoryMap.set(t.category.name, current + Number(t.amount))
      }
    })

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value: Math.abs(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [filteredTransactions])

  // Type breakdown
  const typeData = useMemo(() => {
    return [
      { name: 'Income', value: totals.income, color: '#10b981' },
      { name: 'Expense', value: totals.expense, color: '#ef4444' },
      { name: 'Lend', value: totals.lend, color: '#f59e0b' },
      { name: 'Rent', value: totals.rent, color: '#3b82f6' },
    ].filter((item) => item.value > 0)
  }, [totals])

  // Monthly trend
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { income: number; expense: number }>()
    filteredTransactions.forEach((t) => {
      const month = format(new Date(t.date), 'MMM yyyy')
      const current = monthMap.get(month) || { income: 0, expense: 0 }
      if (t.type === 'income') {
        current.income += Number(t.amount)
      } else if (t.type === 'expense') {
        current.expense += Number(t.amount)
      }
      monthMap.set(month, current)
    })

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="lend">Lend</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet</label>
            <select
              value={filterWallet}
              onChange={(e) => setFilterWallet(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Wallets</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
            ${totals.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Expense</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
            ${totals.expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Lend</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">
            ${totals.lend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Rent</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
            ${totals.rent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Net Balance</p>
          <p
            className={`text-xl sm:text-2xl font-bold mt-1 ${
              totals.net >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ${totals.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Type Breakdown Pie Chart */}
        {typeData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Type Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent * 100).toFixed(0))}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Transactions ({filteredTransactions.length})
        </h3>
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.slice(0, 20).map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {transaction.category.name}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}$
                    {Math.abs(Number(transaction.amount)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length > 20 && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              Showing first 20 of {filteredTransactions.length} transactions
            </p>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredTransactions.slice(0, 20).map((transaction) => (
            <div key={transaction.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{transaction.category.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(transaction.date), 'MMM d, yyyy')} • {transaction.type}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ml-4 ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {Math.abs(Number(transaction.amount)).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          {filteredTransactions.length > 20 && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              Showing first 20 of {filteredTransactions.length} transactions
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
