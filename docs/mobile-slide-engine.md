# 모바일 슬라이드 엔진 — 변경 내역

- **커밋:** `32461a2` (이전: `3dc0da3`)
- **날짜:** 2026-07-01
- **변경 파일:** `main.js` (+387/-130), `style.css` (+52)
- **범위:** 랜딩(`index.html`) 전용. 서브페이지·데스크탑은 변경 없음.

---

## 1. 요청 사항

> **모바일(≤768px)에서만** 랜딩을 풀페이지 슬라이드로.
> 스와이프하면 한 섹션이 자석처럼 스냅 등장 → 그 섹션에 배정된 인터랙션이 **약 2초 자동재생** → 재생이 끝나면 다시 스와이프해 다음 섹션으로.
> 데스크탑은 **기존 그대로**. 기존 인터랙션과 겹치지 않게 완전 분리. 기종 무관 높이 표준 적용.

결정 사항: 슬라이드 단위 = **내부 장면까지 분해**, 적용 범위 = **랜딩(index)만**.

---

## 2. 이전 vs 이후 (동작 비교)

| | 이전 (`3dc0da3`) | 이후 (`32461a2`) |
|--|------------------|------------------|
| **데스크탑** | 히어로/빌딩이 pin + scrub(스크롤 위치에 따라 손가락 따라 애니메이션) + snap | **동일 — 무변경** |
| **모바일** | 데스크탑과 같은 pin/scrub를 그대로 사용. 긴 스크롤 구간(3.2×·5× 뷰포트)을 손가락으로 밀어야 하고 Lenis와 snap이 충돌 | **이산 풀페이지 슬라이드.** 한 화면=한 장면, 스와이프 1회 = 다음 장면, 도착 시 ~2초 자동재생 |
| **스크롤 방식** | Lenis 가상 스크롤 전역 | 모바일은 Lenis 미생성(터치 충돌 방지), 스크롤 잠금 후 wrapper `translateY` 제어 |
| **높이 기준** | `100vh` 고정 | `--app-h = 실측 innerHeight`(JS 동기, `dvh` 폴백) → iOS 주소창/기종 편차 흡수 |

---

## 3. 아키텍처 — "완전 분리, 무충돌 재사용"

핵심은 **하나의 타임라인을 두 방식으로 구동**하는 것:

```
addHeroTweens(tl) / initBldgSeq()  ──▶  paused 타임라인 반환
        │
        ├─ 데스크탑: ScrollTrigger(pin·scrub·snap)가 progress를 스크롤에 연동
        └─ 모바일:  tl.tweenTo(목표시간, {duration: 2})  ← 시간 기반 자동재생
```

- 애니메이션 로직이 **이중화되지 않음.** 장면을 고치면 데스크탑·모바일에 동시에 반영.
- `IS_MOBILE` 게이트로 모바일에서는 **Lenis / nav 스크롤 트리거 / pin·scrub ScrollTrigger를 생성조차 하지 않음** → 기존 인터랙션과 물리적으로 겹칠 수 없음.

---

## 4. `main.js` 변경 상세

