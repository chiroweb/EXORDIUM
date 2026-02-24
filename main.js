/* ══════════════════════════════════════════════════
   EXORDIUM SIGNATURE HAEUNDAE — Interactions v3
   Landing Simplification + Subpage Null Guards
   ══════════════════════════════════════════════════ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Global Config ───
gsap.defaults({
    ease: 'power3.out',
    duration: 0.8
});

// 새로고침 시 항상 히어로 섹션(최상단)으로 강제 이동
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);


/* ══════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════ */

const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuItems = menuOverlay.querySelectorAll('.menu-overlay__item');
const menuFooter = menuOverlay.querySelector('.menu-overlay__footer');

// Nav — 아래로 스크롤: 배경 등장 / 위로 스크롤: 투명
ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
        if (self.scroll() <= 80) {
            nav.classList.remove('scrolled');
        } else if (self.direction === 1) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
});

// Initial states
gsap.set(menuItems, { opacity: 0, y: 28 });
gsap.set(menuFooter, { opacity: 0 });
menuItems.forEach(item => {
    const sub = item.querySelector('.menu-overlay__sub');
    if (sub) gsap.set(sub, { height: 0 });
});

// Menu open / close
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
            // 서브메뉴 초기화
            menuItems.forEach(item => {
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

// 호버: 소제목 슬라이드인
menuItems.forEach(item => {
    const sub = item.querySelector('.menu-overlay__sub');
    if (!sub) return;
    const lis = sub.querySelectorAll('li');

    item.addEventListener('mouseenter', () => {
        gsap.to(sub, { height: 'auto', paddingBottom: 10, duration: 0.38, ease: 'power3.out' });
        gsap.to(lis, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
    });

    item.addEventListener('mouseleave', () => {
        gsap.to(sub, { height: 0, paddingBottom: 0, duration: 0.28, ease: 'power2.in' });
        gsap.to(lis, { opacity: 0, x: -8, duration: 0.18, stagger: 0.02 });
    });
});

// 링크 클릭 시 메뉴 닫기
menuOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#') {
            e.preventDefault();
            return;
        }
        closeMenu();
    });
});


/* ══════════════════════════════════════════════════
   SECTION 01: HERO — Cinematic Interactions
   (Landing page only — guarded by curtain existence)
   ══════════════════════════════════════════════════ */

const curtain = document.getElementById('curtain');

if (curtain) {
    const curtainLeft = curtain.querySelector('.curtain__left');
    const curtainRight = curtain.querySelector('.curtain__right');
    const curtainBrand = curtain.querySelector('.curtain__brand');
    const curtainVideoL = document.getElementById('curtainVideoL');
    const curtainVideoR = document.getElementById('curtainVideoR');

    const heroLetters = document.querySelectorAll('.hero__letter');
    const heroGoldLine = document.getElementById('heroGoldLine');
    const heroTitleSub = document.getElementById('heroTitleSub');
    const heroVideo = document.querySelector('.hero__video');

    // ── 인트로 영상 재생 시간 (초) — 원하는 시간으로 조절 ──
    const INTRO_DURATION = 5;

    // 두 패널 영상 동시 재생 + 동기화
    function playIntroVideos() {
        if (curtainVideoL && curtainVideoR) {
            curtainVideoL.currentTime = 0;
            curtainVideoR.currentTime = 0;
            curtainVideoL.play().catch(() => {});
            curtainVideoR.play().catch(() => {});
        }
    }

    // 영상 재생 준비 후 시작, 실패해도 커튼 정상 동작
    window.addEventListener('load', () => {
        playIntroVideos();
        if (heroVideo) heroVideo.play().catch(() => {});
    });

    // Master entrance timeline — INTRO_DURATION 후 스플릿 시작
    const entranceTL = gsap.timeline({ delay: INTRO_DURATION });

    // Phase 1: Curtain brand text fade in (영상 끝 직전 오버레이)
    entranceTL.to(curtainBrand, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.inOut'
    });

    // Phase 2: Curtain brand text fade out
    entranceTL.to(curtainBrand, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
    }, '+=0.5');

    // Phase 3: Curtains split open — 영상이 두 쪽으로 찢어지며 히어로 등장
    entranceTL.to(curtainLeft, {
        xPercent: -100,
        duration: 1.2,
        ease: 'power4.inOut'
    }, '-=0.1');

    entranceTL.to(curtainRight, {
        xPercent: 100,
        duration: 1.2,
        ease: 'power4.inOut'
    }, '<');

    // Phase 4: Letter-by-letter stagger
    entranceTL.to(heroLetters, {
        opacity: 1,
        y: '0%',
        rotateX: 0,
        duration: 0.9,
        stagger: {
            each: 0.06,
            ease: 'power2.out'
        },
        ease: 'power3.out'
    }, '-=0.5');

    // Phase 5: Golden accent line draw
    entranceTL.to(heroGoldLine, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
    }, '-=0.3');

    entranceTL.to('.hero__gold-line line', {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: 'power2.inOut'
    }, '<');

    // Phase 6: Subtitle reveal
    entranceTL.to(heroTitleSub, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out'
    }, '-=0.3');

    // Phase 7: Hide curtain
    entranceTL.set(curtain, { display: 'none' });
}



