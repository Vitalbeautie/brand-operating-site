/* ═══════════════════════════════════════════════════════════════════════════
   ARCHIVE · VERSION HISTORY Page
   - VITALBEAUTIE 공식 BI 가이드라인 전 버전 아카이브 (2009 V1 ~ 2024 V7 실제 PDF 탑재)
   - 최상단 [LATEST ACTIVE VERSION] 배너로 가장 최신 버전을 직관적으로 강조 표시
   - 사용자 신규 버전 파일 업로드 & 이력 관리 (IndexedDB 대용량 파일 영구 저장 + 즉시 다운로드)
   ═══════════════════════════════════════════════════════════════════════════ */
import { showToast } from '../utils/helpers.js';

const META_STORAGE_KEY = 'vb_bi_version_history_meta_v2';
const IDB_NAME = 'vb_bi_version_files_db';
const IDB_STORE = 'files';

/* ─── 공식 기본 탑재 BI 가이드라인 이력 (2009 V1 ~ 2024 V7) ─── */
const OFFICIAL_BI_VERSIONS = [
  {
    id: 'official-v7-2024',
    version: 'V7',
    year: '2024',
    date: '2024년 11월 · 서울',
    title: 'BI 가이드 2024 · V7',
    fileName: 'VB_BI_GUIDELINE_2024_V7.pdf',
    fileSize: '2.0 MB',
    fileUrl: './assets/guidelines/VB_BI_GUIDELINE_2024_V7.pdf',
    isOfficial: true,
    memo: 'HIGH-PERFORMANCE WELLNESS · LAB PROVEN 마스터 가이드라인',
    timestamp: 1730419200000,
  },
  {
    id: 'official-v6-2022',
    version: 'V6',
    year: '2022',
    date: '2022년 6월 · 서울',
    title: 'BI 가이드 2022 · V6',
    fileName: 'VB_BI_GUIDELINE_2022_V6.pdf',
    fileSize: '3.5 MB',
    fileUrl: './assets/guidelines/VB_BI_GUIDELINE_2022_V6.pdf',
    isOfficial: true,
    memo: 'VITALBEAUTIE 브랜드 아이덴티티 및 패키지 시스템 개정',
    timestamp: 1654041600000,
  },
  {
    id: 'official-v5-2018',
    version: 'V5',
    year: '2018',
    date: '2018년 4월 · 서울',
    title: 'BI 가이드 2018 · V5',
    fileName: 'VB_BI_GUIDELINE_2018_V5.pdf',
    fileSize: '5.4 MB',
    fileUrl: './assets/guidelines/VB_BI_GUIDELINE_2018_V5.pdf',
    isOfficial: true,
    memo: '모던 웰니스 브랜드 컬러 및 어플리케이션 규정',
    timestamp: 1522540800000,
  },
  {
    id: 'official-v4-2016',
    version: 'V4',
    year: '2016',
    date: '2016년 4월 29일 · 서울',
    title: 'BI 가이드 2016 · V4',
    fileName: 'VB_BI_GUIDELINE_2016_V4.pdf',
    fileSize: '2.9 MB',
    fileUrl: './assets/guidelines/VB_BI_GUIDELINE_2016_V4.pdf',
    isOfficial: true,
    memo: 'VITALBEAUTIE BOOK. 꿈을 꾸다',
    timestamp: 1456790400000,
  },
  {
    id: 'official-v3-2012',
    version: 'V3',
    year: '2012',
    date: '2012년 5월 11일 · 서울',
    title: 'BI 가이드 2012 · V3',
    fileName: 'VB_BI_GUIDELINE_2012_V3.pdf',
    fileSize: '3.0 MB',
    fileUrl: './assets/guidelines/VB_BI_GUIDELINE_2012_V3.pdf',
    isOfficial: true,
    memo: '',
    timestamp: 1335830400000,
  },
  {
    id: 'official-v2-2011',
    version: 'V2',
    year: '2011',
    date: '2011년 3월 16일 · 서울',
    title: 'BI 가이드 2011 · V2',
    fileName: 'VB_BI_GUIDELINE_2011_V2.pdf',
    fileSize: '2.7 MB',
    fileUrl: './assets/guidelines/VB_BI_GUIDELINE_2011_V2.pdf',
    isOfficial: true,
    memo: 'VB PROGRAM. 비우고 채워서 속부터 바꿔라',
    timestamp: 1296518400000,
  },
  {
    id: 'official-v1-2009',
    version: 'V1',
    year: '2009',
    date: '2009년 · 서울',
    title: 'BI 가이드 2009 · V1',
    fileName: 'VB_BI_GUIDELINE_2009_V1.pdf',
    fileSize: '1.6 MB',
    fileUrl: './assets/guidelines/VB_BI_GUIDELINE_2009_V1.pdf',
    isOfficial: true,
    memo: 'V=B Program Design History 1st',
    timestamp: 1251763200000,
  },
];

