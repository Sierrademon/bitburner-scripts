/** @param {NS} ns */
export async function main(ns) {
  const hostsFile = "hosts.txt";
  const targetFile = "current-target.txt";
  const worker = "auto-hack.js";
  const interval = 30000;

  ns.disableLog("sleep");
  ns.disableLog("scp");
  ns.disableLog("getServerMoneyAvailable");

  while (true) {
    // Refresh the network scan so newly discovered servers are included.
    const scannerPid = ns.exec("scanner.js", "home", 1);
    if (scannerPid !== 0) {
      while (ns.isRunning(scannerPid, "home")) {
        await ns.sleep(100);
      }
    }

    const hosts = new Set(
      ns.read(hostsFile)
        .split(/\r?\n/)
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line).hostname;
          } catch {
            return "";
          }
        })
        .filter(Boolean)
    );

    for (const host of ns.cloud.getServerNames()) {
      hosts.add(host);
    }

    // Root every reachable server for which the available programs suffice.
    for (const host of hosts) {
      if (host === "home" || ns.hasRootAccess(host)) continue;

      try {
        if (ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(host);
        if (ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(host);
        if (ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(host);
        if (ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(host);
        if (ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(host);

        ns.nuke(host);
      } catch {
        // Not enough open ports (or another rooting call failed); try again later.
      }
    }

    // Select a target from rooted, hackable servers.
    let target = "";
    let bestScore = 0;

    for (const host of hosts) {
      if (!ns.hasRootAccess(host)) continue;
      if (ns.getServerRequiredHackingLevel(host) > ns.getHackingLevel()) continue;

      const maxMoney = ns.getServerMaxMoney(host);
      const hackFraction = ns.hackAnalyze(host);
      const hackTime = ns.getHackTime(host);

      if (maxMoney <= 0 || hackFraction <= 0 || hackTime <= 0) continue;

      const score = (maxMoney * hackFraction) / hackTime;
      if (score > bestScore) {
        bestScore = score;
        target = host;
      }
    }

    await ns.write(targetFile, target, "w");

    // Run a worker on every rooted non-home server.
    for (const host of hosts) {
      if (host === "home" || !ns.hasRootAccess(host)) continue;

      const workers = ns.ps(host).filter(
        process => process.filename === worker
      );

      if (target && workers.length === 1 && workers[0].args[0] === target) {
        continue;
      }

      for (const process of workers) {
        ns.kill(process.pid);
      }

      if (!target) continue;
      if (!(await ns.scp(worker, host, "home"))) continue;

      const scriptRam = ns.getScriptRam(worker, host);
      const freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
      const threads = scriptRam > 0 ? Math.floor(freeRam / scriptRam) : 0;

      if (threads > 0) {
        ns.exec(worker, host, threads, target);
      }
    }

    await ns.sleep(interval);
  }
}
