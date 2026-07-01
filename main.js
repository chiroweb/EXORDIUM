/* ══════════════════════════════════════════════════
   EXORDIUM SIGNATURE HAEUNDAE — Interactions
   ══════════════════════════════════════════════════ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

gsap.defaults({
    ease: 'power3.out',
    duration: 0.8
});

/* ══════════════════════════════════════════════════
   MOBILE / DESKTOP 완전 분리 게이트
   모바일에서는 pin/scrub 스크롤 엔진을 절대 생성하지 않고,
   이산(discrete) 슬라이드 엔진(하단 initMobileSlides)만 가동한다.
   ══════════════════════════════════════════════════ */
const MOBILE_QUERY = '(max-width: 768px)';
const IS_MOBILE = window.matchMedia(MOBILE_QUERY).matches;
const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 브레이크포인트를 가로지르면(회전 제외한 실제 폭 변화) 엔진이 달라지므로
// 깨끗한 상태를 위해 1회 리로드. (실사용자는 phone↔desktop 전환이 없음)
window.matchMedia(MOBILE_QUERY).addEventListener('change', () => {
    window.location.reload();
});

// 모바일: 히어로 입장(약 1.5s) 동안 자유 스크롤을 막기 위해 첫 페인트부터 잠금.
// (#mSlides 규칙은 wrapper 생성 전까지 무효이므로 높이는 그대로 유지됨)
if (IS_MOBILE && document.getElementById('heroSeq')) {
    document.documentElement.classList.add('m-slides-active');
    document.documentElement.style.setProperty('--app-h', window.innerHeight + 'px');
}

// 새로고침 시 최상단 강제 이동
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);


/* ══════════════════════════════════════════════════
   LENIS — Virtual Smooth Scroll (전역)
   scrub: 1.8 의 관성감은 Lenis Lerp + GSAP scrub 조합으로 생성
   ══════════════════════════════════════════════════ */

let lenis;
if (!IS_MOBILE) {
    lenis = new Lenis({
        duration: 1.1,
        wheelMultiplier: document.getElementById('heroSeq') ? 0.7 : 1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
} else {
    // 모바일: Lenis 미생성 (터치 리스너 충돌 방지). scrollTo만 안전하게 shim.
    lenis = { scrollTo() {}, on() {}, raf() {} };
}


/* ══════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════ */

// 로고 클릭 — 랜딩 페이지: 최상단 스크롤 / 세부 페이지: index.html 이동
const navLogo = document.querySelector('.nav__logo');
const isLanding = !!document.getElementById('heroSeq');
if (navLogo && isLanding) {
    navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.2 });
    });
}

const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuCloseBtn = document.getElementById('menuOverlayClose');
const menuItems = menuOverlay.querySelectorAll('.menu-overlay__item');
const menuFooter = menuOverlay.querySelector('.menu-overlay__footer');

// 초기 상태: 페이지 로드 시 히어로(다크 섹션)에 있으므로 dark
nav.classList.add('nav--dark');

const darkSectionIds = ['heroSeq'];

// 데스크탑 전용: 스크롤 위치 기반 nav 다크/frosted 토글.
// 모바일은 스크롤이 잠기므로 슬라이드 컨트롤러가 슬라이드별로 nav--dark를 직접 제어한다.
if (!IS_MOBILE) {
    ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: () => {
            const navH = 60;
            let isDark = false;
            darkSectionIds.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                if (rect.top <= navH && rect.bottom > navH) isDark = true;
            });
            nav.classList.toggle('nav--dark', isDark);

            // 스크롤 시 frosted glass 적용 (다크 섹션 제외)
            const scrollY = window.scrollY || window.pageYOffset;
            if (!isDark && scrollY > 40) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });
}

gsap.set(menuItems, { opacity: 0, y: 28 });
gsap.set(menuFooter, { opacity: 0 });
menuItems.forEach(item => {
    const sub = item.querySelector('.menu-overlay__sub');
    if (sub) gsap.set(sub, { height: 0 });
});

let menuOpen = false;

function openMenu() {
    menuOpen = true;
    menuBtn.classList.add('active');
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    gsap.to(menuItems, {
        opacity: 1, y: 0,
        duration: 0.55,
        stagger: 0.04,
        ease: 'power3.out',
        delay: 0.05
    });
    gsap.to(menuFooter, {
        opacity: 1,
        duration: 0.4,
        delay: 0.38,
        ease: 'power2.out'
    });
}

function closeMenu() {
    menuOpen = false;
    menuBtn.classList.remove('active');

    gsap.to([...menuItems, menuFooter], {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
            menuOverlay.classList.remove('open');
            document.body.style.overflow = '';
            gsap.set(menuItems, { y: 28 });
            menuItems.forEach(item => {
                item.classList.remove('is-open');
                const sub = item.querySelector('.menu-overlay__sub');
                const lis = item.querySelectorAll('.menu-overlay__sub li');
                if (sub) gsap.set(sub, { height: 0, paddingBottom: 0 });
                if (lis.length) gsap.set(lis, { opacity: 0, x: -8 });
            });
        }
    });
}

menuBtn.addEventListener('click', () => {
    if (menuOpen) closeMenu();
    else openMenu();
});

if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeMenu);
}

menuItems.forEach(item => {
    const sub = item.querySelector('.menu-overlay__sub');
    if (!sub) return;
    const lis = sub.querySelectorAll('li');
    const title = item.querySelector('.menu-overlay__title');
    if (!title) return;

    item.classList.add('menu-overlay__item--has-sub');

    title.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = item.classList.contains('is-open');

        // 다른 열린 항목 닫기
        menuItems.forEach(other => {
            if (other !== item && other.classList.contains('is-open')) {
                other.classList.remove('is-open');
                const otherSub = other.querySelector('.menu-overlay__sub');
                const otherLis = other.querySelectorAll('.menu-overlay__sub li');
                if (otherSub) gsap.to(otherSub, { height: 0, paddingBottom: 0, duration: 0.25, ease: 'power2.in' });
                if (otherLis.length) gsap.set(otherLis, { opacity: 0, x: -8 });
            }
        });

        if (isOpen) {
            item.classList.remove('is-open');
            gsap.to(sub, { height: 0, paddingBottom: 0, duration: 0.28, ease: 'power2.in' });
            gsap.to(lis, { opacity: 0, x: -8, duration: 0.18, stagger: 0.02 });
        } else {
            item.classList.add('is-open');
            gsap.to(sub, { height: 'auto', paddingBottom: 14, duration: 0.38, ease: 'power3.out' });
            gsap.to(lis, { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
        }
    });
});

menuOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#') {
            e.preventDefault();
            return;
        }
        // 서브 항목이 있는 상위 타이틀은 아코디언 토글만 — 메뉴 닫지 않음
        if (link.classList.contains('menu-overlay__title') && link.closest('.menu-overlay__item--has-sub')) {
            return;
        }
        closeMenu();
    });
});


/* ══════════════════════════════════════════════════
   HERO SEQUENCE
   Phase 1: Masked Reverse Reveal + Container Mask Shrink
   Phase 2: Staggered Masked Text Reveal (s2)
   Phase 3: Container Mask Expansion
   ══════════════════════════════════════════════════ */

