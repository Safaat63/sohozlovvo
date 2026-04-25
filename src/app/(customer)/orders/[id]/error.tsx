'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-destructive/5 via-background to-muted/20 px-4">
            <div className="w-full max-w-2xl">
                <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-2xl md:p-12">
                    {/* Decorative Background */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
                        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-destructive/10 blur-3xl"></div>
                        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-destructive/10 blur-3xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative flex flex-col items-center text-center">
                        {/* Error Icon */}
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                            <svg
                                className="h-12 w-12 text-destructive"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        {/* Error Message */}
                        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
                            Oops! Something went wrong
                        </h1>
                        <p className="mb-2 text-lg text-muted-foreground">
                            We encountered an unexpected error
                        </p>

                        {/* Error Details */}
                        {error.message && (
                            <div className="mb-8 mt-4 w-full max-w-md rounded-md border border-destructive/20 bg-destructive/5 p-4">
                                <p className="wrap-break-word text-sm text-destructive">
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Error ID: {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Try Again
                            </button>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-medium text-foreground shadow transition-all hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                                Go Home
                            </Link>
                        </div>

                        {/* Help Text */}
                        <p className="mt-8 text-xs text-muted-foreground">
                            If this problem persists, please contact our support team
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
