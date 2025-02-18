document.addEventListener("DOMContentLoaded", function () {
	let isRowCriteria = true;
	let selectedRows = new Set();
	let selectedColumns = new Set();
	let currentFile = ""; // 현재 선택된 파일 (사용자 파일명)
	let currentSheetIndex = 0; // 현재 선택된 시트 인덱스
	let fileData = {}; // 서버에서 받은 데이터 저장

	// 📌 파일 업로드 후 데이터 로드
	document.getElementById("uploadForm").addEventListener("submit", async function (event) {
			event.preventDefault();

			const formData = new FormData(this);
			const response = await fetch("/compare/uploadFile", {
					method: "POST",
					body: formData,
			});

			fileData = await response.json();
			console.log("📌 서버 응답 데이터:", fileData); // ✅ 데이터 확인 로그 추가

			if (!fileData || Object.keys(fileData).length === 0) {
					alert("서버에서 데이터를 받지 못했습니다.");
					return;
			}

			if (fileData.status === "error") {
					alert("Python 실행 오류: " + fileData.message);
					return;
			}

			// 📌 사용자가 업로드한 파일명 가져오기
			let fileNames = Object.keys(fileData); // 예: ["문화재정보A.xlsx", "문화재정보B.xlsx"]
			if (fileNames.length < 2) {
					alert("두 개의 파일을 업로드해야 합니다.");
					return;
			}

			currentFile = fileNames[0]; // 기본적으로 첫 번째 파일을 선택
			renderPagination();
			renderTable();
	});

	// 📌 페이지네이션 버튼 생성
	function renderPagination() {
			let paginationContainer = document.getElementById("paginationContainer");
			paginationContainer.innerHTML = "";

			if (!fileData[currentFile]) {
					console.error("📌 데이터 없음: fileData[currentFile]이 존재하지 않습니다.");
					return;
			}

			let sheetCount = Object.keys(fileData[currentFile]["예시 데이터"]).length;
			for (let i = 0; i < sheetCount; i++) {
					let btn = document.createElement("button");
					btn.textContent = i + 1;
					btn.className = "pagination-btn";
					if (i === currentSheetIndex) btn.classList.add("active");

					btn.addEventListener("click", function () {
							currentSheetIndex = i;
							renderTable();
							updatePaginationButtons();
					});

					paginationContainer.appendChild(btn);
			}
	}

	// 📌 페이지네이션 버튼 업데이트 (선택된 버튼 강조)
	function updatePaginationButtons() {
			let buttons = document.querySelectorAll(".pagination-btn");
			buttons.forEach((btn, index) => {
					btn.classList.toggle("active", index === currentSheetIndex);
			});
	}

	// 📌 현재 선택된 시트만 표시
	function renderTable() {
			let previewContainer = document.getElementById("previewContainer");
			previewContainer.innerHTML = "";

			if (!fileData[currentFile]) {
					console.error("📌 데이터 없음: fileData[currentFile]이 존재하지 않습니다.");
					return;
			}

			let sheetNames = Object.keys(fileData[currentFile]["예시 데이터"]);
			if (sheetNames.length === 0) return;

			let selectedSheet = sheetNames[currentSheetIndex]; // 현재 선택된 시트
			let sampleData = fileData[currentFile]["예시 데이터"][selectedSheet];

			let sheetTitle = document.createElement("h3");
			sheetTitle.className = "text-secondary mt-2";
			sheetTitle.textContent = `📄 시트 이름: ${selectedSheet}`;
			previewContainer.appendChild(sheetTitle);

			let tableWrapper = document.createElement("div");
			tableWrapper.className = "table-responsive mt-3";

			let table = document.createElement("table");
			table.className = "table table-bordered table-hover text-center";

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

			let tbody = document.createElement("tbody");
			sampleData.forEach((row) => {
					let tr = document.createElement("tr");
					row.forEach((cell) => {
							let td = document.createElement("td");
							let cellValue = cell ? cell.toString() : "";

							if (cellValue.length > 7) {
									td.textContent = cellValue.substring(0, 7) + "...";
									td.setAttribute("title", cellValue);
							} else {
									td.textContent = cellValue;
							}

							tr.appendChild(td);
					});
					tbody.appendChild(tr);
			});

			table.appendChild(tbody);
			tableWrapper.appendChild(table);
			previewContainer.appendChild(tableWrapper);
	}

	// 📌 A/B 파일 토글 버튼
	document.getElementById("showFileA").addEventListener("click", function () {
			let fileNames = Object.keys(fileData);
			if (fileNames.length < 2) return;

			currentFile = fileNames[0]; // ✅ 업로드한 첫 번째 파일로 변경
			currentSheetIndex = 0;
			renderPagination();
			renderTable();
	});

	document.getElementById("showFileB").addEventListener("click", function () {
			let fileNames = Object.keys(fileData);
			if (fileNames.length < 2) return;

			currentFile = fileNames[1]; // ✅ 업로드한 두 번째 파일로 변경
			currentSheetIndex = 0;
			renderPagination();
			renderTable();
	});

	// 📌 기준 업데이트
	function updateSelectedCriteria() {
			let criteriaText = isRowCriteria ? `선택된 행: ${[...selectedRows].join(", ")}` : `선택된 열: ${[...selectedColumns].join(", ")}`;
			document.getElementById("selectedCriteria").textContent = criteriaText;
	}
});
