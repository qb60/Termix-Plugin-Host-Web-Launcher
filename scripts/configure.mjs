import fs from "node:fs";
const owner = process.argv[2];
if (
  !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner ?? "") ||
  owner === "GITHUB_USERNAME"
)
  throw new Error("Pass a real GitHub owner: npm run configure -- OWNER");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
manifest.repository = `https://github.com/${owner}/Termix-Plugin-Host-Web-Launcher`;
fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 2) + "\n");