/* ─── IndexedDB 헬퍼 (사용자 업로드 대용량 PDF/AI 파일 저장용) ─── */
function openFilesDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveFileBlobToDb(id, blob) {
  const db = await openFilesDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getFileBlobFromDb(id) {
  const db = await openFilesDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFileBlobFromDb(id) {
  const db = await openFilesDb();
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

/* ─── 사용자 업로드 메타데이터 로드/저장 ─── */
function loadUserUploadedMeta() {
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserUploadedMeta(list) {
  try {
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/* ─── 실제 파일 다운로드 및 미리보기 실행 ─── */
async function downloadVersionFile(item) {
  try {
    let blob = null;
    if (item.isOfficial && item.fileUrl) {
      const resp = await fetch(item.fileUrl, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = await resp.arrayBuffer();
      blob = new Blob([buf], { type: 'application/pdf' });
    } else {
      blob = await getFileBlobFromDb(item.id);
    }

    if (!blob && item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`${item.fileName} 파일 다운로드를 시작합니다.`);
      return;
    }

    if (!blob) {
      showToast('저장된 파일 데이터를 찾을 수 없습니다.');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName || `${item.title}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 400);
    showToast(`${item.fileName} 파일이 다운로드되었습니다.`);
  } catch (err) {
    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`${item.fileName} 파일 다운로드를 시작합니다.`);
    }
  }
}

async function openVersionFilePreview(item) {
  if (item.isOfficial && item.fileUrl) {
    window.open(item.fileUrl, '_blank', 'noopener');
    return;
  }
  const blob = await getFileBlobFromDb(item.id);
  if (blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
  } else {
    showToast('미리보기할 파일 데이터를 찾을 수 없습니다.');
  }
}

/* ─── VERSION HISTORY 페이지 렌더링 ─── */
export function renderVersionPage(container) {
  const render = () => {
    const userItems = loadUserUploadedMeta();
    // 최신순 정렬 (가장 최근 업로드 또는 V7이 최상단)
    const allVersions = [...userItems, ...OFFICIAL_BI_VERSIONS].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const latest = allVersions[0];

    // 다음 버전 번호 자동 제안 (예: V8.0)
    const maxVerNum = allVersions.reduce((max, item) => {
      const m = String(item.version || '').match(/(\d+)/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 7);
    const nextVersionSuggested = `V${maxVerNum + 1}`;

    const historyRowsHtml = allVersions.map((item, idx) => {
      const isLatest = idx === 0;
      return `
        <div class="vh-item" data-id="${item.id}" style="position:relative; padding:0 0 28px 24px;">
          <span style="position:absolute; left:-4.5px; top:6px; width:9px; height:9px; background:#9A8C60; border-radius:50%; display:block;"></span>
          <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap;">
            <div style="font-size:16px; font-weight:700; color:#101820;">
              ${item.title}
            </div>
            <button type="button" class="vh-download-btn" data-id="${item.id}" style="background:none; border:none; padding:0; color:#5A6270; font-size:13.5px; font-family:var(--font-en); text-decoration:underline; cursor:pointer;" title="PDF 다운로드">
              ${item.fileName || '.pdf'}
            </button>
            ${!item.isOfficial ? `
              <button type="button" class="vh-delete-btn" data-id="${item.id}" style="background:none; border:none; color:#B00020; font-size:11.5px; cursor:pointer; padding:0 4px;" title="삭제">
                삭제
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="margin-bottom:28px;">
        <h1 style="font-family:var(--font-en); font-weight:300; letter-spacing:2px; font-size:28px; margin:0 0 6px 0; color:#101820;">VERSION HISTORY</h1>
        <div style="font-size:14px; font-weight:600; color:#101820; margin-bottom:10px;">가이드 이력</div>
        <div style="border-left:2px solid #D5D8DE; padding-left:14px; font-size:13.5px; color:#5A6270; line-height:1.6;">
          가이드가 바뀔 때마다 파일을 올리면 시간 순으로 남습니다. 파일은 이 브라우저에 저장됩니다.
        </div>
      </div>

      <!-- 1. 최상단 최신 버전(LATEST VERSION) 심플 요약 -->
      ${latest ? `
        <div style="margin-bottom:32px; padding:0 0 24px 0; border-bottom:1px solid #EAECEF; display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="font-size:11px; font-weight:700; letter-spacing:1.2px; color:#9A8C60; margin-bottom:6px;">LATEST VERSION · 현재 최신 버전</div>
            <div style="font-size:20px; font-weight:700; color:#101820; margin-bottom:4px;">${latest.title}</div>
            <div style="font-size:13px; color:#5A6270;">${latest.fileName} · ${latest.fileSize || 'PDF'} (${latest.date})</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" id="vh-latest-preview" style="background:#FFFFFF; color:#101820; border:1px solid #D5D8DE; padding:8px 14px; font-size:12.5px; font-weight:600; cursor:pointer;">
              열기
            </button>
            <button type="button" id="vh-latest-download" style="background:#101820; color:#FFFFFF; border:1px solid #101820; padding:8px 16px; font-size:12.5px; font-weight:600; cursor:pointer;">
              최신 버전 다운로드
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 2. 새 버전 올리기 (무박스 심플 폼) -->
      <div style="margin-bottom:40px; padding-bottom:28px; border-bottom:1px solid #EAECEF;">
        <div style="font-size:14px; font-weight:700; color:#101820; margin-bottom:14px;">새 버전 올리기</div>

        <div style="display:grid; grid-template-columns: 140px 1fr 1fr; gap:14px; margin-bottom:14px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#2C323D; margin-bottom:6px;">버전</label>
            <input type="text" id="vh-input-version" value="${nextVersionSuggested}" placeholder="예: V8" style="width:100%; padding:9px 12px; border:1px solid #D5D8DE; font-size:13.5px; font-family:var(--font-ko); box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#2C323D; margin-bottom:6px;">제목</label>
            <input type="text" id="vh-input-title" placeholder="예: BI 가이드 2026 · ${nextVersionSuggested}" style="width:100%; padding:9px 12px; border:1px solid #D5D8DE; font-size:13.5px; font-family:var(--font-ko); box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#2C323D; margin-bottom:6px;">파일</label>
            <input type="file" id="vh-input-file" accept=".pdf,.ai,.zip,.pptx,.key" style="width:100%; padding:6px 10px; border:1px solid #D5D8DE; font-size:13px; background:#FFFFFF; font-family:var(--font-ko); box-sizing:border-box;" />
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:600; color:#2C323D; margin-bottom:6px;">변경 메모</label>
          <textarea id="vh-input-memo" rows="2" placeholder="이번 버전에서 바뀐 내용" style="width:100%; padding:9px 12px; border:1px solid #D5D8DE; font-size:13.5px; resize:vertical; font-family:var(--font-ko); box-sizing:border-box;"></textarea>
        </div>

        <button type="button" id="vh-submit-btn" style="background:#101820; color:#FFFFFF; border:none; padding:9px 16px; font-size:12.5px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
          <span>↑</span> 이력에 추가
        </button>
      </div>

      <!-- 3. 전체 버전 타임라인 리스트 (불필요한 박스 제거 · 골드 수직 타임라인) -->
      <div id="vh-list-wrap" style="border-left:1px solid #9A8C60; margin-left:6px; padding-top:2px;">
        ${historyRowsHtml}
      </div>
    `;

    // 최상단 최신 버전 배너 버튼 이벤트
    const latestDlBtn = container.querySelector('#vh-latest-download');
    if (latestDlBtn && latest) {
      latestDlBtn.onclick = () => downloadVersionFile(latest);
    }
    const latestPrevBtn = container.querySelector('#vh-latest-preview');
    if (latestPrevBtn && latest) {
      latestPrevBtn.onclick = () => openVersionFilePreview(latest);
    }

    // 파일 선택 시 제목이 비어 있으면 파일명 기반으로 자동 채움
    const fileInput = container.querySelector('#vh-input-file');
    const titleInput = container.querySelector('#vh-input-title');
    if (fileInput && titleInput) {
      fileInput.onchange = () => {
        const f = fileInput.files?.[0];
        if (f && !titleInput.value.trim()) {
          const cleanTitle = f.name.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
          titleInput.value = cleanTitle;
        }
      };
    }

    // 새 버전 업로드 등록 이벤트
    const submitBtn = container.querySelector('#vh-submit-btn');
    if (submitBtn) {
      submitBtn.onclick = async () => {
        const verInput = container.querySelector('#vh-input-version');
        const memoInput = container.querySelector('#vh-input-memo');
        const file = fileInput?.files?.[0];

        if (!file) {
          showToast('업로드할 가이드라인 파일을 선택해주세요.');
          return;
        }

        const versionCode = (verInput?.value || nextVersionSuggested).trim();
        const title = (titleInput?.value || file.name.replace(/\.[^.]+$/, '')).trim();
        const memo = (memoInput?.value || '신규 업로드된 BI 가이드라인 버전입니다.').trim();

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const id = `user-ver-${Date.now()}`;

        submitBtn.disabled = true;
        submitBtn.textContent = '업로드 저장 중...';

        try {
          await saveFileBlobToDb(id, file);
          const currentMeta = loadUserUploadedMeta();
          const newEntry = {
            id,
            version: versionCode,
            year: String(yyyy),
            date: `${yyyy}.${mm}.${dd}`,
            title,
            fileName: file.name,
            fileSize: formatBytes(file.size),
            isOfficial: false,
            memo,
            timestamp: Date.now(),
          };
          currentMeta.unshift(newEntry);
          saveUserUploadedMeta(currentMeta);
          showToast(`${versionCode} (${file.name}) 버전이 최상단 최신 이력으로 등록되었습니다.`);
          render();
        } catch (err) {
          console.error(err);
          showToast('파일 저장 중 오류가 발생했습니다.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>↑</span> 이력에 추가';
        }
      };
    }

    // 개별 다운로드 버튼
    container.querySelectorAll('.vh-download-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const target = allVersions.find(v => v.id === id);
        if (target) downloadVersionFile(target);
      };
    });

    // 개별 열기(미리보기) 버튼
    container.querySelectorAll('.vh-preview-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const target = allVersions.find(v => v.id === id);
        if (target) openVersionFilePreview(target);
      };
    });

    // 사용자 업로드 이력 삭제 버튼
    container.querySelectorAll('.vh-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const currentMeta = loadUserUploadedMeta().filter(v => v.id !== id);
        saveUserUploadedMeta(currentMeta);
        await deleteFileBlobFromDb(id);
        showToast('선택한 사용자 업로드 이력이 삭제되었습니다.');
        render();
      };
    });
  };

  render();
}
