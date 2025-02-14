# 받은 엑셀의 시트 수 및 시트 이름을 추출하는 작업

import sys
import json
from openpyxl import load_workbook

def main():
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python ver001_0.py <ARoot> <BRoot>"}))
        sys.exit(1)

    # 명령행 인자에서 파일 경로 가져오기
    file_path_a = sys.argv[1]
    file_path_b = sys.argv[2]

    try:
        # 엑셀 파일 열기
        workbook_a = load_workbook(file_path_a)
        workbook_b = load_workbook(file_path_b)

        # 시트 이름과 시트 수 추출
        sheet_names_a = workbook_a.sheetnames
        sheet_names_b = workbook_b.sheetnames

        sheet_count_a = len(sheet_names_a)
        sheet_count_b = len(sheet_names_b)

        # 결과 생성
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

        # JSON 형식으로 출력
        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
