import re

def parse_transcript(file_content: bytes, filename: str) -> str:
    """
    Parses different transcript formats (.txt, .vtt) into raw text.
    Strips VTT timestamps and metadata to provide clean text for extraction.
    """
    try:
        text = file_content.decode("utf-8", errors="ignore")
    except Exception:
        return ""

    if filename.lower().endswith(".vtt"):
        return parse_vtt(text)
    
    # Default to returning raw text for .txt or unknown extensions
    return text

def parse_vtt(vtt_text: str) -> str:
    """
    Clean up WebVTT files by removing headers, timestamps, and cue IDs.
    """
    lines = vtt_text.splitlines()
    cleaned_lines = []
    
    # Skip the WEBVTT header and optional metadata
    content_started = False
    
    # Regex for VTT timestamp lines (e.g. 00:00.000 --> 00:05.000)
    timestamp_regex = re.compile(r'\d{1,2}:\d{2}:\d{2}\.\d{3} --> \d{1,2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3}')
    
    for line in lines:
        line = line.strip()
        
        # Skip header and empty lines before content
        if not content_started:
            if line == "WEBVTT" or line.startswith("NOTE"):
                continue
            if timestamp_regex.search(line):
                content_started = True
            elif line: # Might be a cue ID starting before a timestamp
                content_started = True
            else:
                continue

        # Skip timestamp lines
        if timestamp_regex.search(line):
            continue
            
        # Skip numeric cue IDs (single lines with just a number)
        if line.isdigit():
            continue
            
        # Skip empty lines
        if not line:
            continue
            
        # Clean up speaker tags if present (e.g. <v Speaker Name>)
        line = re.sub(r'<v\s+([^>]+)>', r'\1: ', line)
        line = re.sub(r'</v>', '', line)
        
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)
