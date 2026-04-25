import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/5 via-background to-accent/10 px-4">
            <div className="w-full max-w-3xl">
                <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-2xl md:p-16">
                    {/* Decorative Background Elements */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
                        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl"></div>
                        <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-accent/20 blur-3xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative flex flex-col items-center text-center">
                        {/* 404 Animation */}
                        <div className="mb-8 flex items-center justify-center">
                            <div className="relative">
                                <h1 className="text-9xl font-black text-primary/10 md:text-[12rem]">
                                    404
                                </h1>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm md:h-40 md:w-40">
                                        <svg
                                            className="h-16 w-16 text-primary md:h-20 md:w-20"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                            Page Not Found
                        </h2>
                        <p className="mb-8 max-w-md text-lg text-muted-foreground">
                            Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been removed, renamed, or doesn&apos;t exist.
                        </p>

                        {/* Search Suggestions */}
                        <div className="mb-8 w-full max-w-md rounded-lg border border-border bg-muted/50 p-6">
                            <h3 className="mb-3 text-sm font-semibold text-foreground">
                                Here&apos;s what you can do:
                            </h3>
                            <ul className="space-y-2 text-left text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <svg
                                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Check the URL for typos
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg
                                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Return to the homepage
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg
                                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Browse our product categories
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Back to Home
                            </Link>

                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-8 py-3 text-sm font-medium text-foreground shadow transition-all hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                <svg
                                    className="h-5 w-5"
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
                                Shop Products
                            </Link>
                        </div>

                        {/* Additional Help */}
                        <div className="mt-8 text-xs text-muted-foreground">
                            Need help?{' '}
                            <Link
                                href="/contact"
                                className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
