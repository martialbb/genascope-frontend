/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string | undefined;
  readonly DOCKER_ENV: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