function initHeroSequence() {
    const seq = document.getElementById('heroSeq');
    if (!seq) return;

    const hvm      = document.getElementById('hvm');
    const vidA     = document.getElementById('hvmVidA');
    const vidB     = document.getElementById('hvmVidB');
    const overlay  = hvm.querySelector('.hvm__overlay');

    const htContainer = seq.querySelector('.ht');
    const htEye    = seq.querySelector('.ht__eye');
    const htLines  = seq.querySelectorAll('.ht__line');
    const htSub    = seq.querySelector('.ht__sub');

    const hs2Lines = seq.querySelectorAll('.hs2__line');
    const hs2Sub   = seq.querySelector('.hs2__sub');
    const hs2Body  = seq.querySelector('.hs2__body');
    const hs2Inner = seq.querySelector('.hs2__inner');

    // ── "Your Signature, Your Ocean" 한 글자씩 왼쪽에서 등장 ──
    const subText = htSub.textContent;
    htSub.innerHTML = [...subText].map(c =>
        `<span class="ht__char" style="display:inline-block">${c === ' ' ? '\u00A0' : c}</span>`
    ).join('');
    const htChars = htSub.querySelectorAll('.ht__char');

    // vidB: autoplay로 브라우저가 즉시 decode 시작, JS에서 즉시 숨김 (CSS opacity:0 제거)
    gsap.set(vidB, { opacity: 0 });

    // ── 초기 상태: 히어로 텍스트 baseline 아래 대기 ──
    gsap.set([htEye, ...htLines], { yPercent: 110 });
    gsap.set(htChars, { opacity: 0 });
    gsap.set(hs2Lines, { yPercent: 110 });
    gsap.set(hs2Sub,  { yPercent: 110 });
    gsap.set(hs2Body, { opacity: 0, y: 12 });
    gsap.set(hs2Inner, { opacity: 1 });

    // ── 입장 애니메이션: 타이틀은 아래에서, 서브는 왼쪽에서 한 글자씩 ──
    const entrance = gsap.timeline({ delay: 0.25 });
    entrance
        .to(htEye,    { yPercent: 0, duration: 1.0, ease: 'power3.out' }, 0)
        .to(htLines,  { yPercent: 0, duration: 1.2, ease: 'power3.out' }, 0.12)
        .to(htChars,  { opacity: 1, duration: 0.05, stagger: 0.04, ease: 'none' }, 0.55);

    // ── 입장 완료 후 초기화 ──
    entrance.eventCallback('onComplete', () => {
        if (IS_MOBILE) {
            // 모바일: pin/scrub 없이 타임라인만 paused로 구성 → 이산 슬라이드 엔진에 위임
            const heroTL = buildHeroTimeline();
            const bldgTL = initBldgSeq();   // 모바일: paused 타임라인 반환
            initBldgPopup();
            initMobileSlides({ heroTL, bldgTL });
        } else {
            // 데스크탑: 기존 pin/scrub 시퀀스 그대로
            // heroSeq pin spacer가 생성된 뒤 bldgSeq를 초기화해야 위치가 올바르게 계산됨
            initScrollTL();
            // RAF 1: heroSeq pin spacer가 DOM에 삽입된 뒤 bldgSeq 등록
            requestAnimationFrame(() => {
                initBldgSeq();
                initBldgPopup();
                // RAF 2: bldgSeq spacer까지 DOM 반영 완료 후 전체 위치 재계산
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });
        }
    });

    // ── 히어로 스크롤 타임라인의 트윈 정의 (데스크탑·모바일 공용) ──
    // 데스크탑은 ScrollTrigger가 progress를 scrub, 모바일은 tweenTo로 시간재생.
    function addHeroTweens(tl) {
        // ── 영상 스왑(0.35) 직전: 히어로 텍스트 mask reveal 퇴장 ──
        tl
            .fromTo(htEye,      { yPercent: 0 }, { yPercent: 110, duration: 0.04, ease: 'power2.in' }, 0.31)
            .fromTo(htLines[0], { yPercent: 0 }, { yPercent: 110, duration: 0.04, ease: 'power2.in' }, 0.32)
            .fromTo(htSub,      { yPercent: 0 }, { yPercent: 110, duration: 0.04, ease: 'power2.in' }, 0.31);

        // ── ht 컨테이너 완전 소멸 — 잔여물 방지 안전망 ──
        tl.fromTo(htContainer,
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.01, ease: 'none' },
            0.36
        );

        // ── Phase 1 (0→0.60): Container Mask Shrink — vmask left: 0% → 75% ──
        tl.fromTo(hvm,
            { left: '0%' },
            { left: '75%', duration: 0.72, ease: 'power2.inOut' },
            0
        );

        // ── Phase 1.5 (0.30→0.38): overlay 감소 (패널 상태) ──
        tl.fromTo(overlay,
            { opacity: 1 },
            { opacity: 0.08, duration: 0.08, ease: 'none' },
            0.30
        );

        // ── Phase 1.5 (0.36): 영상 스왑 A → B ──
        tl.to(vidA, { opacity: 0, duration: 0.05, ease: 'none' }, 0.35);
        tl.to(vidB, { opacity: 1, duration: 0.05, ease: 'none' }, 0.35);

        // ── Phase 2 (0.42→0.62): Staggered Masked Text Reveal — s2 텍스트 등장 ──
        tl
            .fromTo(hs2Lines[0], { yPercent: 110 }, { yPercent: 0, duration: 0.18, ease: 'power3.out' }, 0.42)
            .fromTo(hs2Sub,      { yPercent: 110 }, { yPercent: 0, duration: 0.14, ease: 'power3.out' }, 0.50)
            .fromTo(hs2Body,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' },
                0.58
            );

        // ── Phase 3 (0.68→1.18): Container Mask Expansion — vmask left: 75% → 0% ──
        tl.to(hvm,
            { left: '0%', duration: 0.60, ease: 'power2.inOut' },
            0.68
        );

        // Phase 3: overlay 복귀 (풀스크린 영상이 되면서 어두워짐)
        tl.to(overlay, { opacity: 0.32, duration: 0.20, ease: 'none' }, 0.74);

        // Hold zone
        tl.to({}, { duration: 0.25 });
        return tl;
    }

    // 모바일: pin/scrub 없이 paused 타임라인만 반환
    function buildHeroTimeline() {
        return addHeroTweens(gsap.timeline({ paused: true }));
    }

    // 데스크탑: 기존 pin + scrub + snap 시퀀스
    function initScrollTL() {
        const SCROLL_SPACE = window.innerHeight * 3.2;

        let heroLastSnap = 0;
        const HERO_SNAPS = [0, 0.42, 0.84, 1];

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: seq,
                start: 'top top',
                end: `+=${SCROLL_SPACE}`,
                pin: true,
                scrub: 1.5,
                snap: {
                    snapTo: (progress) => {
                        const idx = HERO_SNAPS.indexOf(heroLastSnap);
                        if (idx === -1) return HERO_SNAPS[0];
                        if (progress > heroLastSnap + 0.03) {
                            return HERO_SNAPS[Math.min(idx + 1, HERO_SNAPS.length - 1)];
                        }
                        if (progress < heroLastSnap - 0.03) {
                            return HERO_SNAPS[Math.max(idx - 1, 0)];
                        }
                        return heroLastSnap;
                    },
                    duration: { min: 0.4, max: 1.2 },
                    delay: 0.08,
                    ease: 'power2.inOut',
                },
                onUpdate: (self) => {
                    for (const p of HERO_SNAPS) {
                        if (Math.abs(self.progress - p) < 0.015) {
                            heroLastSnap = p;
                            break;
                        }
                    }
                },
                onSnapComplete: () => {
                    lenis.scrollTo(window.scrollY, { immediate: true });
                },
                invalidateOnRefresh: true,
            }
        });

        addHeroTweens(tl);
    }
}

