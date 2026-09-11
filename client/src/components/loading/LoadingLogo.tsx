import AetherMark from '../brand/AetherMark'

export default function LoadingLogo() {
    return (
        <div className="mb-16 flex items-center justify-center" aria-label="AetherOS">
            <div className="flex items-center gap-4 text-primary">
                <AetherMark className="h-14 w-14" />
                <div className="text-left text-ink">
                    <p className="font-display text-[28px] font-semibold leading-none tracking-[-0.28px]">AetherOS</p>
                    <p className="mt-2 text-[12px] leading-none text-ink-muted">System environment</p>
                </div>
            </div>
        </div>
    )
}
