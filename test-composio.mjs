import { Composio } from "@composio/core";

const client = new Composio({ apiKey: "ak_kSNoX4_ctvk7I3AoYiYR" });

// List available apps
async function main() {
  try {
    const apps = await client.apps.list();
    console.log("Available apps:", JSON.stringify(apps, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
