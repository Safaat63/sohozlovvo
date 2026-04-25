export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4 px-4">
                <h1 className="text-4xl font-bold">You&apos;re Offline</h1>
                <p className="text-muted-foreground">
                    It looks like you&apos;ve lost your internet connection.
                </p>
                <p className="text-sm text-muted-foreground">
                    Please check your connection and try again.
                </p>
            </div>
        </div>
    );
}
