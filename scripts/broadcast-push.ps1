param(
    [Parameter(Mandatory = $true)] [string] $Titulo,
    [Parameter(Mandatory = $true)] [string] $Mensagem,
    [string] $DatabaseUrl = $env:DATABASE_URL,
    [string] $UsuarioId,
    [string] $Link,
    [hashtable] $Dados = @{}
)

if ($Link) { $Dados.url = $Link }

if (-not $DatabaseUrl) {
    Write-Error "Defina `$env:DATABASE_URL ou passe -DatabaseUrl com a connection string do Postgres (Render External Database URL)."
    exit 1
}

if ($UsuarioId) {
    $query = "SELECT token FROM expo_push_token WHERE id_usuario = '$UsuarioId';"
    Write-Host "Filtrando para id_usuario = $UsuarioId"
} else {
    $query = "SELECT token FROM expo_push_token;"
}
$tokens = & psql $DatabaseUrl -t -A -c $query 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao consultar tokens: $tokens"
    exit 1
}

$tokens = $tokens | Where-Object { $_ -match '^ExponentPushToken\[' }
$total = $tokens.Count
Write-Host "Tokens encontrados: $total"
if ($total -eq 0) { exit 0 }

$batchSize = 100
$enviados = 0
$falhas = 0

for ($i = 0; $i -lt $total; $i += $batchSize) {
    $fim = [Math]::Min($i + $batchSize - 1, $total - 1)
    $batch = $tokens[$i..$fim]

    $payload = @()
    foreach ($t in $batch) {
        $msg = @{
            to       = $t
            title    = $Titulo
            body     = $Mensagem
            sound    = "default"
            priority = "high"
        }
        if ($Dados.Count -gt 0) { $msg.data = $Dados }
        $payload += $msg
    }

    $body = $payload | ConvertTo-Json -Depth 6 -Compress
    if ($payload.Count -eq 1) { $body = "[" + $body + "]" }
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

    try {
        $resp = Invoke-RestMethod -Uri "https://exp.host/--/api/v2/push/send" `
            -Method Post `
            -ContentType "application/json; charset=utf-8" `
            -Headers @{ "accept" = "application/json"; "accept-encoding" = "gzip, deflate" } `
            -Body $bodyBytes
        $ok = ($resp.data | Where-Object { $_.status -eq "ok" }).Count
        $err = ($resp.data | Where-Object { $_.status -ne "ok" }).Count
        $enviados += $ok
        $falhas += $err
        Write-Host ("Lote {0}-{1}: ok={2} erro={3}" -f ($i + 1), ($fim + 1), $ok, $err)
        $resp.data | Where-Object { $_.status -ne "ok" } | ForEach-Object {
            Write-Host ("  ! {0}: {1}" -f $_.status, $_.message) -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host ("Lote {0}-{1} falhou: {2}" -f ($i + 1), ($fim + 1), $_.Exception.Message) -ForegroundColor Red
        $falhas += $batch.Count
    }
}

Write-Host ""
Write-Host ("Total enviado: {0} | Falhas: {1}" -f $enviados, $falhas)
