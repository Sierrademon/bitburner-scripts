/** @param {NS} ns */
export async function main(ns) {
  const prefix = "pserv-";
  const interval = 30000;

  while (true) {
    const servers = ns.cloud.getServerNames();

    if (servers.length >= ns.cloud.getServerLimit()) return;

    const ramLimit = ns.cloud.getRamLimit();
    const money = ns.getServerMoneyAvailable("home");
    let bestRam = 0;

    for (let ram = 2; ram <= ramLimit; ram *= 2) {
      if (ns.cloud.getServerCost(ram) > money) break;
      bestRam = ram;
    }

    if (bestRam > 0) {
      let index = 0;
      let hostname = `${prefix}${index}`;

      while (servers.includes(hostname)) {
        index++;
        hostname = `${prefix}${index}`;
      }

      ns.cloud.purchaseServer(hostname, bestRam);
    }

    await ns.sleep(interval);
  }
}
