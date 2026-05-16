'use client'

import { useCallback, useEffect, useState } from 'react'

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'PARENT' | 'CONTENT_CREATOR' | 'ADMIN'
  is_active: boolean
  created_at: string
  student_count: number | null
}

const ROLE_LABELS: Record<string, string> = {
  PARENT: 'Эцэг эх',
  CONTENT_CREATOR: 'Бүтээгч',
  ADMIN: 'Админ',
}

const ROLE_TABS = [
  { value: '', label: 'Бүгд' },
  { value: 'PARENT', label: 'Эцэг эх' },
  { value: 'CONTENT_CREATOR', label: 'Бүтээгч' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pendingSearch, setPendingSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const fetchUsers = useCallback(async (q: string, role: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('search', q)
    if (role) params.set('role', role)
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers(search, roleFilter) }, [search, roleFilter, fetchUsers])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSearch(pendingSearch)
  }

  async function toggleActive(user: UserProfile) {
    setBusy(user.id)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !user.is_active }),
    })
    await fetchUsers(search, roleFilter)
    setBusy(null)
  }

  async function changeRole(user: UserProfile, role: string) {
    setBusy(user.id)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    await fetchUsers(search, roleFilter)
    setBusy(null)
  }

  async function deleteUser(id: string) {
    setBusy(id)
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    await fetchUsers(search, roleFilter)
    setBusy(null)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'DM Serif Display, serif' }}>
          Хэрэглэгчид
        </h1>
        <p className="text-stone-500 text-sm mt-1">Бүртгэлтэй хэрэглэгчдийг удирдах</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <input
            value={pendingSearch}
            onChange={(e) => setPendingSearch(e.target.value)}
            placeholder="Нэр эсвэл имэйлээр хайх..."
            className="flex-1 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-violet-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-all"
          >
            Хайх
          </button>
        </form>
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === tab.value
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm animate-pulse">Уншиж байна...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">Хэрэглэгч олдсонгүй</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Нэр</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Имэйл</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Дүр</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Төлөв</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Бүртгэлтэй</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-800">
                    {user.name}
                    {user.role === 'PARENT' && user.student_count !== null && (
                      <span className="ml-2 text-xs text-stone-400">{user.student_count} хүүхэд</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user, e.target.value)}
                      disabled={busy === user.id}
                      className="border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700 focus:outline-none focus:border-violet-400 disabled:opacity-50"
                    >
                      <option value="PARENT">Эцэг эх</option>
                      <option value="CONTENT_CREATOR">Бүтээгч</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(user)}
                      disabled={busy === user.id}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                        user.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {user.is_active ? 'Идэвхтэй' : 'Хаагдсан'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDelete === user.id ? (
                      <span className="inline-flex gap-2 items-center">
                        <span className="text-xs text-stone-500">Устгах уу?</span>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={busy === user.id}
                          className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                        >
                          Тийм
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2.5 py-1 border border-stone-200 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                        >
                          Үгүй
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="px-2.5 py-1 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all"
                      >
                        Устгах
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
