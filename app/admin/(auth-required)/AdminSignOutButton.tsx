'use client'

import { adminLogoutAction } from './logout-action'

export function AdminSignOutButton() {
  return (
    <form action={adminLogoutAction}>
      <button
        type="submit"
        className="text-sm text-gray-400 hover:text-white"
      >
        Sign Out
      </button>
    </form>
  )
}
