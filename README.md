# 連環賞小管家｜澳門消費連環賞 2026

手機及桌面均適用的個人記錄 APP，重點是記錄每個支付錢包抽到的獎賞結果，而不是記帳。

## 功能
- 點選錢包及所屬人士；可新增任意數量的錢包
- 快速記錄「謝謝參與」或 MOP 10、20、50、100、200 優惠券
- 按錢包計算本週已記錄次數，每個錢包每週最多 3 次
- 優惠券記錄、核銷狀態、未核銷總額及歷史記錄
- Supabase 登入及雲端同步
- 不要求輸入消費金額、商戶或消費類型
- 不記錄長者及殘疾卡 MOP 500 立減優惠

## 部署
1. 在 Supabase SQL Editor 執行 `schema.sql`（現有 Project 已套用所需欄位）。
2. 在 Supabase Auth 啟用 Email 登入。
3. GitHub 專案 Settings → Pages → Deploy from a branch → `main` → `/(root)`。
4. 打開 GitHub Pages 網址，註冊／登入帳戶即可使用。

前端只使用 Supabase Project URL 和 Publishable key；切勿把 Secret 或 service_role key 放入瀏覽器。

## 活動提醒
本 APP 只作手動記錄，不會連接官方錢包或自動核實商戶資格。請以官方最新活動條款為準。