/* ══════════════════════════════════════════════════
   SECTION 02: BUILDING REVEAL
   ══════════════════════════════════════════════════ */

function initBuildingReveal() {
    const section = document.querySelector('.br-section');
    if (!section) return;

    const buildingRise  = document.getElementById('brBuildingRise');
    const hotspots      = document.querySelectorAll('.br__hs');
    const hint          = document.getElementById('brHint');
    const infoPanels    = document.querySelectorAll('.br__info-panel');
    const titleLines    = section.querySelectorAll('.br__title-line');
    const titleEyebrow  = section.querySelector('.br__title-eyebrow');
    const titleSub      = section.querySelector('.br__title-sub');
    const popup         = document.getElementById('brPopup');
    const popupClose    = document.getElementById('brPopupClose');
    const popupFloor    = document.getElementById('brPopupFloor');
    const popupLabel    = document.getElementById('brPopupLabel');
    const popupDesc     = document.getElementById('brPopupDesc');
    const popupImgWrap  = document.getElementById('brPopupImgWrap');
    const popupImg      = document.getElementById('brPopupImg');

    if (!buildingRise) return;

    // ── 초기 상태 (CSS에서도 opacity:0이지만 GSAP 상태로도 명시) ──
    gsap.set(buildingRise, { yPercent: 105 });
    gsap.set(hotspots,     { opacity: 0, scale: 0 });
    gsap.set(hint,         { opacity: 0 });
    gsap.set(infoPanels,   { opacity: 0 });
    gsap.set(titleLines,   { yPercent: 120, opacity: 0 });
    if (titleEyebrow) gsap.set(titleEyebrow, { opacity: 0 });
    if (titleSub)     gsap.set(titleSub,     { opacity: 0 });

    ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        once: true,
        onEnter: () => {
            const tl = gsap.timeline();

            // 아이브로우
            if (titleEyebrow) tl.to(titleEyebrow, { opacity: 1, duration: 0.8 }, 0);

            // 타이틀 라인 클립 리빌
            titleLines.forEach((line, i) => {
                tl.to(line, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, 0.2 + i * 0.2);
            });

            // 서브 타이틀
            if (titleSub) tl.to(titleSub, { opacity: 1, duration: 0.8 }, 0.8);

            // 건물 상승 (0.7s 후, 2.4s)
            tl.to(buildingRise, { yPercent: 0, duration: 2.4, ease: 'power4.out' }, 0.7);

            // 정보 패널 등장 (좌우 동시, 건물 올라온 직후)
            tl.to(infoPanels, { opacity: 1, duration: 1.0, ease: 'power3.out', stagger: 0.12 }, 2.6);

            // 핫스팟 등장
            tl.to(hotspots, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.18, ease: 'back.out(1.7)' }, 4.0);

            // 힌트 텍스트
            if (hint) tl.to(hint, { opacity: 1, duration: 0.8 }, 4.4);
        }
    });

    // ── 핫스팟 클릭 → 팝업 ──
    if (!popup) return;
    let activeHs = null;

    hotspots.forEach(hs => {
        hs.addEventListener('click', e => {
            e.stopPropagation();
            if (activeHs === hs && popup.classList.contains('br__popup--open')) {
                closePopup();
                return;
            }
            activeHs = hs;
            openPopup(hs);
        });
    });

    if (popupClose) popupClose.addEventListener('click', e => {
        e.stopPropagation();
        closePopup();
    });

    document.addEventListener('click', e => {
        if (popup.classList.contains('br__popup--open') && !popup.contains(e.target)) {
            closePopup();
        }
    });

    function openPopup(hs) {
        const hsRect  = hs.getBoundingClientRect();
        const secRect = section.getBoundingClientRect();
        const cx = hsRect.left - secRect.left + hsRect.width  / 2;
        const cy = hsRect.top  - secRect.top  + hsRect.height / 2;
        const goRight = cx < section.offsetWidth * 0.55;

        popupFloor.textContent = hs.dataset.floor;
        popupLabel.textContent = hs.dataset.label;
        popupDesc.textContent  = hs.dataset.desc;

        // 이미지 처리
        if (hs.dataset.img) {
            popupImg.src = hs.dataset.img;
            popupImgWrap.style.display = '';
            popupImgWrap.classList.remove('br__popup-img-wrap--empty');
        } else {
            popupImg.src = '';
            popupImgWrap.style.display = '';
            popupImgWrap.classList.add('br__popup-img-wrap--empty');
        }

        popup.style.top       = cy + 'px';
        popup.style.left      = goRight ? (cx + 20) + 'px' : 'auto';
        popup.style.right     = goRight ? 'auto' : (section.offsetWidth - cx + 20) + 'px';
        popup.style.transform = 'translateY(-50%)';

        popup.classList.remove('br__popup--open');
        void popup.offsetWidth;
        popup.classList.add('br__popup--open');
    }

    function closePopup() {
        popup.classList.remove('br__popup--open');
        activeHs = null;
    }
}

