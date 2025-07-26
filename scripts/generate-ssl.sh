#!/bin/bash

# Create ssl directory if it doesn't exist
mkdir -p nginx/ssl

# Generate a self-signed SSL certificate
openssl req -x509 \
  -newkey rsa:4096 \
  -nodes \
  -days 365 \
  -keyout nginx/ssl/localhost.key \
  -out nginx/ssl/localhost.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Set appropriate permissions
chmod 400 nginx/ssl/localhost.key
chmod 444 nginx/ssl/localhost.crt

echo "SSL certificates generated successfully in nginx/ssl/ directory"
echo "You may need to trust the certificate in your operating system:"
echo "- Windows: Double-click localhost.crt and install in 'Trusted Root Certification Authorities'"
echo "- macOS: sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain nginx/ssl/localhost.crt"
echo "- Linux (Ubuntu/Debian): sudo cp nginx/ssl/localhost.crt /usr/local/share/ca-certificates/ && sudo update-ca-certificates"