| 위치 | 이전 | 이후 |
|------|------|------|
| 상단 | — | `IS_MOBILE`, `PREFERS_REDUCED` 상수 추가. 브레이크포인트 넘으면 `location.reload()` 1회. 모바일이면 첫 페인트부터 스크롤 잠금(`.m-slides-active`) |
| Lenis | 무조건 생성 | `if (!IS_MOBILE)`에서만 생성. 모바일은 `scrollTo` no-op shim |
| nav 다크 토글 | 스크롤 위치 기반 ScrollTrigger | 데스크탑만. 모바일은 슬라이드 컨트롤러가 슬라이드별로 `nav--dark`/`scrolled` 직접 제어 |
| `initHeroSequence` | entrance 후 `initScrollTL()`+`initBldgSeq()` (pin/scrub) | entrance는 공통. 이후 **분기**: 모바일=paused 타임라인 구성 후 `initMobileSlides()`, 데스크탑=기존 그대로 |
| `initScrollTL` | 트윈이 ScrollTrigger에 직접 묶임 | 트윈을 `addHeroTweens(tl)`로 분리. 데스크탑용 ScrollTrigger는 이 함수를 호출. `buildHeroTimeline()`은 paused 버전 반환 |
| `initBldgSeq` | ScrollTrigger 타임라인 | 모바일=`paused` 타임라인, 데스크탑=ScrollTrigger. 끝에서 `tl` 반환 |
| `initLocBrief` | onEnter ScrollTrigger에서 리빌 | `enter()` 함수로 분리. 데스크탑만 ScrollTrigger 등록, 모바일은 컨트롤러가 호출. `locEnter`로 보관 |
| 플로팅 CTA | onEnter ScrollTrigger | 모바일은 히어로 입장 후 직접 표시 |
| **신규** | — | **`initMobileSlides()`** — 이산 슬라이드 컨트롤러(아래) |

### `initMobileSlides()` 요약
1. 슬라이드 섹션(히어로·빌딩·로케이션·푸터)을 `#mSlides` fixed wrapper로 이동.
2. 팝업 `#bpop`을 `body`로 이동 — transform된 wrapper 안에서는 `position:fixed`가 wrapper 기준이 되어 화면 밖으로 나가는 문제 보정.
3. `--app-h` = `window.innerHeight` 세팅(리사이즈/회전 시 재동기).
4. **STOP 배열**(내부 장면까지 분해):
   - 히어로 progress `[0, 0.42, 0.84]` — 인트로 / 패널+카피 / 오션 풀샷
   - 빌딩 progress `[0.55, 0.82, 1.0]` — 커튼+타이틀 / 건물 상승 / 핫스팟
   - 로케이션(리빌) / 푸터(페이드업)
5. 스와이프(터치)·휠·방향키 감지 → 입력 잠금 → 섹션 이동(`translateY`, 0.9s) + 타임라인 `tweenTo`(~2s) → 완료 시 잠금 해제.
6. 로케이션·푸터만 내부 세로 스크롤 허용(경계에서만 다음 장). 핫스팟 팝업이 열려 있으면 스와이프 무시.

### 주요 타이밍 값 (조정 포인트)
```
AUTOPLAY = 2.0s   // 슬라이드 도착 시 인터랙션 자동재생
T_DUR    = 0.9s   // 섹션 자석 이동(translate)
T_DELAY  = 0.5s   // 이동 중 콘텐츠 재생 겹침(자석감)
스와이프 임계 = 44px / 700ms
prefers-reduced-motion → 전부 즉시 전환
```

---

## 5. `style.css` 변경 상세 (신규 블록, 파일 끝)

`html.m-slides-active`일 때만 활성:
- `html/body` 높이 `var(--app-h, 100dvh)` + `overflow:hidden` + `overscroll-behavior:none` → 스크롤 잠금·기종 대응.
- `#mSlides` `position:fixed`, `will-change:transform`.
- 각 슬라이드 = `height: var(--app-h)` 정확히 1뷰포트.
- 로케이션(`display:block`)·푸터만 `overflow-y:auto`(내부 스크롤).

> 기존 규칙은 하나도 삭제하지 않았고, id 특이도로 자연스럽게 오버라이드.

---

## 6. 미검증 사항 (실기기 확인 필요)

빌드(`vite build`)·정적 로직·z-index 스택은 확인. 단, **Chrome 확장 미연결로 실기기/에뮬 시각검증은 미수행.** 배포 후 실제 폰에서 확인 권장:
- iOS Safari 주소창 변동 시 슬라이드 높이 정합
- 로케이션 슬라이드 내부 스크롤 → 다음 장 전환 감각
- 자동재생 2초 / 자석 이동 0.9s 체감

---

## 7. 되돌리는 법

```bash
git revert 32461a2      # 이 변경만 취소
# 또는
git reset --hard 3dc0da3 && git push -f   # 직전 상태로 (주의: 강제 푸시)
```
