export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-accent/5 backdrop-blur-sm">
            <div className="relative flex flex-col items-center gap-8">
                {/* Animated Shopping Bag Icon */}
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/30 blur-xl"></div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/70 shadow-2xl shadow-primary/50">
                        <svg
                            className="h-12 w-12 animate-bounce text-primary-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Loading
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Please wait while we prepare your experience
                    </p>
                </div>

                {/* Loading Dots Animation */}
                <div className="flex gap-2">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-primary [animation-delay:0ms]"></div>
                    <div className="h-3 w-3 animate-pulse rounded-full bg-primary [animation-delay:150ms]"></div>
                    <div className="h-3 w-3 animate-pulse rounded-full bg-primary [animation-delay:300ms]"></div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1.5 w-64 overflow-hidden rounded-full bg-muted">
                    <div className="absolute inset-y-0 left-0 w-1/2 animate-shimmer rounded-full bg-linear-to-r from-primary/0 via-primary to-primary/0 animation-duration-[2s]"></div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-4 top-1/4 h-64 w-64 animate-float rounded-full bg-primary/5 blur-3xl"></div>
                <div className="absolute -right-4 bottom-1/4 h-64 w-64 animate-float rounded-full bg-accent/5 blur-3xl [animation-delay:1s]"></div>
            </div>
        </div>
    );
}
