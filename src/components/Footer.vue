<!-- ========================= -->
<!-- Footer.vue -->
<!-- ========================= -->

<template>
  <footer class="footer">
    <div class="footer-brand">
      <strong>AI 음성 회의록 분석</strong>
      <span>도입문의 및 커스터마이징</span>
    </div>

    <div class="footer-actions">
      <button type="button" class="footer-icon-btn" aria-label="연락처">
        ☎
        <span class="footer-tooltip">010-7164-2496 구진형</span>
      </button>
      <button type="button" class="footer-icon-btn" aria-label="서비스 안내">
        ✦
        <span class="footer-tooltip">도입문의 및 커스터마이징 상담</span>
      </button>
    </div>
  </footer>
</template>

<style scoped>
/* 푸터 */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  min-height: 50px;
  background: #ffffff;
  border-top: 1px solid #d8efe2;
  box-shadow: 0 -8px 24px rgba(18, 53, 36, 0.04);
  margin-top: 0;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.footer-brand strong {
  overflow: hidden;
  color: #123524;
  font-size: 13px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer-brand span {
  color: #6a8f79;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid #d8efe2;
  border-radius: 12px;
  color: #174331;
  background: #f8fffb;
  cursor: pointer;
  font-size: 15px;
}

.footer-tooltip {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  width: max-content;
  max-width: 220px;
  padding: 9px 11px;
  border: 1px solid #d8efe2;
  border-radius: 12px;
  color: #123524;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(18, 53, 36, 0.12);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: 0.18s ease;
  white-space: normal;
}

.footer-icon-btn:hover .footer-tooltip,
.footer-icon-btn:focus .footer-tooltip {
  opacity: 1;
  transform: translateY(0);
}

/* 모바일 */
@media (max-width: 768px) {

  .footer {
    padding: 9px 12px calc(9px + env(safe-area-inset-bottom, 0px));
    min-height: auto;
  }

  .footer-brand {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .footer-brand strong {
    max-width: 52vw;
    font-size: 12px;
  }

  .footer-brand span {
    font-size: 11px;
  }
}
</style>