initBuildingReveal();


/* ══════════════════════════════════════════════════
   SECTION 03: MEDIA FACADE — Text-as-Window + Scroll Reveal
   ══════════════════════════════════════════════════ */

const facadeSection = document.querySelector('.facade');

if (facadeSection) {
    const facadeVisual = document.getElementById('facadeVisual');
    const facadeVideo = document.querySelector('.facade__visual-video');
    const facadeLines = document.querySelectorAll('.facade__line');
    const facadeEyebrow = document.querySelector('.facade__eyebrow');
    const facadeDesc = document.querySelector('.facade__desc');
    const facadeOverline = document.querySelector('.facade__overline');

    // 초기 상태
    gsap.set(facadeEyebrow, { opacity: 0, y: 15 });
    gsap.set(facadeLines, { y: '120%' });
    gsap.set(facadeDesc, { opacity: 0, y: 20 });

    // ── STEP 1: 비디오 재생 (IntersectionObserver — pin 구조에서 안정적)
    if (facadeVideo) {
        const facadeVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    facadeVideo.play().catch(() => {});
                } else {
                    facadeVideo.pause();
                }
            });
        }, { threshold: 0.1 });
        facadeVideoObserver.observe(facadeSection);
    }

    // ── STEP 2: Pin
    ScrollTrigger.create({
        trigger: '.facade',
        start: 'top top',
        end: () => `+=${window.innerWidth * 1.7}`,
        pin: '.facade__pin-wrap',
        pinSpacing: true,
        invalidateOnRefresh: true
    });

    // ── STEP 3: Scrub 타임라인
    const facadeTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.facade',
            start: 'top top',
            end: () => `+=${window.innerWidth * 1.7}`,
            scrub: 0.8,
            invalidateOnRefresh: true
        }
    });

    // 0–50%: 박스 확장 — 오버라인은 비디오 뒤(z-index:0)라 자연히 가려짐
    facadeTl
        .to(facadeVisual, {
            top: '0%', left: '0%', right: '0%', bottom: '0%',
            borderRadius: '0px',
            duration: 0.50,
            ease: 'power2.inOut'
        }, 0);

    // 52–67%: 텍스트 등장
    facadeTl
        .to(facadeEyebrow, { opacity: 1, y: 0, duration: 0.08, ease: 'power3.out' }, 0.52)
        .to(facadeLines[0], { y: '0%', duration: 0.10, ease: 'power3.out' }, 0.55)
        .to(facadeLines[1], { y: '0%', duration: 0.10, ease: 'power3.out' }, 0.59)
        .to(facadeLines[2], { y: '0%', duration: 0.10, ease: 'power3.out' }, 0.63);

    // 67–87%: 윈도우 효과 (텍스트 fill → transparent)
    facadeTl
        .to(facadeLines[0], { webkitTextFillColor: 'rgba(255,255,255,0)', duration: 0.20, ease: 'none' }, 0.67)
        .to(facadeLines[1], { webkitTextFillColor: 'rgba(255,255,255,0)', duration: 0.20, ease: 'none' }, 0.70)
        .to(facadeLines[2], { webkitTextFillColor: 'rgba(255,255,255,0)', duration: 0.20, ease: 'none' }, 0.73);

    // 82–98%: 설명 텍스트
    facadeTl
        .to(facadeDesc, { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.82);
}


/* ══════════════════════════════════════════════════
   SECTION 04: COMMUNITY — Bento Grid Reveal
   ══════════════════════════════════════════════════ */

