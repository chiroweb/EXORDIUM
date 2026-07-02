/* ══════════════════════════════════════════════════
   NOTICE BOARD — 공지사항
   정적 사이트용 게시판. 아래 POSTS 배열에 글을 추가하면
   목록과 상세가 자동 렌더링된다. (백엔드 불필요)

   글 추가 방법:
   POSTS 배열 맨 위에 객체 하나를 추가한다.
   {
     id: 고유 숫자(중복 금지, 클수록 최신),
     category: '공지' | '보도자료' | '이벤트' 등 자유,
     title: '제목',
     date: 'YYYY.MM.DD',
     excerpt: '목록에 보일 한두 줄 요약',
     pinned: true,            // (선택) 상단 고정
     body: `본문 HTML. <p>문단</p> 단위로 작성.`
   }
   ══════════════════════════════════════════════════ */

const POSTS = [
  {
    id: 5,
    category: '공지',
    title: '견본주택 개관 및 관람 예약 안내',
    date: '2026.03.02',
    pinned: true,
    excerpt: '엑소디움 시그니처 해운대 견본주택이 개관합니다. 쾌적한 관람을 위해 사전 예약 고객께 우선 관람을 안내드립니다.',
    body: `
      <p>엑소디움 시그니처 해운대 견본주택이 2026년 3월 개관합니다. 송정해수욕장을 품은 단지의 설계 철학과 세대별 공간을 실제 스케일로 경험하실 수 있습니다.</p>
      <h3>관람 안내</h3>
      <p>· 위치 : 부산광역시 해운대구 우동 655-5번지<br>· 운영시간 : 오전 10시 — 오후 6시 (연중무휴)<br>· 문의 : 051-711-2508</p>
      <h3>사전 예약</h3>
      <p>주말 및 공휴일은 방문객이 집중되어 대기가 발생할 수 있습니다. 관심고객으로 등록하신 분께는 예약 관람 및 전담 상담을 우선 배정해 드립니다.</p>
      <p>보다 여유로운 관람을 원하시면 사전 예약을 권해 드립니다.</p>
    `,
  },
  {
    id: 4,
    category: '분양',
    title: '입주자 모집공고 공개 일정 안내',
    date: '2026.02.20',
    excerpt: '입주자 모집공고는 2026년 3월 초 공개 예정입니다. 공고 전 관심고객 등록 시 일정과 서류를 우선 안내드립니다.',
    body: `
      <p>엑소디움 시그니처 해운대 입주자 모집공고가 2026년 3월 초 공개될 예정입니다.</p>
      <h3>주요 일정 (예정)</h3>
      <p>· 26.03 — 입주자 모집공고 및 청약 접수 개시<br>· 27.03 — 착공 예정<br>· 30.03 — 준공 예정<br>· 30.05 — 입주 예정</p>
      <p>일정은 인허가 및 사업 진행에 따라 변동될 수 있으며, 확정 일정은 정식 모집공고를 통해 안내드립니다.</p>
      <p>공고 전 관심고객으로 등록하신 분께는 청약 자격 요건과 제출 서류를 사전에 안내해 드립니다.</p>
    `,
  },
  {
    id: 3,
    category: '보도자료',
    title: '해운대 마지막 오션프론트 입지, 랜드마크 기대감',
    date: '2026.02.05',
    excerpt: 'BIPV 스마트 커튼월과 윈덤 호텔 400호실이 결합된 복합 개발로, 송정 일대 스카이라인의 중심으로 주목받고 있습니다.',
    body: `
      <p>엑소디움 시그니처 해운대가 송정해수욕장 전면 입지의 복합 개발 프로젝트로 주목받고 있습니다.</p>
      <p>324세대 아파트와 윈덤 계열 호텔 400호실이 결합된 이 단지는, 국내 최초로 적용되는 BIPV(RE100 태양광발전·미디어파사드 송출) 스마트 커튼월 시스템으로 주변 5km 반경에서도 인지되는 랜드마크로 계획되었습니다.</p>
      <p>바다를 향해 열린 조망과 호텔 서비스 인프라를 함께 누리는 하이엔드 레지던스로, 해운대 동부 권역의 새로운 기준을 제시할 것으로 기대됩니다.</p>
    `,
  },
  {
    id: 2,
    category: '이벤트',
    title: '관심고객 사전등록 오픈',
    date: '2026.01.15',
    excerpt: '정식 분양에 앞서 관심고객 사전등록을 시작합니다. 등록 고객께는 분양 일정과 우선 상담 혜택을 드립니다.',
    body: `
      <p>엑소디움 시그니처 해운대 관심고객 사전등록을 시작합니다.</p>
      <p>사전등록 고객께는 다음의 혜택이 제공됩니다.</p>
      <p>· 정식 분양 일정 및 모집공고 우선 안내<br>· 견본주택 예약 관람 및 전담 상담 우선 배정<br>· 세대 정보·분양가 등 핵심 자료 우선 제공</p>
      <p>등록은 홈페이지 <strong>관심고객 등록</strong> 페이지 또는 대표전화(051-711-2508)로 가능합니다.</p>
    `,
  },
  {
    id: 1,
    category: '공지',
    title: '엑소디움 시그니처 해운대 공식 홈페이지 오픈',
    date: '2026.01.02',
    excerpt: '엑소디움 시그니처 해운대 공식 홈페이지가 오픈했습니다. 사업 개요, 단지 안내, 분양 정보를 확인하실 수 있습니다.',
    body: `
      <p>엑소디움 시그니처 해운대 공식 홈페이지가 오픈했습니다.</p>
      <p>사업 개요와 단지 설계, 세대 안내, 분양 정보 등 프로젝트의 주요 정보를 한 곳에서 확인하실 수 있습니다. 공지사항을 통해 분양 일정과 이벤트 소식을 순차적으로 안내해 드리겠습니다.</p>
      <p>많은 관심 부탁드립니다.</p>
    `,
  },
];

