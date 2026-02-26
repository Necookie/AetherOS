param([string]$Path)
(Get-Content $Path) -replace '^pick 2d89cad', 'reword 2d89cad' | Set-Content $Path
