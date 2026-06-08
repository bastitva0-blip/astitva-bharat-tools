# Security Policy

We take the security of BharatTools seriously. This project handles user documents — photos, signatures, IDs, PDFs — and our core promise is that those files never leave the user's device. A bug that breaks that promise is a security bug, not a feature bug.

## Reporting a vulnerability

**Please do not report security issues through public GitHub issues, pull requests, or discussions.**

Instead, email **mudit@devalok.in** with:

- A description of the issue and its impact.
- Steps to reproduce (a minimal proof-of-concept is ideal).
- The affected version, URL, or commit SHA.
- Your name / handle, if you'd like to be credited.

You can expect:

- An acknowledgement within **3 business days**.
- An initial assessment within **7 business days**.
- Coordinated disclosure once a fix is available — we'll keep you informed of progress and agree on a public disclosure date with you.

If you don't hear back in that window, please ping again — email can get lost.

## Scope

In scope:

- This repository (`devalok-design/bharattools-frontend`) and the live site at [bharattools.app](https://bharattools.app).
- Anything that causes user files (images, PDFs, signatures) to leave the user's device unintentionally.
- XSS, prototype pollution, supply-chain issues affecting the build, or other client-side vulnerabilities.
- Bypasses of the "no upload" architectural guarantee.

Out of scope:

- Issues that require a physically compromised device, a malicious browser extension, or a privileged man-in-the-middle position.
- Missing security headers without a demonstrated exploit.
- Reports generated solely by automated scanners with no exploit context.
- Social engineering of Devalok team members.

## Safe harbor

We will not pursue legal action against researchers who:

- Make a good-faith effort to follow this policy.
- Avoid privacy violations, data destruction, and service degradation.
- Give us reasonable time to fix the issue before any public disclosure.

Thank you for helping keep BharatTools and its users safe.
