/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    const target = ns.read("current-target.txt").trim();

    if (target) {
      const totalSeconds = Math.ceil(ns.getHackTime(target) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const time = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      ns.alert(
        `Selected target: ${target}\n` +
        `Estimated time for one hack action: ${time}`
      );
    }

    await ns.sleep(300000);
  }
}
