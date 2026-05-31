#!/bin/sh
# ============================================================
#  BharatTools Frontend — Setup Script
#  Run once after cloning: sh setup-hooks.sh
# ============================================================

echo "🔧 Setting up git hooks..."
git config core.hooksPath .githooks

# Make sure the hook is executable (important on Linux/Mac)
chmod +x .githooks/pre-push

echo "✅ Git hooks configured! Direct pushes to 'main' are now blocked."
echo "   Push to a feature branch and open a PR instead."
