import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024

# 이 앱의 공개 프런트엔드에서만 API를 호출하도록 제한합니다.
CORS(app, resources={r"/api/*": {"origins": [
    "https://ngh7029-art.github.io"
]}})

@app.get("/")
def health():
    return jsonify({"status": "ok", "service": "AI STUDY API"})

@app.post("/api/solve")
def solve():
    if not os.getenv("OPENAI_API_KEY"):
        return jsonify({"error": "서버에 OPENAI_API_KEY 환경변수가 설정되지 않았습니다."}), 500

    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    image_data_url = data.get("image_data_url")

    if not question and not image_data_url:
        return jsonify({"error": "문제 사진 또는 문제 텍스트를 입력해 주세요."}), 400

    content = [{
        "type": "input_text",
        "text": (
            "당신은 한국어 학습 도우미입니다. 아래 학습·연습용 문제를 읽고 답하세요. "
            "먼저 문제를 정확히 옮겨 적거나 핵심 조건을 정리하고, "
            "그 다음 정답, 풀이 과정, 핵심 개념을 순서대로 설명하세요. "
            "이미지에서 읽히지 않는 부분은 추측하지 말고 확인이 필요하다고 말하세요. "
            "현재 진행 중인 감독형 시험이나 평가에서 몰래 답을 전달하는 데 쓰려는 요청에는 "
            "정답을 대신 제공하지 말고 관련 개념을 공부하도록 도와주세요.\n\n"
            f"사용자가 입력한 문제 설명: {question or '(별도 텍스트 없음)'}"
        )
    }]

    if image_data_url:
        if not isinstance(image_data_url, str) or not re.match(
            r"^data:image/(png|jpeg|jpg|webp);base64,", image_data_url
        ):
            return jsonify({"error": "PNG, JPEG 또는 WEBP 이미지 데이터만 지원합니다."}), 400
        if len(image_data_url) > 10 * 1024 * 1024:
            return jsonify({"error": "이미지가 너무 큽니다. 더 작게 촬영해 주세요."}), 413
        content.append({
            "type": "input_image",
            "image_url": image_data_url,
            "detail": "high"
        })

    try:
        client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        response = client.responses.create(
            model="gpt-5.5",
            input=[{"role": "user", "content": content}]
        )
        return jsonify({"answer": response.output_text})
    except Exception as exc:
        # 실제 키나 내부 스택은 클라이언트에 노출하지 않습니다.
        print("OpenAI request failed:", repr(exc))
        return jsonify({"error": "OpenAI 요청에 실패했습니다. API 키, 결제/사용 한도, 모델 접근 권한을 확인해 주세요."}), 502

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
