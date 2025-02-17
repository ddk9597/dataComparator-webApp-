document.getElementById("uploadForm").addEventListener("submit", async function(event) {
	event.preventDefault();
	
	const formData = new FormData(this);
	const response = await fetch("/compare/uploadFile", {
			method: "POST",
			body: formData
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

	previewContainer.innerHTML = ""; 

	if (!result || Object.keys(result).length === 0) {
			console.error("서버에서 받은 데이터가 비어있습니다.");
			return;
	}

	Object.keys(result).forEach(fileName => {
			const fileData = result[fileName];
			if (!fileData["예시 데이터"]) {
					console.error(`예시 데이터가 없습니다: ${fileName}`);
					return;
			}
			
			const fileSection = document.createElement("div");
			fileSection.innerHTML = `<h3>${fileName} (시트 수: ${fileData['시트 수']})</h3>`;
			
			Object.entries(fileData['예시 데이터']).forEach(([sheetName, sampleData]) => {
					const table = document.createElement("table");
					table.border = "1";

					sampleData.forEach(row => {
							const tr = document.createElement("tr");
							row.forEach(cell => {
									const td = document.createElement("td");
									td.textContent = cell || "";
									tr.appendChild(td);
							});
							table.appendChild(tr);
					});

					fileSection.appendChild(table);
			});

			previewContainer.appendChild(fileSection);
	});
});