initHeroSequence();


/* ══════════════════════════════════════════════════
   MOBILE SLIDE ENGINE — 이산(discrete) 풀페이지 슬라이드
   모바일 전용. 스와이프 → 섹션 자석 등장 → 배정된 인터랙션
   2초 자동재생 → 다시 스와이프 가능. 데스크탑 스크럽과 완전 분리.
   ══════════════════════════════════════════════════ */

function initMobileSlides({ heroTL, bldgTL }) {
    const heroSeq  = document.getElementById('heroSeq');
    const bldgSeq  = document.getElementById('bldgSeq');
    const locBrief = document.getElementById('locBrief');
    const footer   = document.querySelector('.footer');
    if (!heroSeq) return;

    // ── 1) 슬라이드 섹션을 고정 wrapper로 이동 ──
    const wrap = document.createElement('div');
    wrap.id = 'mSlides';
    const sections = [heroSeq, bldgSeq, locBrief, footer].filter(Boolean);
    heroSeq.parentNode.insertBefore(wrap, heroSeq);
    sections.forEach(s => wrap.appendChild(s));
    document.documentElement.classList.add('m-slides-active');

    // 팝업은 transform된 wrap 안에 있으면 position:fixed가 wrap 기준이 되어
    // 화면 밖으로 나간다 → body로 빼내 뷰포트 기준 고정 유지.
    const bpopEl = document.getElementById('bpop');
    if (bpopEl) document.body.appendChild(bpopEl);
    const popupOpen = () => bpopEl && bpopEl.classList.contains('is-open');

    const idxOf = (el) => sections.indexOf(el);

    // ── 2) 높이 표준: --app-h = 실측 innerHeight (모든 기종 대응) ──
    function setAppH() {
        document.documentElement.style.setProperty('--app-h', window.innerHeight + 'px');
    }
    setAppH();

    // ── 3) STOP 정의 — 한 스와이프 = 한 섹션 전체가 2초 안에 완전히 등장 ──
    // 섹션을 잘게 쪼개면 '안 바뀌는데 멈춤' 오해가 생기므로 섹션당 1스톱으로 통합.
    // 히어로만 예외: 인트로(로드 시 이미 표시) + 두 번째 히어로(패널 축소+재확장을
    //   한 번에 연속 재생, 반쪽 검은 패널 정지 없음) 2스톱.
    // 빌딩/로케이션/푸터: 각각 1스톱, 진입하면 그 섹션의 모든 연출이 2초 내 캐스케이드.
    const HERO_PROG = [0, 1.0];
    const BLDG_PROG = [1.0];       // 0→1.0 전체(커튼·타이틀·건물·핫스팟)를 2초에 한 번에
    const STOPS = [];
    HERO_PROG.forEach(p => STOPS.push({ sec: idxOf(heroSeq), tl: heroTL, prog: p }));
    if (bldgTL && bldgSeq) BLDG_PROG.forEach(p => STOPS.push({ sec: idxOf(bldgSeq), tl: bldgTL, prog: p }));
    if (locBrief) STOPS.push({ sec: idxOf(locBrief), kind: 'loc' });
    if (footer)   STOPS.push({ sec: idxOf(footer),   kind: 'footer' });

    // 섹션 배경 밝기 → nav 다크 여부
    const SEC_DARK = {};
    SEC_DARK[idxOf(heroSeq)] = true;              // #0D0D0D
    if (bldgSeq)  SEC_DARK[idxOf(bldgSeq)]  = false;  // 베이지
    if (locBrief) SEC_DARK[idxOf(locBrief)] = true;   // #0D0D0D
    if (footer)   SEC_DARK[idxOf(footer)]   = true;   // surface-dark

    // ── 4) 상태 & 타이밍 ──
    let cur = 0;
    let locked = true;
    const AUTOPLAY = PREFERS_REDUCED ? 0.01 : 2.0;   // 인터랙션 자동재생 ≈ 2초
    const T_DUR   = PREFERS_REDUCED ? 0.01 : 0.9;    // 섹션 자석 이동
    const T_DELAY = PREFERS_REDUCED ? 0.0  : 0.5;    // 이동 중 콘텐츠 재생 겹침

    if (footer) gsap.set(footer, { autoAlpha: 0 });

    function translateTo(sec, animate) {
        const y = -sec * window.innerHeight;
        if (animate) gsap.to(wrap, { y, duration: T_DUR, ease: 'power3.inOut' });
        else gsap.set(wrap, { y });
    }

    function applyNav(sec) {
        if (typeof nav === 'undefined' || !nav) return;
        const dark = !!SEC_DARK[sec];
        nav.classList.toggle('nav--dark', dark);
        // 밝은 슬라이드에서는 frosted glass 배경으로 가독성 확보
        nav.classList.toggle('scrolled', !dark);
    }

    function unlock() { locked = false; }

    function playContent(to, secChanged) {
        applyNav(to.sec);
        if (to.tl) {
            // 섹션 전체 연출을 일관되게 2초에 캐스케이드 (같은 섹션 전환도 동일)
            to.tl.tweenTo(to.tl.duration() * to.prog, {
                duration: AUTOPLAY, ease: 'power2.inOut', onComplete: unlock,
            });
        } else if (to.kind === 'loc') {
            if (typeof locEnter === 'function') locEnter();
            gsap.delayedCall(AUTOPLAY, unlock);
        } else if (to.kind === 'footer') {
            gsap.fromTo(footer, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: PREFERS_REDUCED ? 0.01 : 0.9, ease: 'power3.out' });
            gsap.delayedCall(PREFERS_REDUCED ? 0.02 : 1.0, unlock);
        } else {
            unlock();
        }
    }

    let watchdog = null;
    function goTo(target) {
        if (locked) return;
        target = Math.max(0, Math.min(STOPS.length - 1, target));
        if (target === cur) return;
        const from = STOPS[cur];
        const to   = STOPS[target];
        const secChanged = to.sec !== from.sec;
        locked = true;
        cur = target;

        // 실패-안전장치: 어떤 콜백이 누락돼도 최대 시간 후 반드시 잠금 해제
        if (watchdog) watchdog.kill();
        watchdog = gsap.delayedCall(AUTOPLAY + T_DELAY + 1.2, unlock);

        if (secChanged) {
            translateTo(to.sec, true);
            gsap.delayedCall(T_DELAY, () => playContent(to, true));
        } else {
            playContent(to, false);
        }
    }

    // ── 5) 입력: 현재 슬라이드가 내부 스크롤 가능한지 판단 ──
    function scrollEl() {
        const el = sections[STOPS[cur].sec];
        return el && el.scrollHeight > el.clientHeight + 4 ? el : null;
    }
    function atEdge(el, dir) {
        // dir < 0: 다음(위로 스와이프), dir > 0: 이전(아래로 스와이프)
        if (!el) return true;
        if (dir < 0) return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        return el.scrollTop <= 0;
    }

    // 터치
    let ty = 0, tt = 0;
    wrap.addEventListener('touchstart', (e) => {
        ty = e.touches[0].clientY; tt = Date.now();
    }, { passive: true });

    wrap.addEventListener('touchmove', (e) => {
        if (popupOpen()) return;
        if (locked) { e.preventDefault(); return; }
        const el = scrollEl();
        if (!el) { e.preventDefault(); return; }
        const dy = e.touches[0].clientY - ty;
        // 내부 스크롤 경계에서만 네이티브 스크롤 차단
        if ((dy < 0 && atEdge(el, -1)) || (dy > 0 && atEdge(el, 1))) e.preventDefault();
    }, { passive: false });

    wrap.addEventListener('touchend', (e) => {
        if (locked || popupOpen()) return;
        const dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dy) < 40) return;   // 탭/미세 이동만 무시 (느린 스와이프도 인정)
        const el = scrollEl();
        if (dy < 0) { if (atEdge(el, -1)) goTo(cur + 1); }
        else        { if (atEdge(el, 1))  goTo(cur - 1); }
    }, { passive: true });

    // 휠 (좁은 뷰포트 데스크탑 테스트/트랙패드)
    let wheelLock = false;
    wrap.addEventListener('wheel', (e) => {
        if (popupOpen()) return;
        const el = scrollEl();
        if (el && !atEdge(el, e.deltaY > 0 ? -1 : 1)) return;   // 내부 스크롤 우선
        e.preventDefault();
        if (locked || wheelLock || Math.abs(e.deltaY) < 12) return;
        wheelLock = true;
        gsap.delayedCall(0.9, () => { wheelLock = false; });
        goTo(cur + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    // 키보드 (테스트/접근성)
    window.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(cur + 1); }
        if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(cur - 1); }
    });

    // 로고 → 첫 슬라이드
    if (typeof navLogo !== 'undefined' && navLogo) {
        navLogo.addEventListener('click', (e) => { e.preventDefault(); goTo(0); }, true);
    }

    // 리사이즈/회전: 높이 재동기 + 현재 위치 재정렬
    let rz;
    window.addEventListener('resize', () => {
        clearTimeout(rz);
        rz = setTimeout(() => { setAppH(); translateTo(STOPS[cur].sec, false); }, 150);
    });

    // ── 6) 초기화 ──
    translateTo(0, false);
    applyNav(0);
    locked = false;   // 히어로 입장(entrance)은 이미 끝난 시점 → 스와이프 허용
}


