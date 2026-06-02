'use client'

export function AdminSignOutButton() {
  return (
    <form action="/logout" method="POST">
      <button
        type="submit"
        className="text-sm text-gray-400 hover:text-white"
      >
        Sign Out
      </button>
    </form>
  )
}
