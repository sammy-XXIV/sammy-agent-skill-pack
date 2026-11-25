# Build and run Docker containers

Fresh customer environments on the default image use rootless Docker. Restored, custom, or internal images can differ. As the task user, probe the managed socket even if a saved context or inherited settings point to a different daemon.

```sh
env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS \
    -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH \
    docker --host=unix:///var/run/docker.sock info --format '{{.ServerVersion}}'
```

Use the same local endpoint for builds and runs. If the shell targets another daemon, use the same `env -u` options and explicit `--host` for those commands too. Preserve `DOCKER_CONFIG` and registry credentials.

## Build with HTTPS

Docker's client supplies the session proxy to builds and new containers. Keep its configured address. The executor's `proxy` hostname, certificate store, and package registry mirror settings do not automatically carry into an inner container. If a dependency installs on the host but fails in a build, check which registry the build actually contacts.

Try the project's normal build and trust settings first. If HTTPS needs the session CA, use the project's existing build option or mount the CA as a BuildKit secret in each step that needs it. For a session-only adjustment, adapt a temporary copy of the Dockerfile and preserve the original build context and ignore rules. For example, an npm build can use this step.

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=proxy_ca,required=true \
    NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca npm ci --strict-ssl=true
COPY . .
```

Set `session_dockerfile` to the path of the adapted copy and build with the project's usual context (here, `.`).

```sh
docker build -f "$session_dockerfile" --secret id=proxy_ca,src="$CODEX_PROXY_CERT" -t app .
```

For Buildx or Compose, supply the secret through the build configuration. Keep the session CA out of image layers. For clients that replace their normal trust roots, mount the executor's combined bundle (`/etc/ssl/certs/ca-certificates.crt`) and point the client at its mounted path. Requests uses `REQUESTS_CA_BUNDLE`, pip uses `PIP_CERT`, and uv supports `SSL_CERT_FILE`. For Java or other tools with a separate trust store, configure that store for the step. Keep TLS verification enabled.

## Run with HTTPS

Bind-mount the CA read-only and point the process at the mount. This example uses Node 22.21 or newer, where `NODE_USE_ENV_PROXY=1` makes `fetch` use the proxy.

```sh
docker run --rm \
    --mount "type=bind,src=$CODEX_PROXY_CERT,dst=/run/proxy-ca.pem,readonly" \
    -e NODE_EXTRA_CA_CERTS=/run/proxy-ca.pem -e NODE_USE_ENV_PROXY=1 \
    node:22-bookworm-slim \
    node -e 'fetch("https://registry.npmjs.org").then(r => { if (!r.ok) process.exit(1); })'
```

Recreate containers that still have a previous session's proxy address.

## Diagnose the failing step

- **Local socket.** Check whether Docker is installed, the socket exists, and the task user can access it (`id`, `ls -l /var/run/docker.sock`). Cloud can finish provisioning even if Docker is disabled or its startup failed. For a rootless image, check the managed socket at `/run/codex-docker/docker.sock` too. If only that socket works, use it explicitly and report the broken standard socket.
- **FUSE mount.** Privileged Kata guests can expose `/dev/fuse`. Check for the character device and the image’s mount helper (for example, `fusermount3`). A nested container also needs an authorized device mapping and mount permissions. If the device or permissions are missing, report the failing layer.
- **Daemon recovery.** If Docker is disabled, use a project-supported alternative if it satisfies the task. Start a stopped daemon only if the task already runs as root, the active environment allows rootful Docker, and the image documents a startup procedure. Check for a running `dockerd` first. Starting a second daemon or restarting a live one can disrupt containers. Preserve its storage driver, data directory, socket group, proxy environment, and system CA trust. Use a fresh execution directory after a restore, then repeat the socket probe. For a rootless or unconfirmed profile, or a non-root task user, report the failed probe and request recovery through the managed environment.
- **Image pull.** Check the registry error, authentication, rate limit, and destination policy. The daemon uses its own proxy and trust settings for pulls. Build arguments affect only build steps.
- **Build or container request.** Check the exact failing step's proxy and CA mount. For a policy denial, follow [Environment changes](environment-changes.md). Keep traffic on the configured proxy. Report the error without printing Docker configuration, registry credentials, or the full process environment.