/* ══════════════════════════════════════════════════
   BUILDING SECTION
   Scroll-driven: Black fade → Lines → Text → Building rise → Side info → Hotspots
   ══════════════════════════════════════════════════ */

function initBldgSeq() {
    const seq = document.getElementById('bldgSeq');
    if (!seq) return;

    const curtainT  = document.getElementById('bldgCurtainT');
    const curtainB  = document.getElementById('bldgCurtainB');
    const lines     = seq.querySelectorAll('.bldg-line');
    const preTitle  = seq.querySelector('.bpt__line--title');
    const preSub    = seq.querySelector('.bpt__line--sub');
    const imgWrap   = document.getElementById('bldgImgWrap');
    const sideL     = seq.querySelectorAll('#bldgSideL .bs__label, #bldgSideL .bs__value, #bldgSideL .bs__desc');
    const sideR     = seq.querySelectorAll('#bldgSideR .bs__label, #bldgSideR .bs__value, #bldgSideR .bs__desc');
    const hotspots  = seq.querySelectorAll('.bhs');
    const pretext   = document.getElementById('bldgPretext');

    // ── 초기 상태 ──
    gsap.set(curtainT, { y: '0%' });
    gsap.set(curtainB, { y: '0%' });
    gsap.set(lines,    { scaleY: 0 });
    gsap.set([preTitle, preSub], { yPercent: 110 });
    gsap.set(hotspots, { scale: 0 });
    gsap.set([...sideL, ...sideR], { yPercent: 110 });
    gsap.set(imgWrap,  { xPercent: -50, y: '60vh', opacity: 0 });
    const isMobilePretext = window.matchMedia('(max-width: 768px)').matches;
    gsap.set(pretext,  { xPercent: -50, yPercent: isMobilePretext ? -56 : 0 });

    const SCROLL_SPACE = window.innerHeight * 5.0;

    let bldgLastSnap = 0;
    const BLDG_SNAPS = [0, 0.36, 0.55, 0.82, 1];

    // 모바일: pin/scrub 없이 paused 타임라인. 데스크탑: 기존 ScrollTrigger.
    const tl = IS_MOBILE
        ? gsap.timeline({ paused: true })
        : gsap.timeline({
            scrollTrigger: {
                trigger: seq,
                start: 'top top',   // 섹션이 뷰포트를 완전히 덮은 직후 고정
                end: `+=${SCROLL_SPACE}`,
                pin: true,
                scrub: 1.5,
                onUpdate: (self) => {
                    for (const p of BLDG_SNAPS) {
                        if (Math.abs(self.progress - p) < 0.015) {
                            bldgLastSnap = p;
                            break;
                        }
                    }
                },
                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });

    // Phase 1 (0→0.28): 커튼 위아래로 열림
    tl.to(curtainT, { y: '-100%', duration: 0.28, ease: 'power2.inOut' }, 0);
    tl.to(curtainB, { y: '100%',  duration: 0.28, ease: 'power2.inOut' }, 0);

    // Phase 2 (0.22→0.50): 라인 드로잉
    tl
        .to(lines[0], { scaleY: 1, duration: 0.22, ease: 'power2.inOut' }, 0.22)
        .to(lines[1], { scaleY: 1, duration: 0.22, ease: 'power2.inOut' }, 0.27)
        .to(lines[2], { scaleY: 1, duration: 0.22, ease: 'power2.inOut' }, 0.32);

    // Phase 3 (0.36→0.56): 텍스트 스태거드 리빌
    tl
        .fromTo(preTitle, { yPercent: 110 }, { yPercent: 0, duration: 0.16, ease: 'power3.out' }, 0.36)
        .fromTo(preSub,   { yPercent: 110 }, { yPercent: 0, duration: 0.12, ease: 'power3.out' }, 0.49);

    // Phase 4 (0.52→0.78): 건물 이미지 상승 + 페이드인
    tl.fromTo(imgWrap,
        { y: '60vh', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.30, ease: 'power2.out' },
        0.52
    );

    // Phase 5 (0.68→0.82): 사이드 인포 리빌
    const sideAll = [...sideL, ...sideR];
    sideAll.forEach((el, i) => {
        tl.fromTo(el,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.13, ease: 'power3.out' },
            0.68 + i * 0.03
        );
    });

    // Phase 6 (0.82→0.97): 핫스팟 팝인
    hotspots.forEach((hs, i) => {
        tl.to(hs,
            { scale: 1, duration: 0.11, ease: 'back.out(2.8)' },
            0.82 + i * 0.03
        );
    });

    // Hold zone: 애니메이션 완료 후 추가 스크롤 여유 공간
    tl.to({}, { duration: 0.27 });

    return tl;   // 모바일 슬라이드 엔진이 tweenTo로 구동
}

/* ══════════════════════════════════════════════════
   BUILDING POPUP — 홀로그램 팝업 (클릭 드리븐)
   3단계: 커넥터 라인 → 박스 확장 → 콘텐츠 페이드인
   ══════════════════════════════════════════════════ */

