# Cloud environment networking

Use the actual client against the intended service. For HTTP(S), start in the normal command sandbox with the inherited proxy variables and CA trust. Keep `HTTP_PROXY`, `HTTPS_PROXY`, their lowercase variants, and `NO_PROXY` as supplied. For a read-only HTTP check, compare the response code with the service's expected status. This prints only the code and any connection error.

```sh
curl -sS --max-time 20 -o /dev/null -w '%{http_code}\n' "$service_url"
```

The Cloud proxy resolves hostnames, enforces destination policy, and can inject credentials for matching HTTPS requests. A local DNS failure can coexist with a working proxied request. Keep TLS verification enabled. Clients with pinned certificates or custom trust stores may need a configured TLS passthrough route. For inbound access to an app, use the platform's preview or port-forwarding controls.

## When the request fails

- **Cannot reach the proxy.** The sandbox can use a loopback bridge. Check whether a managed networking rule blocks the bridge. If the bridge is unreachable and policy permits a retry, use the command tool's approval flow to try the same request outside the sandbox (`sandbox_permissions="require_escalated"` where supported).
- **Shell works, app fails.** Try the same URL in the affected browser or desktop app. A successful shell request verifies only that path. Check the app’s proxy and CA settings before proposing a new domain grant.
- **Destination denied.** Identify which layer denied the request. Check the actual hostname and redirects against the environment policy, which also applies outside the sandbox. For a missing grant, follow [environment changes](environment-changes.md). If an Enterprise **Agent Security** rule blocked the request, identify the rule for a workspace admin. A denial from the service itself calls for checking service permissions. Platform blocks and protected proxy addresses apply in both HTTP modes. Initial checkout and environment registration have separate grants.
- **Request limited.** Check the response body and headers to identify a proxy error. Honor `Retry-After` on a `429`. For a proxy `503` with `Request size too large`, reduce the payload. For `Average request size too large`, slow the upload.
- **Git LFS transfer fails.** A successful Git checkout can still leave LFS objects unavailable. Check the repository connection, then the host and method of the failed LFS action. Keep TLS and lock verification enabled, and redact signed URLs and authorization headers.

## Check which policy applies

| Source | What to check |
| --- | --- |
| `cloud_environment.environment_status` | Confirm `observations_current: true` before reporting a setting as applied. For network policy, require `network_policy.state: enforced`. For a secret, runtime variable, or outbound identity, check that its `state` is `ready`. After a change, test a new connection. Existing streams can continue. |
| `/etc/codex/network-policy.json` | The selected executor's startup snapshot. `http_network_policy.egress_rules` lists the expanded startup rules. |
| `http://proxy:8099/status` | Live proxy policy, VPN state, and routes. If needed, use an approved command outside the sandbox: `curl --noproxy proxy -fsS --max-time 5 http://proxy:8099/status`. Direct sidecar addresses are only reachable from the outer executor. |

If status is stale or unavailable, report what the client verified and which settings remain unknown. Omit unrelated internal hosts, routes, and DNS details.

For restricted HTTP, `network_policy.allowed_hosts` lists custom hosts and `presets` names enabled bundles. When available, `preset_allowed_hosts` expands those bundles and `effective_allowed_hosts` lists the full desired allowlist. An exact host rule covers its paths, methods, and ports. `*.example.com` covers subdomains. Add `example.com` separately to allow the apex.

## Use a configured identity

Use secret names and identity aliases from status, then try the service's normal SDK or CLI. Network access and credential scope are separate checks. The proxy substitutes placeholders only on matching routes, including scheme, hostname, port, method, and path. Keep credential values out of commands and output.

To select a cloud identity, find its `alias` and `provider_kind` in the `connections` list in the version 1 manifest at `OIC_MANIFEST_PATH`. `is_default` marks the provider default. Set these selectors for that command. Preserve inherited auth headers, guard variables, and credential bindings.

| Provider | Manifest field → environment variable |
| --- | --- |
| Azure | `identity_endpoint` → `IDENTITY_ENDPOINT`, `config_dir` → `AZURE_CONFIG_DIR` |
| AWS | `alias` → `AWS_PROFILE`, `config_file` → `AWS_CONFIG_FILE` |
| GCP | `config_dir` → `CLOUDSDK_CONFIG`, `configuration_name` → `CLOUDSDK_ACTIVE_CONFIG_NAME`, `credentials_file` → `GOOGLE_APPLICATION_CREDENTIALS` |

For a CLI setup failure, check the entry's `setup` outcome. On older Azure environments, the configured default Azure CLI identity can work without a manifest. Try it when the task permits the default. If you cannot select the required identity, report which manifest, version, alias, or selector is missing or unsupported.

## Install the forwarding tool at runtime

For a configured VPN or a private-network problem, follow [Tailscale VPN access](vpn.md). It covers automatic access, legacy grants, native HTTP CONNECT, and local forwarding for clients that need it.
