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

    const heroLetters = document.querySelectorAll('.hero__letter');
    const heroGoldLine = document.getElementById('heroGoldLine');
    const heroTitleSub = document.getElementById('heroTitleSub');
    const heroVideo = document.querySelector('.hero__video');

    // Master entrance timeline
    const entranceTL = gsap.timeline({ delay: 0.3 });

    // Phase 1: Curtain brand text fade in
    entranceTL.to(curtainBrand, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut'
    });

    // Phase 2: Curtain brand text fade out
    entranceTL.to(curtainBrand, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
    }, '+=0.3');

    // Phase 3: Curtains split open
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


    // Phase 8: Hide curtain
    entranceTL.set(curtain, { display: 'none' });

    // Hero video autoplay on load
    window.addEventListener('load', () => {
        if (heroVideo) {
            heroVideo.play().catch(() => { });
        }
    });
}


/* ══════════════════════════════════════════════════
   SECTION 02: PROJECT — Horizontal Scroll
   ══════════════════════════════════════════════════ */

const projectHorizontal = document.getElementById('projectHorizontal');
const projectPanels = document.querySelectorAll('.project__panel');
const totalPanels = projectPanels.length;

if (projectHorizontal && totalPanels > 0) {

    // ① Pin — 가로 스크롤 완료 후 70vh 더 유지 (Panel 2에서 자연스럽게 머물다가 넘어감)
    ScrollTrigger.create({
        trigger: '.project',
        start: 'top top',
        end: () => `+=${window.innerWidth * (totalPanels - 1) + window.innerHeight * 0.7}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
    });

    // ② 가로 이동 애니메이션 — 원래 거리에서 완료, 이후 Panel 2에서 정지
    gsap.to(projectHorizontal, {
        xPercent: -((totalPanels - 1) * 100 / totalPanels),
        ease: 'none',
        scrollTrigger: {
            trigger: '.project',
            start: 'top top',
            end: () => `+=${window.innerWidth * (totalPanels - 1)}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
        }
    });

    // Panel 1: Story — line reveal
    const projectLines = document.querySelectorAll('.project__heading .line');
    projectLines.forEach((line, i) => {
        ScrollTrigger.create({
            trigger: '.project',
            start: 'top 80%',
            onEnter: () => {
                gsap.to(line, {
                    clipPath: 'inset(0 0% 0 0)',
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: 'power3.out'
                });
            },
            once: true
        });
    });

    // Panel 1: Body reveal
    gsap.from('.project__body', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        scrollTrigger: {
            trigger: '.project__body',
            start: 'top 85%',
            once: true
        }
    });

    // Panel 2: Facts stagger reveal — horizontal scroll progress 연동
    const projectFacts = document.querySelectorAll('.project__fact');
    if (projectFacts.length > 0) {
        gsap.set(projectFacts, { opacity: 0, x: 30 });
        let factsRevealed = false;
        ScrollTrigger.create({
            trigger: '.project',
            start: 'top top',
            end: () => `+=${window.innerWidth * (totalPanels - 1)}`,
            onUpdate: (self) => {
                if (!factsRevealed && self.progress >= 0.45) {
                    factsRevealed = true;
                    gsap.to(projectFacts, {
                        opacity: 1,
                        x: 0,
                        duration: 0.7,
                        ease: 'power3.out',
                        stagger: 0.12
                    });
                }
            }
        });
    }
}


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
        end: () => `+=${window.innerWidth}`,
        pin: '.facade__pin-wrap',
        pinSpacing: true,
        invalidateOnRefresh: true
    });

    // ── STEP 3: Scrub 타임라인
    const facadeTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.facade',
            start: 'top top',
            end: () => `+=${window.innerWidth}`,
            scrub: 0.6,
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
