/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    let cheapest = ns.hacknet.getPurchaseNodeCost();
    let action = "node";
    let node = -1;

    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
      const upgrades = [
        ["level", ns.hacknet.getLevelUpgradeCost(i, 1)],
        ["ram", ns.hacknet.getRamUpgradeCost(i, 1)],
        ["core", ns.hacknet.getCoreUpgradeCost(i, 1)]
      ];

      for (const [type, cost] of upgrades) {
        if (cost < cheapest) {
          cheapest = cost;
          action = type;
          node = i;
        }
      }
    }

    if (ns.getServerMoneyAvailable("home") >= cheapest) {
      if (action === "node") ns.hacknet.purchaseNode();
      if (action === "level") ns.hacknet.upgradeLevel(node, 1);
      if (action === "ram") ns.hacknet.upgradeRam(node, 1);
      if (action === "core") ns.hacknet.upgradeCore(node, 1);
    }

    await ns.sleep(1000);
  }
}