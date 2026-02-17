WHISPER VOICE INPUT - MODEL DOWNLOAD INSTRUCTIONS
=================================================

To enable offline voice input, download the Whisper model file:

1. Download ggml-base.bin from:
   https://huggingface.co/ggerganov/whisper.cpp/tree/main

   Direct link: https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin

2. Place the downloaded file in this folder:
   app/models/ggml-base.bin

File size: ~142 MB

Alternative models (different sizes/accuracy):
- ggml-tiny.bin (~75 MB) - Fastest, less accurate
- ggml-small.bin (~466 MB) - Better accuracy
- ggml-medium.bin (~1.5 GB) - High accuracy
- ggml-large.bin (~2.9 GB) - Best accuracy

Note: If no model is present, the app will use browser-based
speech recognition (Web Speech API) as a fallback.
This requires an internet connection and works best in Chrome/Edge.
