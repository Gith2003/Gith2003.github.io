@echo off
cd /d "%~dp0"
start http://127.0.0.1:4175/
python -m http.server 4175 --bind 127.0.0.1