function initBldgPopup() {
    const seq = document.getElementById('bldgSeq');
    if (!seq) return;

    const S3 = 'https://chiro-web.s3.ap-northeast-2.amazonaws.com/other/public/';
    const POPUP_DATA = [
        {
            floor: 'FACADE SYSTEM',
            name: 'BIPV 스마트 커튼월',
            nameEn: 'SMART CURTAIN WALL',
            desc: '국내 최초의 BIPV(RE100 태양광발전, 미디어파사드 송출) 스마트 커튼월 시스템으로 엑소디움 시그니처 해운대를 포함 전체 랜드마크의 웅장함을 주변 5KM이내에서도 느끼실 수 있습니다.',
            img: S3 + '%E1%84%80%E1%85%A5%E1%86%AB%E1%84%86%E1%85%AE%E1%86%AF_%E1%84%90%E1%85%AE%E1%84%89%E1%85%B5%E1%84%8B%E1%85%A3%E1%84%80%E1%85%A7%E1%86%BC.webp',
            side: 'left',
        },
        {
            floor: 'ROOFTOP',
            name: '루프탑 인피니티풀',
            nameEn: 'ROOFTOP INFINITY POOL',
            desc: '국내 최고층 루프탑 인피니티풀로 송정의 수평선과 맞닿은 핫 플레이스로서 입주민 특별할인 혜택으로 이용을 하실 수 있습니다.',
            img: S3 + '%E1%84%89%E1%85%AE%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%8C%E1%85%A1%E1%86%BC1%20%E1%84%89%E1%85%A1%E1%84%85%E1%85%A1%E1%86%B7%20%E1%84%8C%E1%85%AE%E1%84%80%E1%85%A7%E1%86%BC.webp',
            side: 'left',
        },
        {
            floor: '2 – 4F',
            name: '윈덤호텔 직영 시설',
            nameEn: 'WYNDHAM HOTEL AMENITY',
            desc: '윈덤호텔 직영 대형 부페식당, 사우나, 연회장을 입주민 특별 할인혜택으로 이용하실 수 있습니다.',
            img: S3 + '%E1%84%92%E1%85%A9%E1%84%90%E1%85%A6%E1%86%AF%E1%84%85%E1%85%A1%E1%84%8B%E1%85%AE%E1%86%AB%E1%84%8C%E1%85%B5.webp',
            side: 'left',
        },
        {
            floor: 'FULL TOWER',
            name: '프리미엄 창호 & AI 스마트',
            nameEn: 'PREMIUM WINDOW · AI SYSTEM',
            desc: '엑소디움 브랜드에 걸맞는 최고급 창호 및 오션과 시티뷰를 극대화 하기위한 슬림 프레임을 적용할 예정이고, AI 스마트 시스템으로 간편하게 세대의 환기, 냉,난방을 컨트롤 할 수 있는 최첨단 제품이 시공될 예정입니다.',
            img: S3 + '%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%86%E1%85%A7%E1%86%AB%20%E1%84%80%E1%85%B3%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%B8%E1%84%90%E1%85%AE%E1%84%89%E1%85%B5%20%E1%84%8B%E1%85%A3%E1%84%80%E1%85%A7%E1%86%BC%20%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.webp',
            side: 'right',
        },
        {
            floor: '1 – 32F',
            name: '고속 엘리베이터',
            nameEn: 'HIGH-SPEED ELEVATOR',
            desc: '4대의 고속 엘리베이터를 적용하여 고층부, 저층부를 존으로 나누어 입주민들의 이용에 편리함을 더하고, 이사전용 엘리베이터 1대를 별도로 운영하여 전입 전출세대 이사일에 불편함 자체를 없앴습니다.',
            img: S3 + '%E1%84%80%E1%85%A5%E1%86%AB%E1%84%86%E1%85%AE%E1%86%AF_%E1%84%90%E1%85%AE%E1%84%89%E1%85%B5%E1%84%8C%E1%85%AE%E1%84%80%E1%85%A7%E1%86%BC.webp',
            side: 'right',
        },
        {
            floor: 'B1 – B2',
            name: '입주민 커뮤니티',
            nameEn: 'RESIDENT COMMUNITY',
            desc: '아파트 입주민 전용 커뮤니티시설을 아파트 각 동의 지하에 배치하여 피트니스 시설과 접객공간 및 카페시설을 운영할 예정으로 엑소디움 시그니처 해운대만의 고급스러움을 더할 예정입니다.',
            img: S3 + '%E1%84%8F%E1%85%A5%E1%84%86%E1%85%B2%E1%84%82%E1%85%B5%E1%84%90%E1%85%B5-3f-render.webp',
            side: 'right',
        },
    ];

    // 첫 탭에서 이미지 공백이 보이지 않도록 미리 로드
    POPUP_DATA.forEach((item) => {
        const preloadImg = new Image();
        preloadImg.src = item.img;
    });

    const popup      = document.getElementById('bpop');
    const popupBox   = document.getElementById('bpopBox');
    const content    = document.getElementById('bpopContent');
    const connLine   = document.getElementById('bpopLine');
    const scanline   = popup.querySelector('.bpop__scanline');

    let activeIdx  = -1;
    let scanTL     = null;

    function openPopup(hs, idx) {
        if (activeIdx === idx) { closePopup(); return; }
        if (activeIdx !== -1) closePopup(true);

        activeIdx = idx;
        const data = POPUP_DATA[idx];

        // 위치 계산
        const hsRect  = hs.getBoundingClientRect();
        const seqRect = seq.getBoundingClientRect();
        const hsX = hsRect.left - seqRect.left + hsRect.width  / 2;
        const hsY = hsRect.top  - seqRect.top  + hsRect.height / 2;

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const popW = isMobile ? Math.min(seq.offsetWidth - 20, 520) : 480;
        const popH = isMobile ? 460 : 530;

        let pX, pY;
        if (isMobile) {
            // 모바일에서는 CSS 하단 고정 레이아웃 사용
            popup.style.left = '';
            popup.style.top = '';
            popup.style.width = '';
        } else {
            const EDGE_MARGIN = 48;
            if (data.side === 'left') {
                pX = EDGE_MARGIN;
            } else {
                pX = seq.offsetWidth - popW - EDGE_MARGIN;
            }
            pY = Math.max(12, Math.min(hsY - popH / 2, seq.offsetHeight - popH - 12));
            popup.style.left = pX + 'px';
            popup.style.top = pY + 'px';
            popup.style.width = popW + 'px';
        }
        popup.classList.add('is-open');

        // 이미지 교체
        const popImg = document.getElementById('bpopImg');
        if (popImg) { popImg.src = data.img; popImg.alt = data.name; }

        // 커넥터 라인 좌표
        let len = 0;
        if (!isMobile) {
            const lineEndX = data.side === 'left' ? pX + popW : pX;
            const lineEndY = pY + popH / 2;
            len = Math.hypot(lineEndX - hsX, lineEndY - hsY);
            connLine.setAttribute('x1', hsX);
            connLine.setAttribute('y1', hsY);
            connLine.setAttribute('x2', lineEndX);
            connLine.setAttribute('y2', lineEndY);
            connLine.setAttribute('stroke-dasharray', len);
            connLine.setAttribute('stroke-dashoffset', len);
        } else {
            gsap.set(connLine, { opacity: 0 });
        }

        // 팝업 콘텐츠
        content.innerHTML = `
            <div class="bpop__floor">${data.floor}</div>
            <div class="bpop__name">${data.name}</div>
            <span class="bpop__name-en">${data.nameEn}</span>
            <div class="bpop__desc">${data.desc.replaceAll('\n', '<br>')}</div>
        `;

        // 3단계 애니메이션
        const tl = gsap.timeline();

        // Step 1: 커넥터 라인 드로잉
        gsap.set(connLine, { strokeDashoffset: len, opacity: isMobile ? 0 : 1 });
        tl.to(popup, { opacity: 1, duration: 0.01 }, 0);
        if (!isMobile) {
            tl.to(connLine, { strokeDashoffset: 0, duration: 0.32, ease: 'power2.out' }, 0);
        }

        // Step 2: 박스 확장
        gsap.set(popupBox, { scaleY: 0, transformOrigin: 'top left' });
        tl.to(popupBox, { scaleY: 1, duration: 0.28, ease: 'power3.out' }, 0.24);

        // Step 3: 콘텐츠 페이드인
        gsap.set(content, { opacity: 0 });
        tl.to(content, { opacity: 1, duration: 0.22, ease: 'power2.out' }, 0.44);

        // 스캔라인 애니메이션
        if (scanTL) scanTL.kill();
        gsap.set(scanline, { top: 0, opacity: 1 });
        scanTL = gsap.to(scanline, {
            top: '100%', opacity: 0, duration: 2.2, ease: 'none',
            repeat: -1, repeatDelay: 0.5
        });
    }

    function closePopup(instant = false) {
        if (activeIdx === -1) return;
        activeIdx = -1;
        popup.classList.remove('is-open');
        if (scanTL) { scanTL.kill(); scanTL = null; }

        if (instant) {
            gsap.set(popup, { opacity: 0 });
            gsap.set(popupBox, { scaleY: 0 });
            gsap.set(content, { opacity: 0 });
            gsap.set(connLine, { strokeDashoffset: parseFloat(connLine.getAttribute('stroke-dasharray') || 0) });
            return;
        }

        gsap.to(popup, {
            opacity: 0, duration: 0.18, ease: 'power2.in',
            onComplete: () => {
                gsap.set(popupBox, { scaleY: 0 });
                gsap.set(content, { opacity: 0 });
            }
        });
        gsap.to(connLine, {
            strokeDashoffset: parseFloat(connLine.getAttribute('stroke-dasharray') || 300),
            duration: 0.18, ease: 'power2.in'
        });
    }

    // 초기 상태
    gsap.set(popup,   { opacity: 0 });
    gsap.set(popupBox, { scaleY: 0 });
    gsap.set(content, { opacity: 0 });

    // 이벤트
    seq.querySelectorAll('.bhs').forEach((hs, i) => {
        hs.addEventListener('click', (e) => { e.stopPropagation(); openPopup(hs, i); });
    });
    popup.addEventListener('click', (e) => e.stopPropagation());
    seq.addEventListener('click', () => closePopup());
}

