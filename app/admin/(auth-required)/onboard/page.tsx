import OnboardForm from './OnboardForm'

export default function OnboardPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Onboard New Business</h1>
      <p className="text-gray-400 text-sm mb-8">
        Creates the business record, owner login, and optional staff account.
        Send credentials to the client via WhatsApp after creation.
      </p>
      <OnboardForm />
    </div>
  )
}
