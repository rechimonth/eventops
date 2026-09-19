# Setup resiliente EventOps (Windows, red inestable). FASE 8.
# 1) caché agresivo + reintentos, 2) fallback a pnpm/yarn si npm falla.
$ErrorActionPreference = 'Continue'
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm config set prefer-offline true

$installed = $false
for ($i = 1; $i -le 3 -and -not $installed; $i++) {
  Write-Host "Intento npm install #$i ..."
  npm install --prefer-offline --no-audit --no-fund --legacy-peer-deps
  if ($LASTEXITCODE -eq 0 -and (Test-Path 'node_modules/.bin/jest')) { $installed = $true }
  else { Start-Sleep -Seconds (30 * $i) }
}
if (-not $installed -and (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host 'Fallback a pnpm...'
  pnpm install --prefer-offline --no-fund
  if ($LASTEXITCODE -eq 0) { $installed = $true }
}
if (-not $installed -and (Get-Command yarn -ErrorAction SilentlyContinue)) {
  Write-Host 'Fallback a yarn...'
  yarn install --prefer-offline --silent
  if ($LASTEXITCODE -eq 0) { $installed = $true }
}
if (-not $installed) { Write-Host 'AVISO: install incompleto. La app corre con EXPO_PUBLIC_USE_MOCKS=true sin backend.'; exit 0 }
npx expo prebuild --clean
# Supabase (cuando haya red): supabase db push --db-url $env:SUPABASE_DB_URL
# EAS Android: eas build -p android --profile preview --non-interactive
