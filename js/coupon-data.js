/* Shared coupon rules. Pure functions only: no storage, network, or database writes. */
(function (global) {
  const values = Object.freeze([10, 20, 50, 100, 200]);
  const resultTypes = Object.freeze(['merchant_discount', 'consumer_benefit']);

  function expiryDate(claim) {
    return global.RewardsCommon.expiryDate(claim);
  }

  function isExpired(claim, today = global.RewardsCommon.localISO()) {
    return claim?.result_type === 'coupon' &&
      !claim.redeemed &&
      expiryDate(claim) < today;
  }

  function isAvailable(claim, today = global.RewardsCommon.localISO()) {
    return claim?.result_type === 'coupon' &&
      !claim.redeemed &&
      Number(claim.coupon_value) > 0 &&
      expiryDate(claim) >= today;
  }

  function availableCoupons(claims, today = global.RewardsCommon.localISO()) {
    return (claims || []).filter(claim => isAvailable(claim, today));
  }

  global.RewardsCoupons = Object.freeze({
    values, resultTypes, expiryDate, isExpired, isAvailable, availableCoupons
  });
})(window);
