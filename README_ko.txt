AI STUDY - OpenAI 연결 패키지

GitHub 저장소 최상위에 site 폴더 안의 파일들을 업로드/덮어쓰기 하세요.
필수 파일: index.html, app.js, api-config.js, style.css, manifest.webmanifest, sw.js, icon-192.png, icon-512.png, api.py, requirements.txt, .python-version

Render 배포:
- New > Web Service
- GitHub 저장소 ai-study 연결
- Runtime: Python 3
- Root Directory: 비워 둠
- Build Command: pip install -r requirements.txt
- Start Command: gunicorn api:app
- Environment > Add Environment Variable:
  Key: OPENAI_API_KEY
  Value: 본인의 OpenAI API 키 (GitHub에 절대 올리지 마세요)
- Deploy

배포 후 https://서비스이름.onrender.com/ 에서 {"status":"ok"...} 확인.
그 URL을 GitHub의 api-config.js 파일에서 window.AI_API_BASE 값으로 입력하고 commit.
GitHub Pages가 갱신되면 앱에서 데모 모드 체크를 끄고 학습용 문제로 테스트.

주의: OpenAI API 키는 api.py, app.js, api-config.js 또는 GitHub에 절대 입력하지 마세요.
API 사용료가 발생할 수 있습니다. Render 무료 인스턴스는 일정 시간 미사용 시 잠들어 첫 요청이 느릴 수 있습니다.