/* ══════════════════════════════════════════════════
   SMOOTH SCROLL TO ANCHORS
   ══════════════════════════════════════════════════ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: y, behavior: 'smooth' });
    });
});


/* ══════════════════════════════════════════════════
   SUBPAGE — Tab Navigation
   ══════════════════════════════════════════════════ */

function initSubpageTabs() {
    const tabs = document.querySelectorAll('.subpage-tab');
    const sections = document.querySelectorAll('.tab-section');
    if (!tabs.length || !sections.length) return;

    function activateTab(hash) {
        const id = (hash || '').replace('#', '') || tabs[0]?.dataset?.tab;
        if (!id) return;
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
        sections.forEach(s => s.classList.toggle('active', s.id === 'tab-' + id));
    }

    activateTab(window.location.hash);
    window.addEventListener('hashchange', () => activateTab(window.location.hash));
}

initSubpageTabs();


/* ══════════════════════════════════════════════════
   동호수 배치도 — Interactive Unit Layout Grid
   ══════════════════════════════════════════════════ */

function initUnitLayout() {
    const building = document.getElementById('ulBuilding');
    if (!building) return;

    const UNIT_TYPES = ['84A', '59', '59', '84A', '84B', '84B'];

    const TYPE_INFO = {
        '84A': { area: '84.99㎡', rooms: '방 3 · 욕실 2', plan: 'plans.html#units' },
        '59':  { area: '59.97㎡', rooms: '방 2 · 욕실 1', plan: 'plans.html#units' },
        '84B': { area: '84.96㎡', rooms: '방 3 · 욕실 2', plan: 'plans.html#units' },
    };

    let currentDong = 'apt';
    let currentRange = 'high';
    let selectedUnit = null;

    function buildGrid(dong) {
        building.innerHTML = '';
        const rf = document.querySelector('.ul-range-filter');
        const outer = building.closest('.ul-building-outer');

        if (dong === '103') {
            buildZoneDiagram();
            if (rf) rf.style.display = 'none';
            if (outer) outer.classList.remove('ul-building-light');
            return;
        }

        if (outer) outer.classList.add('ul-building-light');
        if (rf) rf.style.display = '';
        buildDualGrid();
    }

    function buildDualGrid() {
        function floorRowsHTML(dong) {
            let h = '';
            h += '<div class="ul-header-row">';
            h += '<div class="ul-floor-label"></div>';
            for (let u = 1; u <= 6; u++) h += `<div class="ul-header-ho">${u}호</div>`;
            h += '</div>';
            for (let f = 32; f >= 1; f--) {
                if (f === 2) continue;
                if (f === 14) {
                    h += `<div class="ul-floor-row" data-zone="refuge">
                        <div class="ul-floor-label">14F</div>
                        <div class="ul-refuge-cell" style="font-size:8px">피난안전구역</div></div>`;
                } else if (f === 4) {
                    h += `<div class="ul-floor-row" data-zone="base">
                        <div class="ul-floor-label">4F</div>
                        <div class="ul-merged-cell ul-merged-cell--empty"></div></div>`;
                } else if (f === 3) {
                    h += `<div class="ul-floor-row" data-zone="base">
                        <div class="ul-floor-label">2~3F</div>
                        <div class="ul-merged-cell ul-merged-cell--podium">생활형숙박시설 · 근린생활시설 · 커뮤니티</div></div>`;
                } else if (f === 1) {
                    h += `<div class="ul-floor-row" data-zone="base">
                        <div class="ul-floor-label">1F</div>
                        <div class="ul-merged-cell ul-merged-cell--piloti">필로티</div></div>`;
                } else {
                    const zone = f >= 15 ? 'high' : 'mid';
                    let cells = `<div class="ul-floor-label">${f}F</div>`;
                    for (let u = 1; u <= 6; u++) {
                        const unitNum = f * 100 + u;
                        const typeName = UNIT_TYPES[u - 1];
                        cells += `<div class="ul-unit ul-unit--apt"
                            data-unit="${unitNum}" data-floor="${f}"
                            data-ho="${u}" data-dong="${dong}" data-type="${typeName}"
                            title="${dong}동 ${unitNum}호 · ${typeName}타입">${unitNum}</div>`;
                    }
                    h += `<div class="ul-floor-row" data-zone="${zone}">${cells}</div>`;
                }
            }
            return h;
        }

        building.innerHTML = `
        <div class="ul-dual-wrap">
          <div class="ul-dual-headers">
            <div class="ul-dual-dong-hd">101 · 102동<em>각 162세대 · 동일 구조</em></div>
            <div class="ul-type-badges">
              <span class="ul-tbadge ul-tbadge--84A">84A</span>
              <span class="ul-tbadge ul-tbadge--59">59</span>
              <span class="ul-tbadge ul-tbadge--84B">84B</span>
            </div>
          </div>
          <div class="ul-dual-grids">
            <div class="ul-sub-grid">${floorRowsHTML('101')}</div>
          </div>
        </div>`;

        applyRangeFilter(currentRange);
        attachUnitListeners();
    }

    function buildZoneDiagram() {
        building.innerHTML = `
        <div class="ul-zone-diagram">
          <div class="ul-zone-grid">
            <div class="ul-zblock ul-zblock--apt-high">
              <div class="ul-zblock__sub">고층부</div>
              <div class="ul-zblock__range">15~32F</div>
              <div class="ul-zblock__use">공동주택</div>
            </div>
            <div class="ul-zblock ul-zblock--apt-high">
              <div class="ul-zblock__sub">고층부</div>
              <div class="ul-zblock__range">15~32F</div>
              <div class="ul-zblock__use">공동주택</div>
            </div>
            <div class="ul-zblock ul-zblock--hotel-high">
              <div class="ul-zblock__sub">고층부</div>
              <div class="ul-zblock__range">15~32F</div>
              <div class="ul-zblock__use">숙박시설</div>
            </div>
            <div class="ul-zrefuge">14F 피난</div>
            <div class="ul-zrefuge">14F 피난</div>
            <div class="ul-zrefuge">14F 피난</div>
            <div class="ul-zblock ul-zblock--apt-mid">
              <div class="ul-zblock__sub">중층부</div>
              <div class="ul-zblock__range">5~13F</div>
              <div class="ul-zblock__use">공동주택</div>
            </div>
            <div class="ul-zblock ul-zblock--apt-mid">
              <div class="ul-zblock__sub">중층부</div>
              <div class="ul-zblock__range">5~13F</div>
              <div class="ul-zblock__use">공동주택</div>
            </div>
            <div class="ul-zblock ul-zblock--hotel-mid">
              <div class="ul-zblock__sub">중층부</div>
              <div class="ul-zblock__range">5~13F</div>
              <div class="ul-zblock__use">숙박시설</div>
            </div>
            <div class="ul-zfull ul-zfull--podium">저층부 (2~4F) : 근린생활시설 / 숙박시설 (단일 동 연결)</div>
            <div class="ul-zfull ul-zfull--piloti">1F : 필로티</div>
            <div class="ul-zlabel"><strong>101동</strong><span>공동주택</span></div>
            <div class="ul-zlabel"><strong>102동</strong><span>공동주택</span></div>
            <div class="ul-zlabel"><strong>103동</strong><span>숙박시설</span></div>
          </div>
          <div class="ul-zlegend">
            <span class="ul-zleg-item"><i class="ul-zleg-i ul-zleg-i--apt"></i>공동주택</span>
            <span class="ul-zleg-item"><i class="ul-zleg-i ul-zleg-i--hotel"></i>숙박시설</span>
            <span class="ul-zleg-item"><i class="ul-zleg-i ul-zleg-i--refuge"></i>피난안전구역</span>
            <span class="ul-zleg-item"><i class="ul-zleg-i ul-zleg-i--podium"></i>저층부 (근생/숙박)</span>
          </div>
          <p class="ul-zdisclaimer">상기내용은 사업인허가 과정에서 변경될 수 있음</p>
        </div>`;
    }

    function applyRangeFilter(range) {
        if (window.innerWidth > 768) {
            building.querySelectorAll('.ul-floor-row').forEach(r => r.style.display = '');
            return;
        }
        building.querySelectorAll('.ul-floor-row').forEach(row => {
            const zone = row.dataset.zone;
            if (zone === 'refuge' || zone === 'base') {
                row.style.display = '';
            } else if (range === 'high') {
                row.style.display = (zone === 'high') ? '' : 'none';
            } else {
                row.style.display = (zone === 'mid') ? '' : 'none';
            }
        });
    }

    function attachUnitListeners() {
        building.querySelectorAll('.ul-unit--apt').forEach(cell => {
            cell.addEventListener('click', () => handleUnitClick(cell));
        });
    }

    function handleUnitClick(cell) {
        if (selectedUnit === cell) {
            selectedUnit.classList.remove('selected');
            selectedUnit = null;
            document.getElementById('ulInfo').hidden = true;
            return;
        }
        if (selectedUnit) selectedUnit.classList.remove('selected');
        selectedUnit = cell;
        cell.classList.add('selected');
        showInfoPanel(cell);
    }

    function showInfoPanel(cell) {
        const unitNum  = cell.dataset.unit;
        const floor    = cell.dataset.floor;
        const ho       = cell.dataset.ho;
        const dong     = cell.dataset.dong;
        const typeName = cell.dataset.type;
        const info     = TYPE_INFO[typeName] || {};

        const panel = document.getElementById('ulInfo');
        const body  = document.getElementById('ulInfoBody');

        body.innerHTML = `
            <div class="ul-info__unit-num">${dong}동 ${unitNum}호</div>
            <div class="ul-info__meta">
                <span class="ul-info__meta-item">층<strong>${floor}F</strong></span>
                <span class="ul-info__meta-item">호수<strong>${ho}호</strong></span>
                ${info.area  ? `<span class="ul-info__meta-item">전용면적<strong>${info.area}</strong></span>`  : ''}
                ${info.rooms ? `<span class="ul-info__meta-item">구조<strong>${info.rooms}</strong></span>` : ''}
            </div>
            <div class="ul-info__bottom">
                ${typeName ? `<div class="ul-info__type-badge ul-info__type-badge--${typeName}">${typeName} 타입</div>` : ''}
                <a href="plans.html#units" class="ul-info__link">평면도 보기 →</a>
            </div>
        `;

        panel.hidden = false;
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    document.querySelectorAll('.ul-dong-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ul-dong-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentDong = tab.dataset.dong;
            if (selectedUnit) { selectedUnit.classList.remove('selected'); selectedUnit = null; }
            document.getElementById('ulInfo').hidden = true;
            buildGrid(currentDong);
        });
    });

    document.querySelectorAll('.ul-range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ul-range-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRange = btn.dataset.range;
            applyRangeFilter(currentRange);
        });
    });

    const closeBtn = document.getElementById('ulInfoClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (selectedUnit) { selectedUnit.classList.remove('selected'); selectedUnit = null; }
            document.getElementById('ulInfo').hidden = true;
        });
    }

    window.addEventListener('resize', () => applyRangeFilter(currentRange));

    buildGrid(currentDong);
}

