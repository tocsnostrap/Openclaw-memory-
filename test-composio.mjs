import { Composio } from "@composio/core";

const client = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// List available apps
async function listApps() {
  try {
    const apps = await client.apps.list({ limit: 10 });
    console.log("Available apps:", JSON.stringify(apps, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listApps();
