$base = "http://localhost:5001"
$loginUrl = "$base/auth/login"
$profileUrl = "$base/api/profile"

$body = @{
    id = "doctor-123"
    password = "password"
} | ConvertTo-Json


try {
    Write-Host "Checking server reload status..."
    $reloadParams = @{ Uri = "$base/api/test-reload"; Method = "Get"; ErrorAction = "Stop" }
    $reloadResponse = Invoke-RestMethod @reloadParams
    Write-Host "Server Reload Check: $($reloadResponse.message)"
} catch {
    Write-Host "Server Reload Check Failed: Server code is STALE. Needs restart."
}

try {
    Write-Host "Logging in..."
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $body -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful. Token: $token"

    Write-Host "Fetching profile..."
    $headers = @{
        Authorization = "Bearer $token"
    }

    Write-Host "Testing /api/profile/test..."
    try {
        $testResponse = Invoke-RestMethod -Uri "$base/api/profile/test" -Method Get -Headers $headers
        Write-Host "Test Response: $($testResponse | ConvertTo-Json)"
    } catch {
        Write-Host "Test route failed: $($_.Exception.Message)"
    }

    $profileResponse = Invoke-RestMethod -Uri $profileUrl -Method Get -Headers $headers
    Write-Host "Profile Response:"
    $profileResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error occurred:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
