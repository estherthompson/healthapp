#!/bin/bash
# Run pod install from the ios folder. Use this if `pod` isn't in your zsh PATH.
set -e
cd "$(dirname "$0")"
if command -v pod &>/dev/null; then
  pod install
elif [ -x /usr/local/bin/pod ]; then
  /usr/local/bin/pod install
elif [ -x /opt/homebrew/bin/pod ]; then
  /opt/homebrew/bin/pod install
else
  echo "CocoaPods not found. Install with: sudo gem install cocoapods"
  echo "Or use the full path to pod (e.g. $(which pod 2>/dev/null || echo '/usr/local/bin/pod'))"
  exit 1
fi
