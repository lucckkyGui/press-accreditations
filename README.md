# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2d0a4d04-4931-48a0-9fb9-d4708261c4bc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2d0a4d04-4931-48a0-9fb9-d4708261c4bc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

The production deployment path is GitHub + Vercel with CI gates. See [Deployment Runbook](docs/deployment.md).

Before promoting a release, run:

```sh
npm ci
npm run lint
npm run typecheck
npm run build
npm run test:run
```

Lovable publishing can still be used for prototypes, but production releases should go through GitHub pull requests and Vercel deployments.

## Aktualizacja aplikacji po deployu

Podczas `npm run build` aplikacja generuje `public/version.json` z wersją równą `VITE_APP_VERSION`, `VERCEL_GIT_COMMIT_SHA`, a lokalnie timestampem builda. Ta sama wartość jest wbudowana w bundle jako `__APP_VERSION__`.

Po uruchomieniu aplikacja cyklicznie oraz po powrocie focusu okna pobiera `/version.json` z `cache: "no-store"`. Jeśli wersja z serwera różni się od wersji uruchomionego bundle, pojawia się toast „Dostępna jest nowa wersja — odśwież” z akcją „Odśwież”.

Kliknięcie „Odśwież” usuwa istniejące rejestracje service workera, czyści Cache Storage i przeładowuje stronę. `vercel.json` dodatkowo blokuje cache dla `/`, `/index.html`, `/version.json`, `/serviceWorker.js` i `/sw.js`, a pliki `/assets/*` pozostawia z długim immutable cache, bo Vite nadaje im hashe w nazwach.

Po tym deployu aplikacja nie rejestruje już nowego service workera. Użytkownicy, którzy mają starego workera w Safari, iOS albo w aplikacji dodanej do ekranu głównego, dostaną tymczasowy self-destruct worker pod `/serviceWorker.js` oraz `/sw.js`; worker czyści Cache Storage, unregisteruje samego siebie i odświeża kontrolowane okna. Dodatkowo nowy bundle wykonuje jednorazowy cleanup per wersja aplikacji zapisany w `localStorage`.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
