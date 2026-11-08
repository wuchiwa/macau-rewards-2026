/* Shared coupon optimizer. Pure calculation: it never changes coupon records. */
(function (global) {
  // 200 / 100 / 50 retain denomination priority. 20 is deliberately
  // tied with 10. After coupon value and large denominations, prefer fewer
  // wallets; only then use completed-wallet count as the tie-breaker.
  function compareLargeDenominations(a, b) {
    const valuesA = a.choices.flatMap(x => x.coupons.map(c => Number(c.value)));
    const valuesB = b.choices.flatMap(x => x.coupons.map(c => Number(c.value)));
    for (const value of [200, 100, 50]) {
      const countA = valuesA.filter(v => v === value).length;
      const countB = valuesB.filter(v => v === value).length;
      if (countA !== countB) return countB - countA;
    }
    return 0;
  }

  function isBetter(a, b) {
    if (!b) return true;
    if (a.sumCents !== b.sumCents) return a.sumCents > b.sumCents;
    const denominationOrder = compareLargeDenominations(a, b);
    if (denominationOrder !== 0) return denominationOrder < 0;
    if (a.count !== b.count) return a.count < b.count;
    return a.completedWallets > b.completedWallets;
  }

  function calculate({ spend, maxWallets, wallets, coupons }) {
    spend = Number(spend) || 0;
    maxWallets = Math.max(0, Number(maxWallets) || 0);
    if (spend <= 0) throw new Error('請輸入大於 0 的消費金額。');
    const limitCents = Math.floor((spend / 3) + 1e-8) * 100;
    const walletGroups = (wallets || []).filter(w => !w.is_archived).map(w => ({
      id: w.id, name: w.name, coupons: (coupons || []).filter(c => c.wallet === w.id)
    }));
    let dp = new Map([['0|0', { count: 0, sumCents: 0, completedWallets: 0, choices: [] }]]);
    for (const wallet of walletGroups) {
      const options = [{ sumCents: 0, coupons: [] }], m = wallet.coupons.length;
      for (let mask = 1; mask < (1 << m); mask++) {
        const picked = wallet.coupons.filter((_, i) => mask & (1 << i));
        const sumCents = picked.reduce((s, x) => s + Math.round(x.value * 100), 0);
        if (sumCents <= limitCents) options.push({ sumCents, coupons: picked });
      }
      const next = new Map(dp);
      for (const state of dp.values()) for (const option of options) {
        if (!option.coupons.length) continue;
        const count = state.count + 1;
        if (count > maxWallets) continue;
        const sumCents = state.sumCents + option.sumCents;
        if (sumCents > limitCents) continue;
        const completedWallets = state.completedWallets + (option.coupons.length === wallet.coupons.length ? 1 : 0);
        const key = count + '|' + sumCents;
        const candidate = { count, sumCents, completedWallets,
          choices: [...state.choices, { wallet: wallet.id, walletName: wallet.name, coupons: option.coupons }] };
        if (isBetter(candidate, next.get(key))) next.set(key, candidate);
      }
      dp = next;
    }
    const candidates = [...dp.values()].filter(s => s.count > 0);
    candidates.sort((a, b) => (b.sumCents - a.sumCents) ||
      compareLargeDenominations(a, b) ||
      (a.count - b.count) ||
      (b.completedWallets - a.completedWallets));
    const selected = candidates[0] || { count: 0, sumCents: 0, completedWallets: 0, choices: [] };
    const chosen = selected.choices.flatMap(x => x.coupons);
    const sum = selected.sumCents / 100;
    const payments = selected.choices.map(x => ({
      wallet: x.wallet, walletName: x.walletName, coupons: x.coupons,
      minimum: x.coupons.reduce((s, c) => s + c.value, 0) * 3
    }));
    const minTotal = payments.reduce((s, p) => s + p.minimum, 0);
    const allocations = payments.map(p => ({ ...p, amount: p.minimum }));
    if (allocations.length) allocations[allocations.length - 1].amount += spend - minTotal;
    return {
      selected, chosen, sum, payments, minTotal, allocations,
      uncovered: Math.max(0, spend - minTotal),
      actualSpend: spend - sum,
      totalSpend: spend
    };
  }

  global.RewardsCalculator = Object.freeze({ calculate });
})(window);
