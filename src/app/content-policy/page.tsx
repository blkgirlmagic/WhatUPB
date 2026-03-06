import Link from "next/link";

export const metadata = {
  title: "Content Policy — WhatUPB",
  description: "What is and isn't allowed on WhatUPB.",
};

export default function ContentPolicy() {
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
            Content Policy
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Effective date: March 8, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-zinc-400 text-sm leading-relaxed">
          <section>
            <p>
              WhatUPB is built for honest, anonymous conversations. To keep
              the platform safe for everyone, all users must follow this
              Content Policy. This applies to all messages sent through
              WhatUPB, whether anonymous or not.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. What&apos;s Allowed
            </h2>
            <p className="mb-3">
              WhatUPB encourages open, honest communication. You are welcome
              to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                Send honest feedback, opinions, compliments, or questions.
              </li>
              <li>Have candid conversations anonymously.</li>
              <li>
                Share thoughts you might not feel comfortable saying in person.
              </li>
              <li>
                Use creative, casual, or informal language.
              </li>
            </ul>
            <p className="mt-3">
              Honesty is encouraged. Cruelty is not.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. What&apos;s Not Allowed
            </h2>
            <p className="mb-3">
              The following content is strictly prohibited on WhatUPB:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Threats:</span> any message
                threatening violence, harm, or death against any person or
                group.
              </li>
              <li>
                <span className="text-zinc-400">Harassment:</span> targeted
                bullying, intimidation, repeated unwanted contact, or messages
                intended to cause emotional distress.
              </li>
              <li>
                <span className="text-zinc-400">Hate speech:</span> content
                that attacks or demeans people based on race, ethnicity,
                gender, religion, sexual orientation, disability, or other
                protected characteristics.
              </li>
              <li>
                <span className="text-zinc-400">
                  Child sexual abuse material (CSAM):
                </span>{" "}
                any sexual content involving minors. This is reported to
                authorities immediately.
              </li>
              <li>
                <span className="text-zinc-400">Illegal activity:</span>{" "}
                content that promotes, facilitates, or solicits illegal
                activity.
              </li>
              <li>
                <span className="text-zinc-400">Doxxing:</span> sharing
                someone&apos;s personal information (address, phone number,
                real name, etc.) without their consent.
              </li>
              <li>
                <span className="text-zinc-400">
                  Spam and scams:
                </span>{" "}
                unsolicited promotional content, phishing links, or deceptive
                messages.
              </li>
              <li>
                <span className="text-zinc-400">
                  Self-harm or suicide encouragement:
                </span>{" "}
                content that encourages or glorifies self-harm or suicide.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Automated Moderation
            </h2>
            <p className="mb-3">
              WhatUPB uses the Google Perspective API to automatically screen
              messages for toxic, threatening, or abusive content in real time.
              Here&apos;s how it works:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                Every message is analyzed before delivery for toxicity,
                threats, insults, and other harmful signals.
              </li>
              <li>
                Messages that exceed our toxicity thresholds are blocked
                automatically and never delivered to the recipient.
              </li>
              <li>
                No human reviews your messages. Moderation is fully automated.
              </li>
              <li>
                Automated systems are not perfect. Some harmful content may
                slip through, and some legitimate messages may occasionally be
                flagged. If you believe a message was blocked unfairly, contact
                us.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Reporting Abuse
            </h2>
            <p className="mb-3">
              If you receive a message that violates this Content Policy or
              makes you feel unsafe, you can report it:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                Email us at{" "}
                <a
                  href="mailto:contact.whatupb@gmail.com"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  contact.whatupb@gmail.com
                </a>{" "}
                with a description of the issue.
              </li>
              <li>
                Include as much context as possible (e.g., screenshot of the
                message, your username, approximate time received).
              </li>
              <li>
                We take all reports seriously and will investigate promptly.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Consequences for Violations
            </h2>
            <p className="mb-3">
              If we determine that a user has violated this Content Policy,
              we may take any of the following actions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Message blocking:</span>{" "}
                individual messages that violate the policy are blocked
                automatically and not delivered.
              </li>
              <li>
                <span className="text-zinc-400">Account suspension:</span>{" "}
                temporary suspension of account access for repeated or serious
                violations.
              </li>
              <li>
                <span className="text-zinc-400">Account termination:</span>{" "}
                permanent deletion of the account for severe or repeated
                violations.
              </li>
              <li>
                <span className="text-zinc-400">Legal referral:</span>{" "}
                illegal activity, including CSAM and credible threats of
                violence, will be reported to law enforcement.
              </li>
            </ul>
            <p className="mt-3">
              Enforcement decisions are made at our sole discretion and are
              final.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Changes to This Policy
            </h2>
            <p>
              We may update this Content Policy as the platform evolves. If we
              make significant changes, we will notify users through the
              service. Continued use of WhatUPB after changes are posted
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Contact Us
            </h2>
            <p>
              If you have questions about this Content Policy or need to report
              a concern, contact Aurora Bridge LLC at{" "}
              <a
                href="mailto:contact.whatupb@gmail.com"
                className="text-denim-200 hover:text-denim-100 underline transition"
              >
                contact.whatupb@gmail.com
              </a>
              .
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
          <Link href="/" className="hover:text-zinc-400 transition">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
