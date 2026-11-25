---
name: cloud-environment-runtime
description: Use when a task needs guidance on a managed Codex Cloud computer’s workspace, tools, setup, SSH, network access, or service previews.
---

The selected Cloud environment is your computer for this task. Use its workspace, shell, installed applications, and configured connections to do the work and verify the result.

When you start or resume work on the Cloud computer, call `cloud_environment.environment_status({})` if available. Check again after its configuration changes. Its `environment_id` identifies the machine it describes. Its `portals` are configured inbound connections to that machine, identified by protocol and port. A configured connection does not establish that a service is running. If status is unavailable or describes a different machine, continue with what you can verify on the selected computer. Discard earlier status when the machine changes or detaches.

- **Work with files or code.** Each task has its own workspace. A Default environment can start without a repository. On resume, inspect the files already there and preserve existing edits. For repo work, use the matching checkout or connected provider. Read [Repositories](references/repositories.md) to verify a requested revision, find a missing checkout, or resolve a provider access issue.
- **Start a server.** Avoid ports reserved for Cloud system services, even if nothing is listening yet; desktop and browser services can start on demand. These include `22` (SSH), `8000` (browser auth), `8001` (CUA MCP gateway), `8080` (browser config), `8081` (Neko), `8082` (Neko proxy), `8083` (reserved browser service port), `8085` (browser controller), `9222` (Chromium CDP), `31460` (browser extension server), and `50002` (Neko WebRTC TCP mux, when configured). Check for other listeners before choosing a port, and never stop a system service to free one. For a user-facing HTTP preview, prefer an available HTTP port configured in `environment_status.portals`.
- **Inspect the Cloud desktop.** The Cloud desktop is the remote computer's graphical interface, separate from the user's Codex desktop app, web, or mobile client. Use this plugin’s `cloud-desktop` skill to explore a running Cloud app, investigate a visual bug interactively, use an existing browser session or native window, or hand control to the user. Honor any browser, tab, device, or test mode the user names.
- **Run a suite or repeat a check.** Use the project’s test command and its configured browser mode. For new scripted checks, prefer headless automation such as Playwright for repeatable assertions, viewport sweeps, and scripted captures. Use a visible browser when the check depends on a real display. If a scripted check fails, reproduce the failing step in the app when it would help explain the failure.
- **Preview a service for the user.** The app runs on the Cloud computer. An authenticated HTTP preview works on desktop, web, and mobile. SSH forwarding opens it locally on the computer running the user's Codex desktop app. Read [Service previews](references/previews.md) before choosing a connection, opening a preview, or helping configure a missing port.
- **Deliver a file.** Open or read back the result in its intended format and link its absolute path in the originating chat. On supported desktop clients, **Save as…** downloads a copy.
- **Set up tools.** Read [Packages](references/packages.md) before installing dependencies or [Docker](references/docker.md) before building or running containers.
- **Connect to a service.** Read [Networking](references/networking.md) to check current policy and credentials, then test the intended service with its actual client. For a configured VPN or a private connectivity problem, also read [VPN](references/vpn.md).
- **Provide a terminal SSH command.** Use these steps when the user explicitly asks to connect to the Cloud environment from a terminal over SSH. For app previews, follow [Service previews](references/previews.md). Confirm the selected executor and its `environment_id`, and verify an SSH portal when status can report it. On that executor, run `id -un` for the SSH user and `ssh-keygen -lf /run/codex-ssh/host_key.pub -E sha256` for the trusted host fingerprint. If SSH is unavailable, say so instead of guessing connection details.

  Give the user this command to run locally, replacing `USER` and `ENV_ID` with the verified values, and the SHA256 fingerprint to check before accepting the host key:

  ```sh
  ssh -o 'ProxyCommand=codex tcp-tunnel --environment-id %n' USER@ENV_ID
  ```

  Keep `%n`: OpenSSH lowercases `%h`, but environment IDs are case-sensitive. Mention CLI version or `codex login` only for setup or troubleshooting.
- **Change or repair the environment.** Read [Environment changes](references/environment-changes.md) for onboarding, adding repositories to the configuration, or changing access. Read [Diagnostics](references/diagnostics.md) before inspecting setup logs.
