from fastapi.testclient import TestClient
from backend.main import app
import traceback

try:
    client = TestClient(app, base_url="http://127.0.0.1:8000")
    print("Sending POST request to /api/upload...")
    response = client.post("/api/upload", files={"file": ("test.txt", b"test transcript payload content", "text/plain")})
    print("STATUS:", response.status_code)
    print("TEXT:", response.text)
except Exception as e:
    print("EXCEPTION CAUGHT:")
    traceback.print_exc()
