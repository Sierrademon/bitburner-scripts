/** @param {NS} ns */
export async function main(ns) {
  const discovered = new Set(["home"]);
  const queue = ["home"];

  for (let i = 0; i < queue.length; i++) {
    for (const neighbor of ns.scan(queue[i])) {
      if (discovered.has(neighbor)) continue;
      discovered.add(neighbor);
      queue.push(neighbor);
    }
  }

  // Include cloud servers even though they may not appear in the network scan.
  for (const host of ns.cloud.getServerNames()) {
    discovered.add(host);
  }

  const contents = [...discovered]
    .sort()
    .map(host => JSON.stringify({ hostname: host }))
    .join("\n");

  await ns.write("hosts.txt", `${contents}\n`, "w");
}
