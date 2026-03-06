#!/bin/sh

# Default API URL if not provided
API_URL=${API_URL:-/api}

echo "Injecting API_URL: $API_URL"

# Replace the placeholder in all JS files
# We use | as a delimiter in case the URL contains slashes
find /usr/share/nginx/html/js -name "*.js" -exec sed -i "s|__API_URL_PLACEHOLDER__|$API_URL|g" {} +

# Execute the CMD (start Nginx)
exec "$@"
