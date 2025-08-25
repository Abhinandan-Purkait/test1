#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — build / install / release a Headlamp plugin.
# Subcommands:
#   build               Run npm build in src (optionally npm install first).
#   install             Copy dist/main.js and package.json into the Headlamp plugins dir(s).
#   release             Produce a distributable package (npm install, build, npm run package) and copy artifacts to a release dir.
#
# Chainable: ./deploy.sh build install
# Release:   ./deploy.sh release --release-dir releases
#
# Defaults:
#   PLUGIN_NAME=puls8
#   DIST_DIR=dist
#   RELEASE_DIR=releases
#
# Flags:
#   --plugin-name NAME
#   --dist DIR
#   --install-deps              Run "npm install" before "npm run build" in build step.
#   --release-dir DIR           Directory to copy packaged artifacts into (for 'release').

# -----------------------------
# Defaults
# -----------------------------
PLUGIN_NAME="${PLUGIN_NAME:-puls8}"
DIST_DIR="${DIST_DIR:-dist}"
RELEASE_DIR="${RELEASE_DIR:-releases}"
INSTALL_DEPS="false"

# -----------------------------
# Helpers
# -----------------------------
log() { printf '[info] %s\n' "$*"; }
err() { printf '[error] %s\n' "$*" >&2; }

is_macos() { [[ "$(uname -s)" == "Darwin" ]]; }
is_windows_env() {
  case "${OSTYPE:-}" in
    msys*|cygwin*|win32*) return 0 ;;
    *) return 1 ;;
  esac
}
normalize_path() {
  if is_windows_env && command -v cygpath >/dev/null 2>&1; then
    cygpath -u "$1"
  else
    printf '%s' "$1"
  fi
}

# -----------------------------
# Resolve paths
# -----------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$WORKSPACE_DIR/src"
PKG_JSON="$WORKSPACE_DIR/package.json"
DIST_PATH="$WORKSPACE_DIR/$DIST_DIR"
MAIN_JS="$DIST_PATH/main.js"

