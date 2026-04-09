from backend.extractor import extract_insights
import traceback

try:
    with open('test_transcript.txt', 'r') as f:
        text = f.read()
    print("Testing extraction...")
    result = extract_insights(text)
    print("SUCCESS: ", result)
except Exception as e:
    print("FAILED EXCEPTION:")
    traceback.print_exc()
