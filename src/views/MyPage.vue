<template>
    <div>
        <!-- 다운로드 버튼 -->
        <div class="button-area">
            <button class="load-btn excel-btn" @click="downloadPdf">
                📄 PDF 다운로드
            </button>
        </div>

        <div ref="timelineArea">
            <!-- 프로젝트 개발 연혁 -->
            <div class="timeline">
                <!-- SK -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        ☁️
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2024.10 ~ 2026.05
                        </div>
                        <h3>
                            B2B 리워드 시스템 개발 및 운영
                        </h3>
                        <p class="company">
                            SKT · SKB · 갤럭시아머니트리
                        </p>
                        <p>
                            Swing/Telink 주문 기반 쿠폰 및 상품권 대용량 발송 배치 개발,
                            쿠폰 인증/인가 시스템 구축,
                            장애 감지 및 모니터링 화면 개발,
                            운영 및 유지보수 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · JSP · Vue2 · jQuery · Oracle · Linux · Eclipse · IntelliJ · JSON · XML · Batch
                        </div>
                    </div>
                </div>

                <!-- TBROAD 장기 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        🎧
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2016.10 ~ 2024.09
                        </div>
                        <h3>
                            TBROAD 기간계 시스템 구축 및 유지보수
                        </h3>
                        <p class="company">
                            TBROAD · SKB
                        </p>
                        <p>
                            상품 접수 및 전자청약 개발,
                            업무용 대용량 배치 프로그램 개발,
                            TMS 시스템 고도화,
                            MSwing API 설계,
                            현업 요청 데이터 추출,
                            콜센터 및 현장 기술 지원 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · JSP · Android · Oracle · Miplatform · Linux · XML · Batch · API
                        </div>
                    </div>
                </div>

                <!-- LG -->
                <div class="timeline-item">
                    <div class="timeline-badge"></div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2016.03 ~ 2016.09
                        </div>
                        <h3>
                            LG U+ 유선전화 영업시스템 개발
                        </h3>
                        <p class="company">
                            LG CNS · LG U+
                        </p>
                        <p>
                            국제전화 앱 요금조회 서버 API 개발,
                            C언어 기반 통계 시스템을 Miplatform 기반 화면으로 전환 개발 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · ProC · Oracle · PostgreSQL · Miplatform · OZ Report · JSON · XML
                        </div>
                    </div>

                </div>

                <!-- TBROAD 초기 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        🖥️
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2015.03 ~ 2016.03
                        </div>
                        <h3>
                            TBROAD 기간계 시스템 신규 구축
                        </h3>
                        <p class="company">
                            TBROAD
                        </p>
                        <p>
                            CCTV 및 현대백화점 관련 업무 개발,
                            각종 배치 프로그램 신규 개발 및 운영 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · JSP · Oracle · Linux · Miplatform · XML · Batch
                        </div>
                    </div>

                </div>

                <!-- 한국투자 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        💰
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2014.04 ~ 2015.01
                        </div>
                        <h3>
                            한국투자신탁 시스템 구축
                        </h3>
                        <p class="company">
                            한국투자증권
                        </p>
                        <p>
                            Pro-Web 기반 업무 시스템을
                            XPlatform 환경으로 마이그레이션 개발 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · JSP · ProFrame · Oracle · XPlatform · JSON · XML
                        </div>
                    </div>

                </div>

                <!-- 교원 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        📚
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2013.08 ~ 2014.01
                        </div>
                        <h3>
                            교원 마이패드2 시스템 구축
                        </h3>
                        <p class="company">
                            교원
                        </p>
                        <p>
                            서버-단말 간 상품 API 개발,
                            고객관리 페이지 개발,
                            관리자 기능 구현 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · jQuery · Oracle · JSON · XML
                        </div>
                    </div>
                </div>

                <!-- 마이캐치온 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        🔐
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2013.06 ~ 2013.07
                        </div>
                        <h3>
                            마이캐치온 통합회원 연동 개발
                        </h3>
                        <p class="company">
                            CJ E&M
                        </p>
                        <p>
                            실명인증 기능 개발,
                            페이스북 및 트위터 SNS 로그인 연동 개발 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · jQuery · Oracle · JSON · 인증 연동 API
                        </div>
                    </div>
                </div>

                <!-- KT -->
                <div class="timeline-item">
                    <div class="timeline-badge"></div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2011.07 ~ 2013.05
                        </div>
                        <h3>
                            KT SHOW VIDEO(VOD) 운영 및 유지보수
                        </h3>
                        <p class="company">
                            KT
                        </p>
                        <p>
                            무선 VOD 서비스 운영 및 유지보수,
                            장애 대응 및 운영 관리 수행.
                        </p>
                        <div class="tech-stack">
                            ASP · MSSQL · XML · 운영관리
                        </div>
                    </div>
                </div>

                <!-- PUSH -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        🔔
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2013.02 ~ 2013.03
                        </div>
                        <h3>
                            마이캐치온 모바일 PUSH Server 개발
                        </h3>
                        <p class="company">
                            CJ E&M
                        </p>
                        <p>
                            PUSH 서버 구축,
                            단말 연동 API 및 관리자 페이지 개발 수행.
                        </p>
                        <div class="tech-stack">
                            C#.NET · jQuery · MSSQL · JSON · API
                        </div>
                    </div>

                </div>

                <!-- 삼성 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        📱
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2012.03 ~ 2012.10
                        </div>
                        <h3>
                            삼성전자 Readers Hub / Learning Hub 개발
                        </h3>
                        <p class="company">
                            삼성전자
                        </p>
                        <p>
                            상품 프로모션 관리자 페이지 개발,
                            UDP 기반 파일 업로드/다운로드 테스트 페이지 개발 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · JSP · jQuery · MySQL · JSON · XML · UDP
                        </div>
                    </div>
                </div>

                <!-- 다음 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        🎬
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2012.01 ~ 2012.03
                        </div>
                        <h3>
                            Daum TV 영화 VOD 서비스
                        </h3>
                        <p class="company">
                            Daum
                        </p>
                        <p>
                            셋탑박스 관리자 페이지 개발 및 운영 기능 구현 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · JindoFramework · MySQL · JSON
                        </div>
                    </div>
                </div>

                <!-- 교육넷 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        🏫
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2010.07 ~ 2010.11
                        </div>
                        <h3>
                            내친구 교육넷 운영 및 유지보수
                        </h3>
                        <p class="company">
                            대구남부교육청
                        </p>
                        <p>
                            교육 포털 시스템 운영 및 유지보수 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · JSP · jQuery · Oracle · XML · JSON
                        </div>
                    </div>
                </div>

                <!-- 경북대 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        🎓
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            2010.05 ~ 2010.12
                        </div>
                        <h3>
                            경북대학교 통합정보시스템 구축
                        </h3>
                        <p class="company">
                            경북대학교
                        </p>
                        <p>
                            상주대·경북대 통합 학사정보 시스템 내
                            기숙사 배정 및 외빈관리 시스템 개발 수행.
                        </p>
                        <div class="tech-stack">
                            JAVA · JSP · jQuery · Oracle · Eclipse · Miplatform · XML · JSON
                        </div>
                    </div>
                </div>

                <!-- 기술 요약 -->
                <div class="timeline-item">
                    <div class="timeline-badge">
                        🧩
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-year">
                            SKILL
                        </div>
                        <h3>
                            보유 기술 스택 및 경험
                        </h3>
                        <p>
                            JAVA · JSP · Spring Boot · Vue · Vue2 · jQuery · Android · C#.NET · ASP · ProC · OpenAI API ·
                            CRUD ·
                            Batch · 관리자 페이지 · 인증 · 파일 업로드 · 엑셀 다운로드 · Oracle · PostgreSQL · MySQL · MSSQL · Linux · Git
                            형상관리 ·
                            AWS 배포
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- PDF 로딩 -->
    <div v-if="loading" class="loading-overlay">
        <div class="loading-box">
            <div class="spinner"></div>
            <div class="loading-text">
                PDF 다운로드 중...
            </div>
        </div>
    </div>
</template>

<script>
import '@/assets/css/views/MyPage.css'
import '@/assets/css/button.css'
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default {
    data() {
        return {
            loading: false
        }
    },

    methods: {
        async downloadPdf() {
            try {
                this.loading = true
                const element = this.$refs.timelineArea
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true
                })

                const imgData = canvas.toDataURL("image/png")
                const pdf = new jsPDF("p", "mm", "a4")
                const pdfWidth = 210
                const pdfHeight = 297
                const imgWidth = pdfWidth - 20

                const imgHeight = (canvas.height * imgWidth) / canvas.width
                let heightLeft = imgHeight
                let position = 0

                pdf.addImage(
                    imgData,
                    "PNG",
                    10,
                    position,
                    imgWidth,
                    imgHeight
                )

                heightLeft -= pdfHeight

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight
                    pdf.addPage()

                    pdf.addImage(
                        imgData,
                        "PNG",
                        10,
                        position,
                        imgWidth,
                        imgHeight
                    )

                    heightLeft -= pdfHeight
                }
                pdf.save("구진형_timeline.pdf")
            } finally {
                this.loading = false
            }
        }
    }
}
</script>
