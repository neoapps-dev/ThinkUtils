#!/bin/bash
set -e

echo "Installing ThinkUtils polkit policy..."

# Copy policy file
sudo cp polkit/com.thinkutils.policy /usr/share/polkit-1/actions/

# Reload polkit
sudo systemctl reload polkit || true

echo "✓ Policy installed successfully"
echo ""
echo "The policy allows authentication caching with 'auth_admin_keep'."
echo "After entering your password once, it will be cached for a few minutes."
