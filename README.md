# CancerGenix Frontend

This is the frontend repository for the CancerGenix chat application, built with Astro, React (TypeScript), and Tailwind CSS.

## 🔄 Related Repositories

This project is part of a multi-repository architecture:
- Frontend (this repo): User interface for the CancerGenix chat application
- Backend: [cancer-genix-backend](https://github.com/martialbb/cancer-genix-backend) - FastAPI backend service (to be created)

## 🚀 Project Setup

```sh
npm install
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                           |
| :---------------- | :----------------------------------------------- |
| `npm run dev`     | Starts local dev server at `localhost:4321`      |
| `npm run build`   | Build your production site to `./dist/`          |
| `npm run preview` | Preview your build locally, before deploying     |
| `npm run astro ...` | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI |

## 🔌 Backend Connection

This frontend is designed to work with the [cancer-genix-backend](https://github.com/martialbb/cancer-genix-backend) repository. To connect to the backend:

1. Create a `.env` file based on `.env.example`
2. Set `PUBLIC_API_URL` to point to your backend URL (default: http://localhost:8000)

For local development, both repositories should be cloned separately:

```sh
# Clone frontend (this repo)
git clone https://github.com/martialbb/cancer-genix-frontend.git

# Clone backend repo (in a separate directory)
git clone https://github.com/martialbb/cancer-genix-backend.git
```

## 👀 Want to learn more?

Check out the [Astro documentation](https://docs.astro.build) or jump into the [Astro Discord server](https://astro.build/chat).
