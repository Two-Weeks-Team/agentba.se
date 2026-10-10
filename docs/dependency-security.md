# Dependency review — 2026-10-11

The landing-page release uses Next.js and `eslint-config-next` 16.3.8,
Vitest 4.1.11, and compatible patched transitive packages. The dependency
versions and integrity values are recorded in `pnpm-lock.yaml`. The existing
minimum release age and install-script policy remain enabled.

`pnpm audit --prod --audit-level low` reports no known vulnerabilities.
The full audit still reports one high-severity development dependency:

- [`braces` 3.0.3 / GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
  reached through `eslint-config-next → @next/eslint-plugin-next → fast-glob →
  micromatch → braces`.
- The advisory names 3.0.4 as the fix, but the npm registry did not have that
  version at review time (`pnpm view braces version` returned 3.0.3; attempting
  to install 3.0.4 returned `ERR_PNPM_NO_MATCHING_VERSION`).
- This item is unresolved. It is not part of the production dependency tree.
  Recheck the published patch before removing this note; do not suppress the
  advisory or force an unrelated major version solely to make the audit pass.

Version checks describe known dependency advisories, not a penetration test or
a guarantee that the application has no vulnerabilities.
