import axios from 'axios';

declare global {
  // eslint-disable-next-line no-var
  var __TEARDOWN_MESSAGE__: string;
}

export default async function setup() {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const baseURL = `http://${host}:${port}`;

  // Verify the API server is running and responding with retries
  const maxRetries = 10;
  const retryDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(baseURL, { timeout: 2000 });
      console.log(
        `✅ API server is running at ${baseURL} (status: ${response.status}) after ${attempt} attempt(s)`
      );
      break; // Success, exit the retry loop
    } catch (err) {
      if (attempt === maxRetries) {
        throw new Error(
          `❌ API server is not responding at ${baseURL} after ${maxRetries} attempts. Make sure to run 'nx serve fantasy-squad-api' first. Error: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );
      }
      console.log(
        `⏳ Waiting for API server... (attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';

  // Return teardown function - this is how Vitest handles global teardown
  return async () => {
    // Note: In true e2e testing, we typically don't kill the server
    // since it should be running independently.
    console.log(globalThis.__TEARDOWN_MESSAGE__);
  };
}
