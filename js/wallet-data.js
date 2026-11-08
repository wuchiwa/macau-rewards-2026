/* Shared wallet platform definitions for the main app and calculator. */
(function (global) {
  const platforms = Object.freeze([
    ['MPay', 'https://macau-rewards-2026.web.app/icons/mpay.png'],
    ['支付寶', 'https://macau-rewards-2026.web.app/icons/alipay.png'],
    ['中銀', 'https://macau-rewards-2026.web.app/icons/boc.png'],
    ['工銀', 'https://macau-rewards-2026.web.app/icons/icbc.png'],
    ['豐付寶', 'https://macau-rewards-2026.web.app/icons/tf.png'],
    ['廣發', 'https://macau-rewards-2026.web.app/icons/cgb.png'],
    ['LusoPay', 'https://macau-rewards-2026.web.app/icons/luso.png'],
    ['UePay', 'https://macau-rewards-2026.web.app/icons/uepay.png']
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
