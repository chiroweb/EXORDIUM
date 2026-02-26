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

// 새로고침 시 최상단 강제 이동
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);


/* ══════════════════════════════════════════════════
   LENIS — Virtual Smooth Scroll (전역)
   scrub: 1.8 의 관성감은 Lenis Lerp + GSAP scrub 조합으로 생성
   ══════════════════════════════════════════════════ */

const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


/* ══════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════ */

const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuItems = menuOverlay.querySelectorAll('.menu-overlay__item');
const menuFooter = menuOverlay.querySelector('.menu-overlay__footer');

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

    const htEye    = seq.querySelector('.ht__eye');
    const htLines  = seq.querySelectorAll('.ht__line');
    const htSub    = seq.querySelector('.ht__sub');

    const hs2Lines = seq.querySelectorAll('.hs2__line');
    const hs2Body  = seq.querySelector('.hs2__body');
    const hs2Inner = seq.querySelector('.hs2__inner');

    // vidB: autoplay로 브라우저가 즉시 decode 시작, JS에서 즉시 숨김 (CSS opacity:0 제거)
    gsap.set(vidB, { opacity: 0 });

    // ── 초기 상태: 히어로 텍스트 baseline 아래 대기 ──
    gsap.set([htEye, ...htLines, htSub], { yPercent: 110 });
    gsap.set(hs2Lines, { yPercent: 110 });
    gsap.set(hs2Body, { opacity: 0, y: 12 });
    gsap.set(hs2Inner, { opacity: 1 });

    // ── 입장 애니메이션 (Masked Text Reveal — 위로 올라오며 등장) ──
    const entrance = gsap.timeline({ delay: 0.25 });
    entrance
        .to(htEye,    { yPercent: 0, duration: 1.0, ease: 'power3.out' }, 0)
        .to(htLines,  { yPercent: 0, duration: 1.2, ease: 'power3.out', stagger: 0.1 }, 0.12)
        .to(htSub,    { yPercent: 0, duration: 0.9, ease: 'power3.out' }, 0.48);

    // ── 입장 완료 후 스크롤 시퀀스 초기화 ──
    // heroSeq pin spacer가 생성된 뒤 bldgSeq를 초기화해야 위치가 올바르게 계산됨
    entrance.eventCallback('onComplete', () => {
        initScrollTL();
        // 다음 프레임에 spacer 반영 완료 후 bldgSeq 등록
        requestAnimationFrame(() => {
            initBldgSeq();
            initBldgPopup();
        });
    });

    function initScrollTL() {
        const SCROLL_SPACE = window.innerHeight * 2.2;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: seq,
                start: 'top top',
                end: `+=${SCROLL_SPACE}`,
                pin: true,
                scrub: 1.8,
                invalidateOnRefresh: true,
            }
        });

        // ── Phase 1 (0→0.38): Masked Reverse Reveal — 히어로 텍스트 퇴장 ──
        // 각 줄이 overflow:hidden 아래로 translateY(110%) 되돌아감
        tl
            .fromTo(htEye,      { yPercent: 0 }, { yPercent: 110, duration: 0.12, ease: 'power2.in' }, 0)
            .fromTo(htLines[0], { yPercent: 0 }, { yPercent: 110, duration: 0.15, ease: 'power2.in' }, 0.03)
            .fromTo(htLines[1], { yPercent: 0 }, { yPercent: 110, duration: 0.15, ease: 'power2.in' }, 0.06)
            .fromTo(htLines[2], { yPercent: 0 }, { yPercent: 110, duration: 0.15, ease: 'power2.in' }, 0.09)
            .fromTo(htSub,      { yPercent: 0 }, { yPercent: 110, duration: 0.12, ease: 'power2.in' }, 0.12);

        // ── Phase 1 (0→0.40): Container Mask Shrink — vmask left: 0% → 62% ──
        tl.fromTo(hvm,
            { left: '0%' },
            { left: '75%', duration: 0.40, ease: 'power2.inOut' },
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
        // 각 줄이 overflow:hidden 위로 translateY(0%)로 솟아오름
        tl
            .fromTo(hs2Lines[0], { yPercent: 110 }, { yPercent: 0, duration: 0.14, ease: 'power3.out' }, 0.42)
            .fromTo(hs2Lines[1], { yPercent: 110 }, { yPercent: 0, duration: 0.14, ease: 'power3.out' }, 0.47)
            .fromTo(hs2Lines[2], { yPercent: 110 }, { yPercent: 0, duration: 0.14, ease: 'power3.out' }, 0.52)
            .fromTo(hs2Body,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' },
                0.58
            );

        // ── Phase 3 (0.68→1.0): Container Mask Expansion — vmask left: 62% → 0% ──
        tl.to(hvm,
            { left: '0%', duration: 0.32, ease: 'power2.inOut' },
            0.68
        );

        // Phase 3: 영상이 텍스트 아래로 깔리면서 폰트색 dark → white (소통 효과)
        tl.fromTo([...hs2Lines],
            { color: '#1A1A1A' },
            { color: '#ffffff', duration: 0.28, ease: 'power2.inOut' },
            0.72
        );
        tl.fromTo(hs2Body,
            { color: '#6B6B6B' },
            { color: 'rgba(255,255,255,0.55)', duration: 0.28, ease: 'power2.inOut' },
            0.72
        );

        // Phase 3: overlay 복귀 (풀스크린 영상이 되면서 어두워짐)
        tl.to(overlay, { opacity: 0.32, duration: 0.20, ease: 'none' }, 0.74);
    }
}

