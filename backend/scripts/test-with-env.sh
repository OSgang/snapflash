#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$BACKEND_DIR/.env.test.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Copy backend/.env.test.example to backend/.env.test.local and fill in Neon test credentials."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

required_vars=(
  NEON_TEST_DATASOURCE_URL
  NEON_TEST_FLYWAY_URL
  NEON_TEST_USERNAME
  NEON_TEST_PASSWORD
  JWT_SIGNER_KEY
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: $var_name"
    exit 1
  fi
done

if [[ "${#JWT_SIGNER_KEY}" -lt 32 ]]; then
  echo "JWT_SIGNER_KEY must be at least 32 characters long."
  exit 1
fi

cd "$BACKEND_DIR"
exec ./gradlew test "$@"
