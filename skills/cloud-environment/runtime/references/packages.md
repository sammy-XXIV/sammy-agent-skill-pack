# Install packages

Run builds, Git, browsers, and package managers as the task user. Use the project's package manager and configured registry or mirror. Install language dependencies in the project's environment or a user-owned directory. For browser tests, try the project's runner or an installed compatible browser first.

For a system dependency, check whether `/usr/local/bin/cloud-agent-packages` exists and is executable. Use it to update the package index, then install the exact Debian package names you need. For example, these commands install `jq`.

```sh
sudo -n /usr/local/bin/cloud-agent-packages update &&
  sudo -n /usr/local/bin/cloud-agent-packages install jq
```

If already root, omit `sudo -n` and follow the current command sandbox and approval policy. For a non-root user, request full command escalation for the helper (`sandbox_permissions: "require_escalated"` where supported). Extra writable paths or network access alone cannot enable sudo. If the helper, sudo grant, or escalation is unavailable, use a project-supported user-level alternative when it can satisfy the task. Otherwise report the blocker. Leave sandbox and sudo configuration intact.

The helper accepts `name[:architecture][=version]` from approved repositories. Local archives, extra APT options, repository changes, and removals are unsupported. Keep the inherited proxy and CA settings and TLS verification. For an explicit destination denial, follow [Environment changes](environment-changes.md).