# -----------------------------
# Parse args
# -----------------------------
SUBCOMMANDS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    build|install|release)
      SUBCOMMANDS+=("$1"); shift ;;
    --plugin-name)
      [[ $# -ge 2 ]] || { err "Missing value for --plugin-name"; exit 1; }
      PLUGIN_NAME="$2"; shift 2 ;;
    --dist)
      [[ $# -gt 1 ]] || { err "Missing value for --dist"; exit 1; }
      DIST_DIR="$2"; DIST_PATH="$WORKSPACE_DIR/$DIST_DIR"; MAIN_JS="$DIST_PATH/main.js"; shift 2 ;;
    --install-deps)
      INSTALL_DEPS="true"; shift ;;
    --release-dir)
      [[ $# -gt 1 ]] || { err "Missing value for --release-dir"; exit 1; }
      RELEASE_DIR="$2"; shift 2 ;;
    -h|--help)
      cat <<EOF
Usage: $0 [build] [install] [release] [--plugin-name NAME] [--dist DIR] [--install-deps] [--release-dir DIR]

Subcommands:
  build                npm run build in src (optionally npm install first)
  install              Copy DIST/main.js and package.json into Headlamp user plugins dir
  release              npm install, npm run build, npm run package; copy package(s) to release dir

Flags:
  --plugin-name NAME   Plugin folder name (default: $PLUGIN_NAME)
  --dist DIR           Dist directory under workspace (default: $DIST_DIR)
  --install-deps       Run npm install before build (applies to 'build')
  --release-dir DIR    Output directory for packaged artifacts (default: $RELEASE_DIR)

Examples:
  $0 build --install-deps
  $0 install --plugin-name puls8 --dist dist
  $0 release --release-dir releases
  $0 build install --plugin-name myplug
EOF
      exit 0 ;;
    *)
      err "Unknown arg: $1"; exit 1 ;;
  esac
done

# Default behavior if none specified
if [[ ${#SUBCOMMANDS[@]} -eq 0 ]]; then
  SUBCOMMANDS=(install)
fi

# -----------------------------
# Build
# -----------------------------
do_build() {
  log "Workspace: $WORKSPACE_DIR"
  log "Source:    $SRC_DIR"
  if [[ "$INSTALL_DEPS" == "true" ]]; then
    log "Installing deps: npm install"
    ( cd "$SRC_DIR" && npm install )
  else
    log "Skipping npm install (use --install-deps to enable)"
  fi
  log "Building: npm run build"
  ( cd "$SRC_DIR" && npm run build )
  if [[ ! -f "$MAIN_JS" ]]; then
    err "Build completed but main.js not found at $MAIN_JS (DIST_DIR=$DIST_DIR)."
    exit 1
  fi
  log "Build OK: $MAIN_JS"
}

# -----------------------------
# Install
# -----------------------------
resolve_user_plugins_root() {
  if is_windows_env; then
    if [[ -z "${APPDATA:-}" ]]; then
      err "APPDATA not set; cannot resolve Windows plugins path"
      return 1
    fi
    normalize_path "$APPDATA/Headlamp/Config/plugins"
  else
    printf '%s' "$HOME/.config/Headlamp/plugins"
  fi
}

do_install() {
  if [[ ! -f "$PKG_JSON" ]]; then
    err "package.json not found at $PKG_JSON"
    exit 1
  fi
  if [[ ! -f "$MAIN_JS" ]]; then
    err "main.js not found at $MAIN_JS (run '$0 build' first or adjust --dist)"
    exit 1
  fi

  local user_root
  user_root="$(resolve_user_plugins_root)" || exit 1
  local user_dir="$user_root/$PLUGIN_NAME"

  log "Installing plugin:"
  log "  Plugin name: $PLUGIN_NAME"
  log "  Dist path:   $DIST_PATH"
  log "  User root:   $user_root"
  log "  Target dir:  $user_dir"

  mkdir -p "$user_dir"
  cp -f "$MAIN_JS" "$user_dir/main.js"
  cp -f "$PKG_JSON" "$user_dir/package.json"
  log "Installed to: $user_dir"

  if is_macos && [[ -d "/Applications/Headlamp.app/Contents/Resources/.plugins" ]]; then
    local mac_dir="/Applications/Headlamp.app/Contents/Resources/.plugins/$PLUGIN_NAME"
    log "Mirroring to macOS app bundle (sudo may prompt): $mac_dir"
    sudo mkdir -p "$mac_dir" || true
    sudo cp -f "$MAIN_JS" "$mac_dir/main.js" || true
    sudo cp -f "$PKG_JSON" "$mac_dir/package.json" || true
    log "Mirrored to: $mac_dir"
  fi
}

# -----------------------------
# Release
# -----------------------------
# Runs a clean production packaging: install deps (always), build, then "npm run package".
# Copies resulting package files (*.tgz or headlamp package artifacts) into RELEASE_DIR.
do_release() {
  log "Release: ensuring dependencies"
  ( cd "$SRC_DIR" && npm install )
  log "Release: building"
  ( cd "$SRC_DIR" && npm run build )
  if [[ ! -f "$MAIN_JS" ]]; then
    err "Build completed but main.js not found at $MAIN_JS (DIST_DIR=$DIST_DIR)."
    exit 1
  fi
  log "Release: packaging (npm run package)"
  ( cd "$SRC_DIR" && npm run package )

  # Collect artifacts: common patterns
  mkdir -p "$WORKSPACE_DIR/$RELEASE_DIR"
  shopt -s nullglob
  # Prefer artifacts placed by headlamp-plugin's packaging (often under src or workspace)
  pkg_candidates=()
  while IFS= read -r -d '' f; do pkg_candidates+=("$f"); done < <(find "$WORKSPACE_DIR" -maxdepth 2 -type f \( -name "*.tar.gz" \) -print0)

  if [[ ${#pkg_candidates[@]} -eq 0 ]]; then
    log "No package artifacts found automatically. Check your npm run package output."
  else
    for f in "${pkg_candidates[@]}"; do
      mv -f "$f" "$WORKSPACE_DIR/$RELEASE_DIR/"
      log "Copied artifact: $(basename "$f") -> $RELEASE_DIR/"
    done
  fi
  log "Release completed. Output dir: $WORKSPACE_DIR/$RELEASE_DIR"
}

# -----------------------------
# Execute
# -----------------------------
for cmd in "${SUBCOMMANDS[@]}"; do
  case "$cmd" in
    build)   do_build ;;
    install) do_install ;;
    release) do_release ;;
    *) err "Unknown subcommand: $cmd"; exit 1 ;;
  esac
done

log "Done."