initUnitLayout();


/* ══════════════════════════════════════════════════
   LOCATION BRIEF — 지도 + 위치정보 섹션 애니메이션
   ══════════════════════════════════════════════════ */

function initLocBrief() {
    const section = document.getElementById('locBrief');
    if (!section) return;

    const mapWrap = section.querySelector('.loc-map-wrap');
    // mapImg 제거 — iframe으로 교체되어 scale 애니메이션 불필요
    const eyebrow = section.querySelector('.loc-brief__eyebrow');
    const title   = section.querySelector('.loc-brief__title');
    const addr    = section.querySelector('.loc-brief__addr');
    const rules   = section.querySelectorAll('.loc-brief__rule');
    const groups  = section.querySelectorAll('.loc-brief__group');
    const cta     = section.querySelector('.loc-brief__cta');
    const locVid  = document.getElementById('locBriefVid');

    // ── 초기 상태 ──
    gsap.set(mapWrap, { clipPath: 'inset(0 0 100% 0)', y: 24 });
    gsap.set([eyebrow, title, addr, cta], { y: 36, opacity: 0 });
    gsap.set(rules,   { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(groups,  { y: 22, opacity: 0 });

    let revealed = false;

    function playReveal() {
        if (revealed) return;
        revealed = true;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // 지도 카드: 커튼 올리기 + y 정착
        tl.to(mapWrap, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.1 }, 0);

        // 텍스트: y + opacity 페이드업
        tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.6 }, 0.28);
        tl.to(title,   { y: 0, opacity: 1, duration: 0.75 }, 0.4);
        tl.to(addr,    { y: 0, opacity: 1, duration: 0.55 }, 0.52);
        tl.to(rules,   { scaleX: 1, duration: 0.5, stagger: 0.1 }, 0.5);
        tl.to(groups,  { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 0.58);
        tl.to(cta,     { y: 0, opacity: 1, duration: 0.5 }, 0.88);
    }

    // 섹션 진입 시 실행 (데스크탑=ScrollTrigger, 모바일=슬라이드 컨트롤러가 호출)
    function enter() {
        // 배경 영상 lazy load + 재생
        if (locVid) { locVid.load(); locVid.play(); }
        gsap.delayedCall(0.2, playReveal);
    }

    if (!IS_MOBILE) {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 30%',
            once: true,
            onEnter: enter,
        });
    }

    return enter;
}

