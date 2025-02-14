# 받은 엑셀의 시트 수 및 시트 이름을 추출하는 작업

from openpyxl import load_workbook

# 엑셀 파일 경로
file_path_a = "/mnt/data/문화재정보A.xlsx"
file_path_b = "/mnt/data/문화재정보B.xlsx"

# 엑셀 파일 열기
workbook_a = load_workbook(file_path_a)
workbook_b = load_workbook(file_path_b)

# 시트 이름과 시트 수 추출
sheet_names_a = workbook_a.sheetnames
sheet_names_b = workbook_b.sheetnames

sheet_count_a = len(sheet_names_a)
sheet_count_b = len(sheet_names_b)

result = {
    "문화재정보A.xlsx": {
        "시트 수": sheet_count_a,
        "시트 이름": sheet_names_a
    },
    "문화재정보B.xlsx": {
        "시트 수": sheet_count_b,
        "시트 이름": sheet_names_b
    }
}

result
