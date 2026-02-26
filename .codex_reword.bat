@echo off
powershell -NoProfile -Command "(Get-Content %1) -replace '^pick 2d89cad', 'reword 2d89cad' | Set-Content %1"
