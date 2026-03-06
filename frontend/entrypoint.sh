#!/bin/sh

# Default API URL if not provided
API_URL=${API_URL:-/api}

echo "Generating js/config.js with API_URL: $API_URL"

# Generate a config file that can be loaded by index.html
# This is much more robust than sed-ing existing files
cat <<EOF > /usr/share/nginx/html/js/config.js
window.HRMS_CONFIG = {
  API_URL: '$API_URL'
};
EOF

# Execute the CMD (start Nginx)
exec "$@"
