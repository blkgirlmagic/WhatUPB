"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
            definition requires a `statusCode` prop. However, since the App Router
            does not expose status codes for errors, we simply pass 0. This
            results in the text "An unexpected error has occurred" being displayed. */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <NextError statusCode={0 as any} />
      </body>
    </html>
  );
}
