#!/usr/bin/env bash
set -euo pipefail

required_commands=(git node npm ssh rsync curl)
for command_name in "${required_commands[@]}"; do
  command -v "$command_name" >/dev/null || {
    printf 'Missing required command: %s\n' "$command_name" >&2
    exit 1
  }
done

required_secrets=(AI_LAB_DEPLOY_HOST AI_LAB_DEPLOY_USER AI_LAB_DEPLOY_ROOT)
for secret_name in "${required_secrets[@]}"; do
  if [[ -z "${!secret_name:-}" ]]; then
    printf 'Required deployment secret is not injected: %s\n' "$secret_name" >&2
    exit 1
  fi
done

app_slug="$(node -p "JSON.parse(require('fs').readFileSync('app.config.json','utf8')).slug")"
if [[ ! "$app_slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  printf 'Unsafe or invalid app slug: %s\n' "$app_slug" >&2
  exit 1
fi

current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "main" ]]; then
  printf 'Production deployment is allowed only from main; current branch is %s.\n' "$current_branch" >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  printf 'Production deployment requires a clean working tree.\n' >&2
  exit 1
fi

deploy_root="${AI_LAB_DEPLOY_ROOT%/}"
if [[ -z "$deploy_root" || "$deploy_root" == "/" || "$deploy_root" == *".."* || ! "$deploy_root" =~ ^/[A-Za-z0-9._/-]+$ ]]; then
  printf 'AI_LAB_DEPLOY_ROOT is unsafe. It must be a specific absolute web-root path.\n' >&2
  exit 1
fi

deploy_host="$AI_LAB_DEPLOY_HOST"
deploy_user="$AI_LAB_DEPLOY_USER"
deploy_port="${AI_LAB_DEPLOY_PORT:-22}"
if [[ ! "$deploy_host" =~ ^[A-Za-z0-9.-]+$ || ! "$deploy_user" =~ ^[A-Za-z0-9._-]+$ || ! "$deploy_port" =~ ^[0-9]+$ ]]; then
  printf 'Deployment host, user, or port has an invalid format.\n' >&2
  exit 1
fi

git_sha="$(git rev-parse --short=12 HEAD)"
release_path="$deploy_root/.releases/$app_slug/$git_sha"
link_path="$deploy_root/$app_slug"
next_link="$deploy_root/.${app_slug}.next"

ssh_options=(-p "$deploy_port" -o BatchMode=yes -o StrictHostKeyChecking=yes)
if [[ -n "${AI_LAB_DEPLOY_SSH_KEY_FILE:-}" ]]; then
  if [[ ! -f "$AI_LAB_DEPLOY_SSH_KEY_FILE" ]]; then
    printf 'Injected SSH key file does not exist.\n' >&2
    exit 1
  fi
  ssh_options+=(-i "$AI_LAB_DEPLOY_SSH_KEY_FILE")
fi
printf -v rsync_ssh_command '%q ' ssh "${ssh_options[@]}"
rsync_ssh_command="${rsync_ssh_command% }"

printf 'Building commit %s for /%s/\n' "$git_sha" "$app_slug"
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run check:pwa
GIT_SHA="$git_sha" BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)" npm run build
npm run test:e2e

remote="$deploy_user@$deploy_host"
printf -v release_q '%q' "$release_path"
printf -v link_q '%q' "$link_path"
printf -v next_q '%q' "$next_link"

ssh "${ssh_options[@]}" "$remote" "mkdir -p -- $release_q"
rsync -az --delete -e "$rsync_ssh_command" dist/ "$remote:$release_path/"
ssh "${ssh_options[@]}" "$remote" "ln -sfn -- $release_q $next_q && mv -Tf -- $next_q $link_q"

version_url="https://ai-lab.erichweihs.com/$app_slug/version.json?deployment=$git_sha"
deployed_sha="$(curl --fail --silent --show-error --retry 4 --retry-delay 2 "$version_url" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>process.stdout.write(JSON.parse(d).sha))")"
if [[ "$deployed_sha" != "$git_sha" ]]; then
  printf 'Deployment verification failed: expected %s, received %s\n' "$git_sha" "$deployed_sha" >&2
  exit 1
fi

printf 'Verified https://ai-lab.erichweihs.com/%s/ at commit %s\n' "$app_slug" "$git_sha"
