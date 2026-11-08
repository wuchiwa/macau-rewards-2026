/* Shared wallet platform definitions for the main app and calculator. */
(function (global) {
  // Resolve from this shared script so the same paths work on the main app
  // and on the nested /coupon-test/ page.
  const iconBase = new URL('../assets/wallets/', document.currentScript.src).href;
  const platforms = Object.freeze([
    ['MPay', iconBase + 'mpay.png'],
    ['支付寶', iconBase + 'alipay.png'],
    ['中銀', iconBase + 'boc.png'],
    ['工銀', iconBase + 'icbc.png'],
    ['豐付寶', iconBase + 'tf.png'],
    ['廣發', iconBase + 'cgb.png'],
    ['LusoPay', iconBase + 'luso.png'],
    ['UePay', iconBase + 'uepay.png']
  ]);

  function platformName(wallet) {
    const raw = String(wallet ?? '').trim();
    return platforms.find(([name]) =>
      raw === name || raw.endsWith(' · ' + name) || raw.includes(' · ' + name)
    )?.[0] || null;
  }

  function displayPlatform(wallet) {
    return platformName(wallet) || String(wallet?.name || '未知錢包');
  }

  function platformIcon(wallet) {
    const platform = platforms.find(([name]) => name === platformName(wallet));
    return platform ? platform[1] : '';
  }

  global.RewardsWallets = Object.freeze({
    platforms,
    platformName,
    displayPlatform,
    platformIcon
  });
})(window);
