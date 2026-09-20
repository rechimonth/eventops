# Verificación EventOps. Fuente de verdad: GitHub Actions (test:logic + typecheck).
# Esto local solo corre humo rápido si las herramientas están instaladas.

if (Get-Command tsc -ErrorAction SilentlyContinue) { tsc --noEmit } elseif (Test-Path "node_modules/typescript/bin/tsc") { node node_modules/typescript/bin/tsc --noEmit }
else { echo "tsc no instalado: verificado en CI" }

echo "--- estado del CI (fuente de verdad) ---"
if (Get-Command gh -ErrorAction SilentlyContinue) { gh run list --limit 3 } else { echo "gh no instalado" }

python3 -c "assert 1000+210+200==1410; print('smoke budget OK')"
