This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## POC mode

This branch supports a personal, browser-only proof of concept. No database, auth, or backend is required.

1. Run `npm run dev` and open the app.
2. On the home feed, click **Load demo classroom** to populate 5 fake students and a broad evidence history — or go to **My roster** and add your own students (for example, display name `Anthony`, handle `Anthony` or `@Anthony`).
3. On the home feed, capture a note such as `@Anthony was distractible during multiplying fractions review #behavior #fractions`.
4. Refresh the browser — your capture stays in the evidence inbox.
5. Open the student profile (for example `/students/anthony`) — the capture appears on that student's timeline.
6. Validate interpreted fields on a capture — refresh again and validation persists.
7. Use **Export JSON** on the feed to download `classtrace-poc-export.json`.

**Limitations**

- Data lives in this browser only (`localStorage`); it does not sync across devices or browsers.
- Not FERPA-ready or production-safe — for personal POC use only.
- No authentication, no database, no real AI processing yet.
- Clearing site data or using **Clear captures** removes stored evidence from this browser.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