// 모바일 슬라이드 엔진이 로케이션 진입 시 호출할 수 있도록 보관
const locEnter = initLocBrief();


/* ══════════════════════════════════════════════════
   FLOATING CTAs — 관심고객 등록 + 분양홍보관 위치
   히어로 섹션 진입 후 페이드인, 이후 화면 고정 추적
   ══════════════════════════════════════════════════ */

function initFloatCTAs() {
    const reg = document.getElementById('fctaRegister');
    const loc = document.getElementById('flocBtn');
    if (!reg && !loc) return;

    const elems = [reg, loc].filter(Boolean);

    // 히어로 섹션 진입 시 표시 (heroSeq 상단이 뷰포트 안으로 들어오면)
    const heroSeq = document.getElementById('heroSeq');
    const trigger = heroSeq || document.body;

    if (IS_MOBILE) {
        // 스크롤 잠금 상태이므로 히어로 입장 후 직접 표시
        elems.forEach((el, i) => {
            gsap.delayedCall(1.6 + i * 0.12, () => el.classList.add('is-visible'));
        });
    } else {
        ScrollTrigger.create({
            trigger,
            start: 'top 60%',
            onEnter: () => {
                elems.forEach((el, i) => {
                    gsap.delayedCall(i * 0.12, () => el.classList.add('is-visible'));
                });
            },
        });
    }

    // 약도 모달
    const modal    = document.getElementById('yakdoModal');
    const backdrop = document.getElementById('yakdoBackdrop');
    const closeBtn = document.getElementById('yakdoClose');
    if (!modal || !loc) return;

    function openYakdo() {
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeYakdo() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    loc.addEventListener('click', openYakdo);
    backdrop.addEventListener('click', closeYakdo);
    closeBtn.addEventListener('click', closeYakdo);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeYakdo();
    });
}

initFloatCTAs();


/* ══════════════════════════════════════════════════
   BACKGROUND MUSIC — 자동재생 + ON/OFF 토글
   ══════════════════════════════════════════════════ */

function initMusicPlayer() {
    const audio    = document.getElementById('bgMusic');
    const btn      = document.getElementById('musicBtn');
    const mobileBtn = document.getElementById('musicBtnMobile');
    const stateEl  = document.getElementById('musicState');
    const stateElMobile = document.getElementById('musicStateMobile');
    if (!audio || !btn || !stateEl) return;

    audio.volume = 0.45;

    let isPlaying = false;
    let interactionPending = false; // 자동재생 차단 → 첫 클릭 대기

    function setPlaying(playing) {
        isPlaying = playing;
        stateEl.textContent = playing ? 'ON' : 'OFF';
        if (stateElMobile) stateElMobile.textContent = playing ? 'ON' : 'OFF';
        btn.classList.toggle('is-playing', playing);
        btn.classList.toggle('is-muted', !playing);
    }

    function toggleMusic(e) {
        if (e) e.stopPropagation();

        // 자동재생 대기 중이었다면 취소 (첫 클릭은 토글로 사용)
        if (interactionPending) {
            interactionPending = false;
        }

        if (isPlaying) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().then(() => setPlaying(true)).catch(() => {});
        }
    }

    // 자동재생 시도
    const autoplayPromise = audio.play();
    if (autoplayPromise !== undefined) {
        autoplayPromise
            .then(() => {
                setPlaying(true);
            })
            .catch(() => {
                // 브라우저 자동재생 정책으로 차단 → 첫 번째 사용자 인터랙션에서 재생
                setPlaying(false);
                interactionPending = true;

                function tryAutoplay() {
                    if (!interactionPending) return;
                    audio.play()
                        .then(() => {
                            interactionPending = false;
                            setPlaying(true);
                            document.removeEventListener('click', tryAutoplay, true);
                            document.removeEventListener('touchstart', tryAutoplay, true);
                        })
                        .catch(() => {});
                }

                document.addEventListener('click', tryAutoplay, true);
                document.addEventListener('touchstart', tryAutoplay, true);
            });
    }

    // 버튼 토글
    btn.addEventListener('click', toggleMusic);
    if (mobileBtn) mobileBtn.addEventListener('click', toggleMusic);
}

initMusicPlayer();

/* ══════════════════════════════════════════════════
   PREMIUM — Editorial Reveal
   ══════════════════════════════════════════════════ */
function initPremEditorial() {
    const lines = document.querySelectorAll('.prem-editorial__line');
    if (!lines.length) return;

    lines.forEach((line, i) => {
        gsap.set(line, { y: '110%' });
        ScrollTrigger.create({
            trigger: line,
            start: 'top 88%',
            onEnter: () => {
                gsap.to(line, {
                    y: '0%',
                    duration: 0.9,
                    delay: (i % 2) * 0.1,
                    ease: 'power3.out'
                });
            },
            once: true
        });
    });

    const collage = document.querySelector('.prem-editorial__collage');
    if (collage) {
        gsap.set(collage, { opacity: 0, y: 40 });
        ScrollTrigger.create({
            trigger: collage,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(collage, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });
            },
            once: true
        });
    }
}

initPremEditorial();

/* ══════════════════════════════════════════════════
   PAGE-WIDE — Image Reveal (subpage)
   ══════════════════════════════════════════════════ */
function initImgReveal() {
    // gallery items (cinematic gallery)
    const galleryItems = document.querySelectorAll('[data-gallery]');
    galleryItems.forEach((el, i) => {
        gsap.set(el, { opacity: 0, y: 32 });
        ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(el, {
                    opacity: 1,
                    y: 0,
                    duration: 1.1,
                    delay: (i % 3) * 0.13,
                    ease: 'power3.out',
                    onComplete: () => el.classList.add('is-revealed')
                });
            },
            once: true
        });
    });

    // 4-column feature card images
    const featImgs = document.querySelectorAll('.prem-feat-card__img');
    featImgs.forEach((img, i) => {
        gsap.set(img, { opacity: 0, y: 24 });
        ScrollTrigger.create({
            trigger: img,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(img, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    delay: i * 0.1,
                    ease: 'power3.out'
                });
            },
            once: true
        });
    });

    // panoramic divider
    const dividerImg = document.querySelector('.prem-divider__img');
    if (dividerImg) {
        gsap.set(dividerImg, { opacity: 0, scale: 1.04 });
        ScrollTrigger.create({
            trigger: dividerImg,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(dividerImg, {
                    opacity: 1,
                    scale: 1,
                    duration: 1.4,
                    ease: 'power3.out'
                });
            },
            once: true
        });
    }
}

initImgReveal();


/* ══════════════════════════════════════════════════
   INITIAL LOAD
   ══════════════════════════════════════════════════ */

window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});
