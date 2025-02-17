document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("uploadForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(this);
      const response = await fetch("/compare/uploadFile", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("서버 응답:", result);

      if (result.status === "error") {
        alert("Python 실행 오류: " + result.message);
        return;
      }

      const previewContainer = document.getElementById("previewContainer");
      if (!previewContainer) {
        console.error("previewContainer 요소를 찾을 수 없습니다!");
        return;
      }

      previewContainer.innerHTML = ""; // 기존 내용 초기화
      previewContainer.classList.add("table-responsive"); // 반응형 스타일 적용

      Object.keys(result).forEach((fileName) => {
        const fileData = result[fileName];

        // 파일 제목 섹션
        const fileSection = document.createElement("div");
        fileSection.innerHTML = `<h3 class="mt-4 text-primary">${fileName} (시트 수: ${fileData["시트 수"]})</h3>`;

        Object.entries(fileData["예시 데이터"]).forEach(
          ([sheetName, sampleData]) => {
            // 테이블 컨테이너
            const tableWrapper = document.createElement("div");
            tableWrapper.className = "table-responsive mt-3";

            // 시트 제목
            const sheetTitle = document.createElement("h5");
            sheetTitle.className = "text-secondary mt-2";
            sheetTitle.textContent = `📄 시트 이름: ${sheetName}`;
            tableWrapper.appendChild(sheetTitle);

            // 테이블 생성
            const table = document.createElement("table");
            table.className = "table table-bordered table-hover text-center";

            // 테이블 헤더
            const thead = document.createElement("thead");
            thead.className = "table-light";
            const headerRow = document.createElement("tr");

            for (let col = 0; col < 30; col++) {
              const th = document.createElement("th");
              th.textContent = `컬럼 ${col + 1}`;
              headerRow.appendChild(th);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // 테이블 본문 (데이터 표시)
            const tbody = document.createElement("tbody");
            sampleData.forEach((row) => {
              const tr = document.createElement("tr");
              row.forEach((cell) => {
                const td = document.createElement("td");
                const cellValue = cell ? cell.toString() : ""; // null 값 방지

                if (cellValue.length > 7) {
                  td.textContent = cellValue.substring(0, 7) + "..."; // 7자 초과 시 ... 처리
                  td.setAttribute("title", cellValue); // 전체 값은 툴팁으로 표시
                } else {
                  td.textContent = cellValue;
                }

                tr.appendChild(td);
              });
              tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            tableWrapper.appendChild(table);
            fileSection.appendChild(tableWrapper);
          }
        );

        previewContainer.appendChild(fileSection);
      });
    });

  // ----------------------------------------------------------------------------

	let isRowCriteria = true; // 기본적으로 행 기준
	let selectedRows = new Set();
	let selectedColumns = new Set();
	let currentFile = "A"; // 현재 표시 중인 파일 (A 또는 B)
	let currentSheetIndex = 0; // 현재 선택된 시트 인덱스

	// 📌 기준 파일 설정 버튼
	document.getElementById("setCriteriaA").addEventListener("click", function () {
			currentFile = "A";
			alert("기준 파일 (A)을 선택했습니다.");
	});

	document.getElementById("setCriteriaB").addEventListener("click", function () {
			currentFile = "B";
			alert("비교 파일 (B)을 선택했습니다.");
	});

	// 📌 행 기준 버튼
	document.getElementById("rowCriteria").addEventListener("click", function () {
			isRowCriteria = true;
			selectedRows.clear();
			selectedColumns.clear();
			updateSelectedCriteria();
			alert("행 기준을 선택했습니다. 원하는 행을 클릭하세요.");
	});

	// 📌 열 기준 버튼
	document.getElementById("columnCriteria").addEventListener("click", function () {
			isRowCriteria = false;
			selectedRows.clear();
			selectedColumns.clear();
			updateSelectedCriteria();
			alert("열 기준을 선택했습니다. 원하는 열을 클릭하세요.");
	});

	// 📌 A/B 파일 토글 버튼
	document.getElementById("showFileA").addEventListener("click", function () {
			currentFile = "A";
			renderTable();
	});

	document.getElementById("showFileB").addEventListener("click", function () {
			currentFile = "B";
			renderTable();
	});

	// 📌 예시 테이블 클릭 이벤트
	document.getElementById("previewContainer").addEventListener("click", function (event) {
			let target = event.target;
			if (target.tagName === "TD") {
					let row = target.parentElement;
					let table = row.closest("table");

					if (isRowCriteria) {
							// ✅ 행 기준: 가로줄(행) 전체 하이라이트
							let rowIndex = row.rowIndex;
							if (selectedRows.has(rowIndex)) {
									selectedRows.delete(rowIndex);
									row.classList.remove("selected-row");
							} else {
									selectedRows.add(rowIndex);
									row.classList.add("selected-row");
							}
					} else {
							// ✅ 열 기준: 세로줄(열) 전체 하이라이트
							let colIndex = Array.from(row.children).indexOf(target);
							if (colIndex >= 0) {
									let allRows = table.querySelectorAll("tr");
									if (selectedColumns.has(colIndex)) {
											selectedColumns.delete(colIndex);
											allRows.forEach((r) =>
													r.children[colIndex].classList.remove("selected-column")
											);
									} else {
											selectedColumns.add(colIndex);
											allRows.forEach((r) =>
													r.children[colIndex].classList.add("selected-column")
											);
									}
							}
					}
					updateSelectedCriteria();
			}
	});

	// 📌 예시 테이블 마우스 호버 이벤트 (행/열 강조)
	document.getElementById("previewContainer").addEventListener("mouseover", function (event) {
			let target = event.target;
			if (target.tagName === "TD") {
					let row = target.parentElement;
					let table = row.closest("table");

					if (isRowCriteria) {
							// ✅ 행 기준 → 가로줄(행) 전체 강조
							highlightRow(row, true);
					} else {
							// ✅ 열 기준 → 세로줄(열) 전체 강조
							let colIndex = Array.from(row.children).indexOf(target);
							if (colIndex >= 0) {
									highlightColumn(table, colIndex, true);
							}
					}
			}
	});

	document.getElementById("previewContainer").addEventListener("mouseout", function (event) {
			let target = event.target;
			if (target.tagName === "TD") {
					let row = target.parentElement;
					let table = row.closest("table");

					if (isRowCriteria) {
							// ✅ 행 기준 → 가로줄(행) 강조 해제
							highlightRow(row, false);
					} else {
							// ✅ 열 기준 → 세로줄(열) 강조 해제
							let colIndex = Array.from(row.children).indexOf(target);
							if (colIndex >= 0) {
									highlightColumn(table, colIndex, false);
							}
					}
			}
	});

	// 📌 특정 열(세로줄) 전체를 하이라이트하는 함수
	function highlightColumn(table, colIndex, highlight) {
			let allRows = table.querySelectorAll("tr");
			allRows.forEach(row => {
					let cell = row.children[colIndex];
					if (cell) {
							cell.classList.toggle("hovered-column", highlight);
					}
			});
	}

	// 📌 특정 행(가로줄) 전체를 하이라이트하는 함수
	function highlightRow(row, highlight) {
			row.classList.toggle("hovered-row", highlight);
	}

	// 📌 시트 페이지네이션 처리
	function renderPagination(sheetCount) {
			let paginationContainer = document.getElementById("paginationContainer");
			paginationContainer.innerHTML = "";
			for (let i = 0; i < sheetCount; i++) {
					let btn = document.createElement("button");
					btn.textContent = i + 1;
					btn.className = "pagination-btn";
					if (i === currentSheetIndex) btn.classList.add("active");
					btn.addEventListener("click", function () {
							currentSheetIndex = i;
							renderTable();
					});
					paginationContainer.appendChild(btn);
			}
	}

	// 📌 기준 업데이트
	function updateSelectedCriteria() {
			let criteriaText = isRowCriteria
					? `선택된 행: ${[...selectedRows].join(", ")}`
					: `선택된 열: ${[...selectedColumns].join(", ")}`;
			document.getElementById("selectedCriteria").textContent = criteriaText;
	}
});
