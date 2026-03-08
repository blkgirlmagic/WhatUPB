export const metadata = {
  title: "Offline \u2014 WhatUPB",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="card-elevated text-center max-w-md mx-auto p-10">
        <div className="w-14 h-14 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-7 h-7 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          WhatUPB needs an internet connection to send and receive messages.
          Check your connection and try again.
        </p>

        <a href="/" className="btn-primary inline-block py-2.5 px-6 text-sm">
          Try Again
        </a>
      </div>
    </div>
  );
}
