import Link from "next/link";

export const metadata = {
  title: "Safety Resources — WhatUPB",
  description:
    "Mental health and crisis resources. If you or someone you know is in danger, please reach out.",
};

export default function Safety() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-denim-200 hover:text-denim-100 transition"
          >
            &larr; Back to WhatUPB
          </Link>
          <h1 className="text-3xl font-bold mt-6 tracking-tight">
            Safety Resources
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            If you or someone you know is struggling, help is available 24/7.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-zinc-400 text-sm leading-relaxed">
          <section>
            <p>
              Anonymous platforms can surface difficult emotions. Whether
              you&apos;ve received a hurtful message or are going through a
              tough time, you are not alone. The resources below are free,
              confidential, and available around the clock.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              988 Suicide &amp; Crisis Lifeline
            </h2>
            <p className="mb-2">
              Free, confidential support for people in distress. Available 24/7
              by phone, chat, or text.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Call or text:</span>{" "}
                <a
                  href="tel:988"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  988
                </a>
              </li>
              <li>
                <span className="text-zinc-400">Chat online:</span>{" "}
                <a
                  href="https://988lifeline.org/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  988lifeline.org/chat
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Crisis Text Line
            </h2>
            <p className="mb-2">
              Free, 24/7 crisis support via text message. Trained crisis
              counselors are ready to help.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Text:</span>{" "}
                <strong className="text-zinc-300">HELLO</strong> to{" "}
                <a
                  href="sms:741741&body=HELLO"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  741741
                </a>
              </li>
              <li>
                <span className="text-zinc-400">Learn more:</span>{" "}
                <a
                  href="https://www.crisistextline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  crisistextline.org
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              RAINN (Rape, Abuse &amp; Incest National Network)
            </h2>
            <p className="mb-2">
              The nation&apos;s largest anti-sexual-violence organization.
              Confidential support from trained staff members.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Hotline:</span>{" "}
                <a
                  href="tel:1-800-656-4673"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  1-800-656-HOPE (4673)
                </a>
              </li>
              <li>
                <span className="text-zinc-400">Online chat:</span>{" "}
                <a
                  href="https://www.rainn.org/get-help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  rainn.org/get-help
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Contact WhatUPB Support
            </h2>
            <p className="mb-2">
              If you&apos;ve received a message that made you feel unsafe, or if
              you need to report abuse on the platform, our team is here to
              help.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Email:</span>{" "}
                <a
                  href="mailto:contact.whatupb@gmail.com"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  contact.whatupb@gmail.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <p className="text-zinc-500 italic">
              You matter. Reaching out is a sign of strength, not weakness.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-600">
          <Link
            href="/privacy"
            className="hover:text-zinc-400 transition"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-zinc-400 transition"
          >
            Terms of Service
          </Link>
          <Link
            href="/content-policy"
            className="hover:text-zinc-400 transition"
          >
            Content Policy
          </Link>
          <Link href="/" className="hover:text-zinc-400 transition">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
