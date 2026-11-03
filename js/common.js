/* Shared utilities for the Macau Rewards app and coupon calculator. */
(function (global) {
  function money(n) {
    return 'MOP ' + Number(n || 0).toLocaleString('en', {
      maximumFractionDigits: 0
    });
  }

  function expiryDate(claim) {
    const parts = String(claim.claimed_on || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(part => !Number.isFinite(part))) return '';
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12);
    const daysUntilThursday = (4 - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysUntilThursday);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function localISO(date = new Date()) {
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  global.RewardsCommon = Object.freeze({ money, expiryDate, localISO, escapeHtml });
})(window);
