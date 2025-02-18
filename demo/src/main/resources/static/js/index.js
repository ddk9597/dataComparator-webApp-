document.addEventListener("DOMContentLoaded", function () {
  let fileData = {}; // 서버에서 받은 데이터 저장
  let selectedCriteria = {}; // 각 파일과 시트별 비교 기준 저장 (행/열 여부)
  let selectedRows = {}; // 각 파일과 시트별 선택된 행 번호 저장 (Set 사용)
  let selectedColumns = {}; // 각 파일과 시트별 선택된 열 번호 저장 (Set 사용)
  let currentFile = ""; // 현재 선택된 파일 (업로드한 파일명)
  let currentSheetIndex = 0; // 현재 선택된 시트 인덱스
	let fileUploadState = 0;

	cosnt 
  // 파일 업로드 후 데이터 로드
  document.getElementById("uploadForm").addEventListener("submit", async function (event) {
    event.preventDefault();
		

    const formData = new FormData(this);
    const response = await fetch("/compare/uploadFile", {
      method: "POST",
      body: formData,
    });

    fileData = await response.json();
    console.log("📌 서버 응답 데이터:", fileData);
		fileUploadState = 1;

    if (!fileData || Object.keys(fileData).length === 0) {
      alert("서버에서 데이터를 받지 못했습니다.");
      return;
    }

    let fileNames = Object.keys(fileData);
    if (fileNames.length < 2) {
      alert("두 개의 파일을 업로드해야 합니다.");
      return;
    }

    currentFile = fileNames[0];
    initializeCriteria();
    renderPagination();
    renderTable();
    updateCriteriaDisplay();
  });

  // 파일별 & 시트별 기준 초기화
  function initializeCriteria() {
    Object.keys(fileData).forEach((file) => {
      selectedCriteria[file] = {};
      selectedRows[file] = {};
      selectedColumns[file] = {};

      let sheetNames = Object.keys(fileData[file]["예시 데이터"]);
      sheetNames.forEach((sheet) => {
        selectedCriteria[file][sheet] = "행 기준"; // 기본적으로 행 기준
        selectedRows[file][sheet] = new Set();
        selectedColumns[file][sheet] = new Set();
      });
    });
  }

  // 모달창에 현재 기준 정보 업데이트
  function updateCriteriaDisplay() {
    let criteriaDisplay = document.getElementById("selectedCriteria");
    let currentSheetName = Object.keys(fileData[currentFile]["예시 데이터"])[currentSheetIndex];

    let selectedRowsText = [...selectedRows[currentFile][currentSheetName]].join(", ") || "없음";
    let selectedColumnsText = [...selectedColumns[currentFile][currentSheetName]].join(", ") || "없음";

    criteriaDisplay.innerHTML = `
      <p><strong>현재 파일:</strong> ${currentFile}</p>
      <p><strong>현재 시트:</strong> ${currentSheetName}</p>
      <p><strong>비교 기준:</strong> ${selectedCriteria[currentFile][currentSheetName]}</p>
      <p><strong>선택된 행:</strong> ${selectedRowsText}</p>
      <p><strong>선택된 열:</strong> ${selectedColumnsText}</p>
    `;

    document.getElementById("rowCriteria").classList.toggle("active", selectedCriteria[currentFile][currentSheetName] === "행 기준");
    document.getElementById("columnCriteria").classList.toggle("active", selectedCriteria[currentFile][currentSheetName] === "열 기준");
  }

  // 행 기준 선택 버튼
  document.getElementById("rowCriteria").addEventListener("click", function () {
    let currentSheetName = Object.keys(fileData[currentFile]["예시 데이터"])[currentSheetIndex];
    selectedCriteria[currentFile][currentSheetName] = "행 기준";
    selectedRows[currentFile][currentSheetName].clear();
    selectedColumns[currentFile][currentSheetName].clear();
    updateCriteriaDisplay();
    alert(`${currentFile}의 ${currentSheetName} 시트에서 행 기준을 선택했습니다.`);
  });

  // 열 기준 선택 버튼
  document.getElementById("columnCriteria").addEventListener("click", function () {
    let currentSheetName = Object.keys(fileData[currentFile]["예시 데이터"])[currentSheetIndex];
    selectedCriteria[currentFile][currentSheetName] = "열 기준";
    selectedRows[currentFile][currentSheetName].clear();
    selectedColumns[currentFile][currentSheetName].clear();
    updateCriteriaDisplay();
    alert(`${currentFile}의 ${currentSheetName} 시트에서 열 기준을 선택했습니다.`);
  });

  // A/B 파일 토글 버튼
  document.getElementById("showFileA").addEventListener("click", function () {
    currentFile = Object.keys(fileData)[0];
    currentSheetIndex = 0;
    renderPagination();
    renderTable();
    updateCriteriaDisplay();
  });
  document.getElementById("showFileB").addEventListener("click", function () {
    currentFile = Object.keys(fileData)[1];
    currentSheetIndex = 0;
    renderPagination();
    renderTable();
    updateCriteriaDisplay();
  });

  // 페이지네이션 생성: 한 번에 하나의 시트만 표시
  function renderPagination() {
    let paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";
    let sheetCount = Object.keys(fileData[currentFile]["예시 데이터"]).length;
    for (let i = 0; i < sheetCount; i++) {
      let btn = document.createElement("button");
      btn.textContent = i + 1;
      btn.className = "pagination-btn";
      if (i === currentSheetIndex) btn.classList.add("active");

      btn.addEventListener("click", function () {
        currentSheetIndex = i;
        renderTable();
        updateCriteriaDisplay();
      });

      paginationContainer.appendChild(btn);
    }
  }

  // 현재 선택된 시트의 예시 테이블 렌더링
  function renderTable() {
    let previewContainer = document.getElementById("previewContainer");
    previewContainer.innerHTML = "";
    let currentSheetName = Object.keys(fileData[currentFile]["예시 데이터"])[currentSheetIndex];
    let sampleData = fileData[currentFile]["예시 데이터"][currentSheetName];

    let sheetTitle = document.createElement("h3");
    sheetTitle.textContent = `📄 시트 이름: ${currentSheetName}`;
    previewContainer.appendChild(sheetTitle);

    let table = document.createElement("table");
    table.className = "table table-bordered table-hover text-center";

    // 테이블 헤더 (컬럼 번호)
    let thead = document.createElement("thead");
    thead.className = "table-light";
    let headerRow = document.createElement("tr");
    for (let col = 0; col < 30; col++) {
      let th = document.createElement("th");
      th.textContent = `컬럼 ${col + 1}`;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 테이블 본문
    let tbody = document.createElement("tbody");
    sampleData.forEach((row, rowIndex) => {
      let tr = document.createElement("tr");
      row.forEach((cell, colIndex) => {
        let td = document.createElement("td");
        let cellValue = cell ? cell.toString() : "";
        if (cellValue.length > 7) {
          td.textContent = cellValue.substring(0, 7) + "...";
          td.setAttribute("title", cellValue);
        } else {
          td.textContent = cellValue;
        }

        // 만약 이전에 선택된 행/열이 있다면 강조 적용
        if (selectedRows[currentFile][currentSheetName].has(rowIndex)) {
          tr.classList.add("selected-row");
        }
        if (selectedColumns[currentFile][currentSheetName].has(colIndex)) {
          td.classList.add("selected-column");
        }

        // 셀 클릭 시 행 또는 열 선택 토글
        td.addEventListener("click", function (event) {
          event.stopPropagation();
          if (selectedCriteria[currentFile][currentSheetName] === "행 기준") {
            if (selectedRows[currentFile][currentSheetName].has(rowIndex)) {
              selectedRows[currentFile][currentSheetName].delete(rowIndex);
              tr.classList.remove("selected-row");
            } else {
              selectedRows[currentFile][currentSheetName].add(rowIndex);
              tr.classList.add("selected-row");
            }
          } else {
            if (selectedColumns[currentFile][currentSheetName].has(colIndex)) {
              selectedColumns[currentFile][currentSheetName].delete(colIndex);
              td.classList.remove("selected-column");
            } else {
              selectedColumns[currentFile][currentSheetName].add(colIndex);
              td.classList.add("selected-column");
            }
          }
          updateCriteriaDisplay();
        });

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    previewContainer.appendChild(table);
  }

  // 마우스 오버/아웃 이벤트로 행/열 강조
  document.getElementById("previewContainer").addEventListener("mouseover", function (event) {
    let target = event.target;
    if (target.tagName === "TD") {
      let row = target.parentElement;
      let table = row.closest("table");
      let currentSheetName = Object.keys(fileData[currentFile]["예시 데이터"])[currentSheetIndex];
      if (selectedCriteria[currentFile][currentSheetName] === "행 기준") {
        // 행 기준: 가로줄 전체 강조
        row.classList.add("hovered-row");
      } else {
        // 열 기준: 세로줄 전체 강조
        let colIndex = Array.from(row.children).indexOf(target);
        let allRows = table.querySelectorAll("tr");
        allRows.forEach(r => {
          let cell = r.children[colIndex];
          if (cell) cell.classList.add("hovered-column");
        });
      }
    }
  });
  document.getElementById("previewContainer").addEventListener("mouseout", function (event) {
    let target = event.target;
    if (target.tagName === "TD") {
      let row = target.parentElement;
      let table = row.closest("table");
      let currentSheetName = Object.keys(fileData[currentFile]["예시 데이터"])[currentSheetIndex];
      if (selectedCriteria[currentFile][currentSheetName] === "행 기준") {
        row.classList.remove("hovered-row");
      } else {
        let colIndex = Array.from(row.children).indexOf(target);
        let allRows = table.querySelectorAll("tr");
        allRows.forEach(r => {
          let cell = r.children[colIndex];
          if (cell) cell.classList.remove("hovered-column");
        });
      }
    }
  });
});