const communityCells = document.querySelectorAll('.community__cell');

if (communityCells.length > 0) {
    gsap.set(communityCells, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set('.community__cell img', { scale: 1.06 });

    ScrollTrigger.create({
        trigger: '.community',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.to(communityCells, {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.0,
                ease: 'power4.out',
                stagger: { amount: 0.55, from: 'start' }
            });

            gsap.to('.community__cell img', {
                scale: 1.0,
                duration: 1.4,
                ease: 'power3.out',
                stagger: { amount: 0.55, from: 'start' }
            });
        }
    });

    gsap.set('.community__overlay-eyebrow', { opacity: 0, y: 10 });
    gsap.set('.community__overlay-line', { opacity: 0, y: 24 });

    ScrollTrigger.create({
        trigger: '.community',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.to('.community__overlay-eyebrow', {
                opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.5
            });
            gsap.to('.community__overlay-line', {
                opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.65
            });
        }
    });

    // ── Hover interactions — 은은한 이미지 zoom + 패럴랙스 + spotlight dim
    communityCells.forEach(cell => {
        const img = cell.querySelector('img');
        const label = cell.querySelector('.community__label');

        // Mouse parallax — quickTo for snappy feel
        const moveX = gsap.quickTo(img, 'x', { duration: 0.6, ease: 'power2.out' });
        const moveY = gsap.quickTo(img, 'y', { duration: 0.6, ease: 'power2.out' });

        cell.addEventListener('mouseenter', () => {
            // 이미지만 살짝 zoom — 셀은 고정 (overflow:hidden으로 클립)
            gsap.to(img, { scale: 1.07, duration: 0.6, ease: 'power2.out' });

            // 라벨 gold 하이라이트
            gsap.to(label, { color: '#C8A97E', duration: 0.35, ease: 'power2.out' });

            // Spotlight: 나머지 셀 은은하게 dim
            communityCells.forEach(s => {
                if (s !== cell) gsap.to(s, { opacity: 0.72, duration: 0.45, ease: 'power2.out' });
            });
        });

        cell.addEventListener('mousemove', (e) => {
            const rect = cell.getBoundingClientRect();
            const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            moveX(dx * -6);
            moveY(dy * -6);
        });

        cell.addEventListener('mouseleave', () => {
            gsap.to(img, { scale: 1, x: 0, y: 0, duration: 0.7, ease: 'power2.out' });
            gsap.to(label, { color: 'rgba(245,240,235,0.55)', duration: 0.35, ease: 'power2.out' });
            communityCells.forEach(s => gsap.to(s, { opacity: 1, duration: 0.5, ease: 'power2.out' }));
        });
    });
}


/* ══════════════════════════════════════════════════
   SECTION 05: LOCATION & LIFE — Marquee + Card Slider
   ══════════════════════════════════════════════════ */

// Card Slider
const locationTrack = document.getElementById('locationSliderTrack');
const locationPrev = document.getElementById('locationPrev');
const locationNext = document.getElementById('locationNext');
const locationCurrentEl = document.getElementById('locationCurrent');

if (locationTrack && locationPrev && locationNext) {
    const TOTAL_PAGES = 2; // 4 cards, 2 visible at a time
    let currentPage = 0;

    function updateSlider() {
        const gap = parseFloat(getComputedStyle(locationTrack).gap) || 16;
        const cardWidth = locationTrack.parentElement.offsetWidth;
        const offset = currentPage * (cardWidth + gap);
        locationTrack.style.transform = `translateX(-${offset}px)`;

        if (locationCurrentEl) locationCurrentEl.textContent = currentPage + 1;
        locationPrev.disabled = currentPage === 0;
        locationNext.disabled = currentPage === TOTAL_PAGES - 1;
    }

    locationPrev.addEventListener('click', () => {
        if (currentPage > 0) { currentPage--; updateSlider(); }
    });

    locationNext.addEventListener('click', () => {
        if (currentPage < TOTAL_PAGES - 1) { currentPage++; updateSlider(); }
    });

    updateSlider();
}

// Marquee entrance
gsap.from('.location-life__marquee', {
    opacity: 0,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '.location-life',
        start: 'top 70%',
        once: true
    }
});

// Background video — play only when section is visible
const bgVideo = document.querySelector('.location-life__bg-video');
if (bgVideo) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                bgVideo.play().catch(() => { });
            } else {
                bgVideo.pause();
            }
        });
    }, { threshold: 0.2 });
    videoObserver.observe(document.querySelector('.location-life'));
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
   INITIAL LOAD
   ══════════════════════════════════════════════════ */