/* ── 유틸 ── */
const app = document.getElementById('noticeApp');

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function sorted() {
  // 고정글 우선 → 그다음 id 내림차순(최신)
  return [...POSTS].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.id - a.id);
}

function categories() {
  return ['전체', ...[...new Set(POSTS.map((p) => p.category))]];
}

/* ── 목록 렌더 ── */
function renderList(activeCat = '전체') {
  const cats = categories();
  const list = sorted().filter((p) => activeCat === '전체' || p.category === activeCat);

  const filters = cats
    .map(
      (c) =>
        `<button class="notice-filter${c === activeCat ? ' is-active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`
    )
    .join('');

  const rows = list
    .map((p, i) => {
      const num = String(list.length - i).padStart(2, '0');
      return `
      <a class="notice-row" href="notice.html?id=${p.id}">
        <span class="notice-row__num">${num}</span>
        <span class="notice-row__main">
          <span class="notice-row__meta">
            <span class="notice-row__cat${p.pinned ? ' is-pinned' : ''}">${p.pinned ? '고정 · ' : ''}${esc(p.category)}</span>
            <span class="notice-row__date">${esc(p.date)}</span>
          </span>
          <span class="notice-row__title">${esc(p.title)}</span>
          <span class="notice-row__excerpt">${esc(p.excerpt)}</span>
        </span>
        <span class="notice-row__arrow" aria-hidden="true">→</span>
      </a>`;
    })
    .join('');

  app.innerHTML = `
    <div class="notice-head">
      <span class="notice-head__label">Notice</span>
      <p class="notice-head__count">전체 <strong>${POSTS.length}</strong>건</p>
    </div>
    <div class="notice-filters">${filters}</div>
    <div class="notice-list">${rows || '<p class="notice-empty">등록된 글이 없습니다.</p>'}</div>
  `;

  app.querySelectorAll('.notice-filter').forEach((btn) => {
    btn.addEventListener('click', () => renderList(btn.dataset.cat));
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ── 상세 렌더 ── */
function renderDetail(post) {
  const all = sorted();
  const idx = all.findIndex((p) => p.id === post.id);
  const prev = all[idx + 1]; // 더 오래된 글
  const next = all[idx - 1]; // 더 최신 글

  const navLink = (p, dir) =>
    p
      ? `<a class="notice-pn__item notice-pn__item--${dir}" href="notice.html?id=${p.id}">
           <span class="notice-pn__dir">${dir === 'prev' ? '이전 글' : '다음 글'}</span>
           <span class="notice-pn__title">${esc(p.title)}</span>
         </a>`
      : `<span class="notice-pn__item notice-pn__item--${dir} is-empty"></span>`;

  app.innerHTML = `
    <article class="notice-article">
      <a class="notice-article__back" href="notice.html">← 목록으로</a>
      <div class="notice-article__meta">
        <span class="notice-article__cat">${esc(post.category)}</span>
        <span class="notice-article__date">${esc(post.date)}</span>
      </div>
      <h1 class="notice-article__title">${esc(post.title)}</h1>
      <div class="notice-article__rule"></div>
      <div class="notice-article__body">${post.body}</div>
    </article>
    <nav class="notice-pn">
      ${navLink(prev, 'prev')}
      ${navLink(next, 'next')}
    </nav>
    <div class="notice-article__foot">
      <a class="notice-article__list-btn" href="notice.html">목록 전체 보기</a>
    </div>
  `;
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ── 라우팅 ── */
function boot() {
  if (!app) return;
  const id = Number(new URLSearchParams(location.search).get('id'));
  const post = POSTS.find((p) => p.id === id);
  if (post) renderDetail(post);
  else renderList();
}

boot();
window.addEventListener('popstate', boot);
