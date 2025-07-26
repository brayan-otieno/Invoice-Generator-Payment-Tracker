# Windows PowerShell script for initializing the development environment
Write-Host "🚀 Setting up Invoice Generator & Payment Tracker development environment..." -ForegroundColor Green

# Check for required tools
$requiredTools = @("node", "npm", "git", "docker", "docker-compose")
foreach ($tool in $requiredTools) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Error: $tool is required but not installed." -ForegroundColor Red
        exit 1
    }
}

# Check Node.js version
$nodeVersion = (node -v) -replace 'v','' -split '\.' | Select-Object -First 1
if ([int]$nodeVersion -lt 16) {
    Write-Host "❌ Error: Node.js 16 or higher is required. Current version: $(node -v)" -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
npm install

# Set up backend
Set-Location server
Write-Host "🔧 Setting up backend..." -ForegroundColor Cyan
npm install

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📄 Creating .env file for backend..." -ForegroundColor Cyan
    Copy-Item .env.example -Destination .env
    Write-Host "ℹ️ Please update the .env file with your configuration." -ForegroundColor Yellow
}

# Set up frontend
Set-Location ..\client
Write-Host "🖥️  Setting up frontend..." -ForegroundColor Cyan
npm install

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📄 Creating .env file for frontend..." -ForegroundColor Cyan
    Copy-Item .env.example -Destination .env
    Write-Host "ℹ️ Please update the .env file with your configuration." -ForegroundColor Yellow
}

# Generate SSL certificates if they don't exist
Set-Location ..
if (-not (Test-Path "nginx/ssl/localhost.crt") -or -not (Test-Path "nginx/ssl/localhost.key")) {
    Write-Host "🔐 Generating SSL certificates..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path "nginx/ssl" | Out-Null
    
    # Generate self-signed certificate
    $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -Type SSLServerAuthentication
    $certPath = "cert:\LocalMachine\My\$($cert.Thumbprint)"
    
    # Export certificate
    Export-Certificate -Cert $certPath -FilePath "nginx/ssl/localhost.crt" -Type CERT | Out-Null
    
    # Export private key (requires OpenSSL)
    $mypwd = ConvertTo-SecureString -String "password" -Force -AsPlainText
    $pfxPath = "nginx/ssl/localhost.pfx"
    Export-PfxCertificate -Cert $certPath -FilePath $pfxPath -Password $mypwd | Out-Null
    
    # Convert to .key format using OpenSSL if available
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        openssl pkcs12 -in $pfxPath -out nginx/ssl/localhost.key -nocerts -nodes -password pass:password
        openssl pkcs12 -in $pfxPath -out nginx/ssl/localhost.crt -clcerts -nokeys -password pass:password
        Remove-Item $pfxPath
    } else {
        Write-Host "ℹ️ OpenSSL not found. Using .pfx certificate. Install OpenSSL and run 'openssl pkcs12 -in nginx/ssl/localhost.pfx -out nginx/ssl/localhost.key -nocerts -nodes'" -ForegroundColor Yellow
    }
    
    Write-Host "ℹ️ SSL certificates generated. You may need to trust the certificate in your browser." -ForegroundColor Yellow
}

# Build Docker containers
Write-Host "🐳 Building Docker containers..." -ForegroundColor Cyan
docker-compose build

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nTo start the application in development mode, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "`nOr start with Docker:" -ForegroundColor Cyan
Write-Host "  docker-compose up" -ForegroundColor White
Write-Host "`nThe application will be available at:" -ForegroundColor Cyan
Write-Host "  - Frontend: https://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API: https://localhost:5000" -ForegroundColor White
Write-Host "  - MongoDB: mongodb://localhost:27017" -ForegroundColor White
Write-Host "  - MongoDB UI: http://localhost:8081" -ForegroundColor White
Write-Host "`nHappy coding! 🎉" -ForegroundColor Green
