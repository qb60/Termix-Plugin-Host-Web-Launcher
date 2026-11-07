import fs from "node:fs";
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = process.env.RELEASE_VERSION ?? manifest.version;
if (!/^\d+\.\d+\.\d+$/.test(version))
  throw new Error("Only stable releases are published by this workflow");
if (manifest.version !== version || pkg.version !== version)
  throw new Error("Version mismatch");
const first = /^##\s+(\S+)/m.exec(fs.readFileSync("CHANGELOG.md", "utf8"))?.[1];
if (first !== version)
  throw new Error("Newest changelog section must match version");
if (manifest.repository.includes("GITHUB_USERNAME"))
  throw new Error("Configure the repository owner before publishing");
if (!process.env.TERMIX_PLUGIN_SIGNING_KEY?.trim())
  throw new Error("Missing TERMIX_PLUGIN_SIGNING_KEY secret");
if (!/^[A-Za-z0-9+/]{43}=$/.test(process.env.REGISTRY_PUBLIC_KEY ?? ""))
  throw new Error("Missing or invalid REGISTRY_PUBLIC_KEY repository variable");
console.log(`Release checks passed: v${version}`);
