import { useMemo, useState, type FormEvent } from 'react'
import { Loader2, Shield } from 'lucide-react'
import LoginBackground from './login/LoginBackground'
import LoginFooter from './login/LoginFooter'
import { useSessionStore } from '../stores/useSessionStore'

export default function LoginScreen() {
    const {
        accounts,
        activeUserId,
        selectedLoginUserId,
        isAuthenticating,
        error,
        selectLoginUser,
        loginWithPin,
    } = useSessionStore((state) => ({
        accounts: state.accounts,
        activeUserId: state.activeUserId,
        selectedLoginUserId: state.selectedLoginUserId,
        isAuthenticating: state.isAuthenticating,
        error: state.error,
        selectLoginUser: state.selectLoginUser,
        loginWithPin: state.loginWithPin,
    }))

    const [pin, setPin] = useState('')

    const selectedAccount = useMemo(
        () => accounts.find((account) => account.id === selectedLoginUserId) ?? accounts[0],
        [accounts, selectedLoginUserId],
    )

    const isLockScreen = Boolean(activeUserId)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!pin || isAuthenticating) {
            return
        }

        await loginWithPin(pin)
        setPin('')
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden tracking-wide text-slate-800">
            <LoginBackground />

            <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-white/70 bg-white/45 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-600">AetherOS</p>
                        <h1 className="text-2xl font-light text-slate-800 sm:text-3xl">{isLockScreen ? 'Session Locked' : 'Sign In'}</h1>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-white/75 bg-white/70 px-3 py-1 text-xs text-slate-700">
                        <Shield className="h-3.5 w-3.5" />
                        Multi-user mode
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                    <div className="space-y-2">
                        {accounts.map((account) => (
                            <button
                                key={account.id}
                                onClick={() => selectLoginUser(account.id)}
                                className={`w-full rounded-xl border px-3 py-2 text-left transition ${account.id === selectedLoginUserId ? 'border-sky-500/70 bg-sky-100/70' : 'border-white/70 bg-white/50 hover:bg-white/70'}`}
                            >
                                <p className="font-medium text-slate-800">{account.displayName}</p>
                                <p className="text-xs uppercase tracking-[0.08em] text-slate-600">{account.role}</p>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="rounded-xl border border-white/70 bg-white/55 p-4 sm:p-5">
                        <h2 className="mb-2 text-lg font-medium text-slate-800">{selectedAccount?.displayName ?? 'Select profile'}</h2>
                        <p className="mb-4 text-xs text-slate-600">Enter PIN (hint: {selectedAccount?.pinHint ?? '0000'})</p>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-slate-600">PIN</span>
                            <input
                                type="password"
                                inputMode="numeric"
                                autoFocus
                                value={pin}
                                onChange={(event) => setPin(event.target.value)}
                                className="w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-sky-400/60 transition focus:ring"
                                placeholder="Enter PIN"
                            />
                        </label>

                        {error ? <p className="mb-3 text-xs text-rose-600">{error}</p> : null}

                        <button
                            type="submit"
                            disabled={isAuthenticating || !selectedAccount}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isAuthenticating ? 'Authenticating' : isLockScreen ? 'Unlock' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>

            <LoginFooter />
        </div>
    )
}
