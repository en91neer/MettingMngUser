import { showConfirm } from '@/utils/alert.js'

export const PREMIUM_LIMIT_MESSAGE =
  '무료 체험 횟수를 모두 사용하셨습니다.<br />'
  + '더 많은 녹음 및 분석 기능을 이용하려면 프리미엄 플랜을 구독해주세요.'

const toHtmlMessage = (message) => {
  return String(message || PREMIUM_LIMIT_MESSAGE)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\n', '<br />')
    .replaceAll('&lt;br /&gt;', '<br />')
}

export const showPremiumUpgradeConfirm = async (message = PREMIUM_LIMIT_MESSAGE) => {
  return await showConfirm(
    '프리미엄 플랜 안내',
    `
      <div class="premium-upgrade-message">
        <p>${toHtmlMessage(message)}</p>
        <p>현재는 계좌이체로만 프리미엄 업그레이드가 가능합니다.</p>
        <div style="margin-top:12px;text-align:left;line-height:1.7;">
          <strong>입금 안내</strong><br />
          은행명: 국민은행<br />
          계좌번호: 000000-00-000000<br />
          예금주: HelloChoco<br />
          전화번호: 010-0000-0000<br />
          EMAIL: en91neer@naver.com
        </div>
        <div style="margin-top:12px;text-align:left;line-height:1.7;">
          <strong>프리미엄 혜택</strong><br />
          녹음 시간 확대, AI 분석 횟수 확대, 업무용 회의록 관리 기능을 제공합니다.
        </div>
      </div>
    `
  )
}
