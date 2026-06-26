// Force the standalone Next.js server to bind to every interface in container hosts.
process.env.HOSTNAME = process.env.APP_LISTEN_HOST || "0.0.0.0";

await import(new URL("../.next/standalone/server.js", import.meta.url).href);