window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// Handle resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});


/* ══════════════════════════════════════════════════
   동호수 배치도 — Interactive Unit Layout Grid
   ══════════════════════════════════════════════════ */

function initUnitLayout() {
    const building = document.getElementById('ulBuilding');
    if (!building) return;

    // 호수별 타입: 1호~2호=84A, 3호=59, 4~6호=84B
    const UNIT_TYPES = ['84A', '84A', '59', '84B', '84B', '84B'];

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

        // 공동주택 — 아이보리 라이트 테마
        if (outer) outer.classList.add('ul-building-light');
        if (rf) rf.style.display = '';
        buildDualGrid();
    }

    /* ── 101·102동 나란히 렌더 ── */
    function buildDualGrid() {
        function floorRowsHTML(dong) {
            let h = '';
            // 호수 헤더
            h += '<div class="ul-header-row">';
            h += '<div class="ul-floor-label"></div>';
            for (let u = 1; u <= 6; u++) h += `<div class="ul-header-ho">${u}호</div>`;
            h += '</div>';
            // 층
            for (let f = 32; f >= 1; f--) {
                if (f === 3 || f === 2) continue;
                if (f === 14) {
                    h += `<div class="ul-floor-row" data-zone="refuge">
                        <div class="ul-floor-label">14F</div>
                        <div class="ul-refuge-cell" style="font-size:8px">피난안전구역</div></div>`;
                } else if (f === 4) {
                    h += `<div class="ul-floor-row" data-zone="base">
                        <div class="ul-floor-label" style="font-size:6px">2~4F</div>
                        <div class="ul-merged-cell ul-merged-cell--podium" style="font-size:8px;padding:0 4px">생활형숙박시설 / 근린생활시설 / 커뮤니티</div></div>`;
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
            <div class="ul-dual-dong-hd">101동<em>162세대</em></div>
            <div class="ul-type-badges">
              <span class="ul-tbadge ul-tbadge--84A">84A</span>
              <span class="ul-tbadge ul-tbadge--59">59</span>
              <span class="ul-tbadge ul-tbadge--84B">84B</span>
            </div>
            <div class="ul-dual-dong-hd">102동<em>162세대</em></div>
          </div>
          <div class="ul-dual-grids">
            <div class="ul-sub-grid">${floorRowsHTML('101')}</div>
            <div class="ul-dual-sep"></div>
            <div class="ul-sub-grid">${floorRowsHTML('102')}</div>
          </div>
        </div>`;

        applyRangeFilter(currentRange);
        attachUnitListeners();
    }

    function buildZoneDiagram() {
        building.innerHTML = `
        <div class="ul-zone-diagram">
          <div class="ul-zone-grid">
            <!-- 고층부 -->
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
            <!-- 14F 피난 -->
            <div class="ul-zrefuge">14F 피난</div>
            <div class="ul-zrefuge">14F 피난</div>
            <div class="ul-zrefuge">14F 피난</div>
            <!-- 중층부 -->
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
            <!-- 저층부 full-span -->
            <div class="ul-zfull ul-zfull--podium">저층부 (2~4F) : 근린생활시설 / 숙박시설 (단일 동 연결)</div>
            <!-- 필로티 full-span -->
            <div class="ul-zfull ul-zfull--piloti">1F : 필로티</div>
            <!-- 동 라벨 -->
            <div class="ul-zlabel"><strong>101동</strong><span>공동주택</span></div>
            <div class="ul-zlabel"><strong>102동</strong><span>공동주택</span></div>
            <div class="ul-zlabel"><strong>103동</strong><span>숙박시설</span></div>
          </div>
          <!-- 범례 -->
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
            ${typeName ? `<div class="ul-info__type-badge ul-info__type-badge--${typeName}">${typeName} 타입</div>` : ''}
            <br>
            <a href="plans.html#units" class="ul-info__link">평면도 보기 →</a>
        `;

        panel.hidden = false;
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 동 탭 전환
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

    // 층수 범위 필터
    document.querySelectorAll('.ul-range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ul-range-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRange = btn.dataset.range;
            applyRangeFilter(currentRange);
        });
    });

    // 정보 패널 닫기
    const closeBtn = document.getElementById('ulInfoClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (selectedUnit) { selectedUnit.classList.remove('selected'); selectedUnit = null; }
            document.getElementById('ulInfo').hidden = true;
        });
    }

    // 리사이즈 시 필터 재적용
    window.addEventListener('resize', () => applyRangeFilter(currentRange));

    // 초기 렌더
    buildGrid(currentDong);
}

initUnitLayout();
