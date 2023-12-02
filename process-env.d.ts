declare global {
    namespace NodeJS {
      interface ProcessEnv {
        GITHUB_TOKEN: string;
        // add more environment variables and their types here
      }
    }
  }