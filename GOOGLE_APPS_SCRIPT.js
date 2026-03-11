// ============================================================
// EXORDIUM SIGNATURE HAEUNDAE — 관심고객 등록 Google Apps Script
// ============================================================
//
// ★ 설정 방법:
//
// 1. Google Sheets 새로 만들기: https://sheets.new
//    - 시트 이름을 "관심고객" 으로 변경
//    - 첫 번째 행(헤더)에 아래 항목을 순서대로 입력:
//      A1: 접수일시
//      B1: 이름
//      C1: 연락처
//      D1: 이메일
//      E1: 관심타입
//      F1: 유입경로
//      G1: 문의사항
//      H1: 마케팅동의
//      I1: 신청페이지
//      J1: 제출시각(브라우저)
//
// 2. 상단 메뉴 → [확장 프로그램] → [Apps Script] 클릭
//
// 3. 기존 코드 전부 지우고, 아래 코드 전체 붙여넣기
//
// 4. 상단 메뉴 → [배포] → [새 배포]
//    - 유형: "웹 앱" 선택
//    - 실행 주체: "나" (본인 계정)
//    - 액세스 권한: "모든 사용자" (로그인 불필요)
//    - [배포] 클릭
//
// 5. 생성된 배포 URL 복사
//    → register.html 내 APPS_SCRIPT_URL 상수에 붙여넣기
//
// ★ 주의: 코드 수정 후에는 반드시 [배포] → [배포 관리] → [새 버전] 으로 재배포
// ============================================================

const SHEET_NAME = '관심고객';
const SHEET_HEADERS = [
  '접수일시',
  '이름',
  '연락처',
  '이메일',
  '관심타입',
  '유입경로',
  '문의사항',
  '마케팅동의',
  '신청페이지',
  '제출시각(브라우저)',
];

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const needsHeader = SHEET_HEADERS.some((header, index) => currentHeaders[index] !== header);

  if (needsHeader) {
    headerRange.setValues([SHEET_HEADERS]);
  }

  return sheet;
}

function doGet(e) {
  try {
    const data = e.parameter;
    const sheet = getOrCreateSheet_();

    const now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    sheet.appendRow([
      now,
      data.name      || '',
      data.phone     || '',
      data.email     || '',
      data.roomType  || '',
      data.source    || '',
      data.message   || '',
      data.marketing || '부동의',
      data.pageUrl   || '',
      data.submittedAt || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e);
}

// ── 테스트용 (Apps Script 에디터에서 직접 실행 가능) ──
function testDoPost() {
  const testData = {
    parameter: {
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'test@example.com',
      roomType: '84A',
      source: '인터넷 검색',
      message: '테스트 문의입니다.',
      marketing: '동의',
      pageUrl: 'https://exordium-haeundae.com/register.html',
      submittedAt: '2026-03-11T12:00:00.000Z',
    }
  };
  const result = doPost(testData);
  Logger.log(result.getContent());
}
