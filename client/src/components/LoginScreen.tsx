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
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden text-ink">
            <LoginBackground />

            <div className="relative z-10 w-full max-w-3xl rounded-lg border border-hairline bg-canvas p-6 shadow-elevated sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs text-ink-muted">AetherOS</p>
                        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.374px] text-ink">{isLockScreen ? 'Session Locked' : 'Sign In'}</h1>
                    </div>
                    <div className="flex items-center gap-1 rounded-pill border border-hairline bg-parchment px-3 py-1 text-xs text-ink-muted">
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
                                className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${account.id === selectedLoginUserId ? 'border-primary-focus bg-[rgba(0,102,204,0.06)]' : 'border-hairline bg-canvas hover:bg-parchment'}`}
                            >
                                <p className="font-semibold text-ink">{account.displayName}</p>
                                <p className="text-xs text-ink-muted">{account.role}</p>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="rounded-md border border-hairline bg-parchment p-4 sm:p-5">
                        <h2 className="mb-2 text-lg font-semibold text-ink">{selectedAccount?.displayName ?? 'Select profile'}</h2>
                        <p className="mb-4 text-xs text-ink-muted">Enter PIN (hint: {selectedAccount?.pinHint ?? '0000'})</p>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs font-semibold text-ink-muted">PIN</span>
                            <input
                                type="password"
                                inputMode="numeric"
                                autoFocus
                                value={pin}
                                onChange={(event) => setPin(event.target.value)}
                                className="w-full rounded-pill border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary-focus focus:outline focus:outline-2 focus:outline-primary-focus"
                                placeholder="Enter PIN"
                            />
                        </label>

                        {error ? <p className="mb-3 text-xs text-danger">{error}</p> : null}

                        <button
                            type="submit"
                            disabled={isAuthenticating || !selectedAccount}
                            className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary px-4 py-2.5 text-sm text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
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
