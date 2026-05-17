#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE="$ROOT_DIR/.android-env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  echo "Create it with JAVA_HOME and ANDROID_HOME values."
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

: "${JAVA_HOME:?JAVA_HOME is required in .android-env}"
: "${ANDROID_HOME:?ANDROID_HOME is required in .android-env}"

export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
exec "$@"