initHeroSequence();


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
    const preEye    = seq.querySelector('.bpt__line--eye');
    const preTitle  = seq.querySelector('.bpt__line--title');
    const preSub    = seq.querySelector('.bpt__line--sub');
    const imgWrap   = document.getElementById('bldgImgWrap');
    const sideL     = seq.querySelectorAll('#bldgSideL .bs__label, #bldgSideL .bs__value');
    const sideR     = seq.querySelectorAll('#bldgSideR .bs__label, #bldgSideR .bs__value');
    const hotspots  = seq.querySelectorAll('.bhs');
    const pretext   = document.getElementById('bldgPretext');

    // ── 초기 상태 ──
    gsap.set(curtainT, { y: '0%' });
    gsap.set(curtainB, { y: '0%' });
    gsap.set(lines,    { scaleY: 0 });
    gsap.set([preEye, preTitle, preSub], { yPercent: 110 });
    gsap.set(hotspots, { scale: 0 });
    gsap.set([...sideL, ...sideR], { yPercent: 110 });
    gsap.set(imgWrap,  { xPercent: -50, y: '60vh', opacity: 0 });
    gsap.set(pretext,  { xPercent: -50, yPercent: -56 });

    const SCROLL_SPACE = window.innerHeight * 3.2;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: seq,
            start: 'top top',   // 섹션이 뷰포트를 완전히 덮은 직후 고정
            end: `+=${SCROLL_SPACE}`,
            pin: true,
            scrub: 1.8,
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
        .fromTo(preEye,   { yPercent: 110 }, { yPercent: 0, duration: 0.13, ease: 'power3.out' }, 0.36)
        .fromTo(preTitle, { yPercent: 110 }, { yPercent: 0, duration: 0.16, ease: 'power3.out' }, 0.41)
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

    // Phase 6 (0.80→0.98): 핫스팟 팝인
    hotspots.forEach((hs, i) => {
        tl.to(hs,
            { scale: 1, duration: 0.11, ease: 'back.out(2.8)' },
            0.80 + i * 0.05
        );
    });
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
            floor: '28 – 32F',
            name: '루프탑 인피니티풀',
            nameEn: 'SKY AMENITY',
            desc: '스카이 라운지 · 루프탑 인피니티풀\n인피니티 뷰 테라스',
            img: S3 + '%E1%84%8B%E1%85%A9%E1%86%A8%E1%84%89%E1%85%A1%E1%86%BC%20%E1%84%89%E1%85%AE%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%8C%E1%85%A1%E1%86%B7%2001%20%E1%84%87%E1%85%A9%E1%86%A8%E1%84%89%E1%85%A1.png',
        },
        {
            floor: '3 – 24F',
            name: '호텔 라운지',
            nameEn: 'SUMMIT LOUNGE',
            desc: '프라이빗 라운지\n비즈니스 미팅룸',
            img: S3 + '%E1%84%8B%E1%85%A1%E1%84%91%E1%85%A1%E1%84%90%E1%85%B3_%E1%84%92%E1%85%A9%E1%84%90%E1%85%A6%E1%86%AF%203%E1%84%8E%E1%85%B3%E1%86%BC%20%E1%84%85%E1%85%A6%E1%86%AB%E1%84%83%E1%85%A5%E1%84%85%E1%85%B5%E1%86%BC.png',
        },
        {
            floor: 'B1 – 4F',
            name: '피트니스 & 커뮤니티',
            nameEn: 'FITNESS · COMMUNITY',
            desc: '피트니스 · 스크린골프 · 사우나\n키즈클럽 · 플레이그라운드',
            img: S3 + '%E1%84%8F%E1%85%A5%E1%84%86%E1%85%B2%E1%84%82%E1%85%B5%E1%84%90%E1%85%B5-3f-render.png',
        },
        {
            floor: '5 – 32F',
            name: '아파트 84㎡',
            nameEn: 'UNIT PLAN · 84A TYPE',
            desc: '방 3 · 욕실 2\n베란다 확장형 평면도',
            img: S3 + '84A_%EB%B2%A0%EB%9E%80%EB%8B%A4%ED%99%95%EC%9E%A5_%ED%8F%89%EB%A9%B4%EB%8F%84.webp',
        },
    ];

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

        const popW = 600;
        const popH = 530;
        const onLeft = hsX > seq.offsetWidth * 0.5;
        let pX = onLeft ? hsX - popW - 36 : hsX + 36;
        let pY = hsY - 40;
        pX = Math.max(12, Math.min(pX, seq.offsetWidth  - popW - 12));
        pY = Math.max(12, Math.min(pY, seq.offsetHeight - popH - 12));

        popup.style.left = pX + 'px';
        popup.style.top  = pY + 'px';
        popup.classList.add('is-open');

        // 이미지 교체
        const popImg = document.getElementById('bpopImg');
        if (popImg) { popImg.src = data.img; popImg.alt = data.name; }

        // 커넥터 라인 좌표
        const lineEndX = onLeft ? pX + popW : pX;
        const lineEndY = pY + 18;
        const len = Math.hypot(lineEndX - hsX, lineEndY - hsY);
        connLine.setAttribute('x1', hsX);
        connLine.setAttribute('y1', hsY);
        connLine.setAttribute('x2', lineEndX);
        connLine.setAttribute('y2', lineEndY);
        connLine.setAttribute('stroke-dasharray', len);
        connLine.setAttribute('stroke-dashoffset', len);

        // 팝업 콘텐츠
        content.innerHTML = `
            <div class="bpop__floor">${data.floor}</div>
            <div class="bpop__name">${data.name}</div>
            <span class="bpop__name-en">${data.nameEn}</span>
            <div class="bpop__desc">${data.desc.replace('\n', '<br>')}</div>
        `;

        // 3단계 애니메이션
        const tl = gsap.timeline();

        // Step 1: 커넥터 라인 드로잉
        gsap.set(connLine, { strokeDashoffset: len });
        tl.to(popup, { opacity: 1, duration: 0.01 }, 0);
        tl.to(connLine, { strokeDashoffset: 0, duration: 0.32, ease: 'power2.out' }, 0);

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
            ${typeName ? `<div class="ul-info__type-badge ul-info__type-badge--${typeName}">${typeName} 타입</div>` : ''}
            <br>
            <a href="plans.html#units" class="ul-info__link">평면도 보기 →</a>
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
