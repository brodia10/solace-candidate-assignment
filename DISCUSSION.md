Things I did, in order.

1. Init repo

- add `.env` to `.gitignore` to prevent secrets from being committed
- rename branch from master to main
- push initial commit to main

2. Prep

- Install deps
- Inspect 22 vulnerablities upon installing deps with `npm audit`

```
Next.js Race Condition to Cache Poisoning - https://github.com/advisories/GHSA-qpjv-v59x-3qc4
Information exposure in Next.js dev server due to lack of origin verification - https://github.com/advisories/GHSA-3h52-269p-cp9r

Authorization Bypass in Next.js Middleware - https://github.com/advisories/GHSA-f82v-jwr5-mffw

Next.js Content Injection Vulnerability for Image Optimization - https://github.com/advisories/GHSA-xv57-4mr9-wg8v

Next.js Improper Middleware Redirect Handling Leads to SSRF - https://github.com/advisories/GHSA-4342-x723-ch2f

Next.js Affected by Cache Key Confusion for Image Optimization API Routes - https://github.com/advisories/GHSA-g5qg-72qw-gw5v

fix available via `npm audit fix`
```

- Run `npm audit fix` to try and safely resolve security issues in deps. This fixed 2 vulnerabilites, the rest will need to be manually upgraded to safe versions. Specifically:
- next (to latest stable version)
- eslint and related packages
- drizzle-kit
- esbuild

- Run `npx @next/codemod@canary upgrade latest` to upgrade Next.js to version 15 per the Next.js docs https://nextjs.org/docs/app/guides/upgrading/version-15
- Enable Turbopack for next dev during upgrade to improve local dev performance. Much faster development builds (up to 10x faster than Webpack)
  Faster hot reloads and file watching.
- Add codemods

1. next-experimental-turbo-to-turbopack ✅
   Updates your config to use the new Turbopack syntax
   Essential since you just enabled Turbopack
2. app-dir-runtime-config-experimental-edge ✅
   Updates runtime configuration for App Router
   Improves compatibility with edge runtime
3. next-async-request-api ✅
   Updates to the new async request API
   Better performance and modern patterns - Breaking changes https://nextjs.org/docs/app/guides/upgrading/version-15#async-request-apis-breaking-change

- Run React 19 upgrade codemod
- Run React 19 Types upgrade codemod

- Migrate API implementation from synchronous to async to comply with Next upgrade patterns: "To ease the burden of migration, a codemod is available to automate the process and the APIs can temporarily be accessed synchronously."
- Run codemode `npx @next/codemod@latest app-dir-runtime-config-experimental-edge .`

- After upgrading Next.js to 15.x there's actually more critical vulnerabilities than before, 24. Most are ESLint ecosystem and esbuild. The main issue is that eslint@8.57.0 is still using the vulnerable debug package.
  ESLint 8.x - Still has the debug malware vulnerability
  esbuild - Development server security issue
  drizzle-kit - Depends on vulnerable esbuild

- Try the safe fix again, `npm audit fix`
- Start ESLint upgrade from 8 to 9
- Start with the official migration tool - `npx @eslint/migrate-config .eslintrc.js`
- Upgrade ESLint and install deps
  `npm install eslint@^9.0.0 @eslint/js @eslint/eslintrc -D`
  This brought vulns from 34 to 21.
- Fix warning: next lint is depecrated and will be removed in Next.js 16. Migrate from `next lint` to the ESLint CLI.
  `npx @next/codemod@canary next-lint-to-eslint-cli .`

  Tried `npm audit fix --force`. Reduced vulnerabilities from 36 → 18 (good!)
  But broke everything (bad!)

- Install the secure package versions of packages with vulns - `npm install ansi-regex@latest ansi-styles@latest color-name@latest is-arrayish@latest supports-color@latest --save-dev`
- Add overrides in `package.json` to force all packages to use the secure versions
- Fix
  `npm warn deprecated @esbuild-kit/esm-loader@2.6.5: Merged into tsx: https://tsx.is`
  `npm warn deprecated @esbuild-kit/core-utils@3.3.2: Merged into tsx: https://tsx.is``

- Check if there's a newer version of drizzle-kit that uses the new tsx package:
  `npm ls @esbuild-kit/esm-loader @esbuild-kit/core-utils`. There is.

- Install latest stable release of `drizzle-kit`
  `npm install drizzle-kit@latest -D`

This fixed all 36 critical vulnerablilties!

- Add scripts to `package.json` to run docker and apply lint fixing

Fixed the major security issues (ESLint malware vulnerability)
Upgraded to modern tooling (Next.js 15, React 19, ESLint 9)
Improved performance (Turbopack)

3. Database setup

- Uncomment db url in .env
- Uncomment line in src/app/api/advocates/route.ts
- Create persistent docker volume for psql data by adding missing top-level psql value in `docker-compose`.yml - nevermind, that's totally fine. TIL
- Upon trying to migrate the db, I see drizzle-orm is out of date. Update drizzle orm `npm update drizzle-orm`
- Generate migrations with `npm run generate` instead of pushing schema directly to the database with `npx drizzle-kit push`
- Update migrate.js to a .ts file for consistency, install `tsx` as dev dependency to run it.
