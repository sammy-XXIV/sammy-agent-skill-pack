# Tailscale VPN access

Tailscale is optional. When configured, it runs in the Cloud proxy. Check `cloud_environment.environment_status` for the selected environment. The `vpn_configured` flag in the startup snapshot (`/etc/codex/network-policy.json`) can be stale. If current status confirms there is no VPN, use the environment’s ordinary network policy. If the task needs a tailnet-only service, explain which access is missing.

For a configured VPN, `vpn_enrollment_failed` in `capabilities[].vpn.failure` means non-platform traffic is blocked. Report the failure and have the user check the VPN configuration or contact support. Otherwise, verify access with the intended service. If status is unavailable, report what you could verify.

| Task | Connection to use |
| --- | --- |
| Reach a private HTTP(S) service | Use the inherited HTTP proxy, CA trust, and normal client in the sandbox. This path supports scoped credential injection. Follow [networking](networking.md) if the proxy is unreachable or denies the request. |
| Reach a private TCP service such as PostgreSQL | If the client supports HTTP CONNECT, point it at `proxy:8088` and pass the service hostname and port for proxy-side DNS. Otherwise use a local relay. In both cases the application authenticates and verifies the service's TLS or SSH identity. Proxy credential placeholders do not work here. |

Direct access to `proxy:8088` requires the outer executor. Use the command tool's approval flow (`sandbox_permissions="require_escalated"` where supported). If unavailable, report the limitation.

## Check access to the destination

- **Automatic access.** If `automatic_tailscale_access: true`, destinations routed over Tailscale need no manual domain or CIDR grant. The proxy captures advertised public IPv4 subnets at enrollment. A newly advertised public subnet needs a fresh proxy. Other public HTTP traffic follows the public internet policy. Raw TCP requires Tailscale transport for every resolved IPv4 address. Protected destinations stay blocked on both listeners.
- **Legacy access.** If a VPN-enabled snapshot omits the field or sets it to false, check the grant for the selected listener. HTTP rules apply to HTTP(S). For raw TCP, a literal IPv4 needs a matching private CIDR in `tcp_network_access`. A hostname needs an exact or `*.` domain match and no additional CIDR. Wildcards exclude the apex. Grants cover all TCP ports. Changed TCP grants require a replacement environment using the new configuration version.
- **Enrollment.** **Save draft** does not re-enroll the running VPN. A newly added VPN needs **Publish**. A changed key needs fresh enrollment. Follow [environment changes](environment-changes.md) and retry the actual service. The executor has no VPN interface. Leave Tailscale installation and routing to the platform.
- **DNS.** Send the original service hostname to the proxy. Fresh enrollment accepts split DNS and MagicDNS. Older proxies that lack this support need recreation and fresh enrollment. If an authorized IP works but the hostname fails, investigate tailnet DNS and preserve the service hostname for TLS.

## Install the forwarding tool at runtime

If the client needs a relay, use the image’s maintained `socat` with TCP and proxy support when available. Set `SOCAT` to its absolute path. Otherwise use the bundled [socat installer](../scripts/ensure-socat.sh) on a supported image. Set `RUNTIME_SKILL_DIR` to the absolute directory containing the runtime `SKILL.md` and capture the executable path the installer prints.

```sh
SOCAT="$(bash "$RUNTIME_SKILL_DIR/scripts/ensure-socat.sh")"
```

If the skill is available only through resource reads, save the linked script in the selected executor and run `bash` on that path. The installer verifies pinned package checksums and reuses `${XDG_CACHE_HOME:-$HOME/.cache}/cloud-environment`. It needs Linux x86_64, glibc 2.38+, OpenSSL 3, `bash`, `curl`, `sha256sum`, `mktemp`, and `dpkg-deb`.

The first install needs HTTPS access to `deb.debian.org`. If policy blocks it, propose a temporary HTTP grant for that exact host and preserve existing rules. Once enforcement is current, rerun the installer and confirm a second run succeeds from cache. Propose removing only the added rule. A replacement environment or cleared cache may need download access again.

## Forward an authorized endpoint

Run the relay and client in the same outer network namespace. A separate sandbox command has its own loopback.

Choose a free, unprivileged loopback port. Start the forward and keep its session or PID so you can stop it after the client finishes. `resolve=0` passes the original hostname to the proxy for authorization and DNS.

```sh
"$SOCAT" -d -d TCP4-LISTEN:15432,bind=127.0.0.1,reuseaddr,fork \
  PROXY:proxy:db.example.internal:5432,proxyport=8088,resolve=0
```

Run the client with the local address for transport and the service hostname for certificate verification. Use the service's trusted CA if required.

```sh
psql 'host=db.example.internal hostaddr=127.0.0.1 port=15432 sslmode=verify-full connect_timeout=10'
```

For an HTTPS service already forwarded from remote port 443 to local 18443, keep the original URL. Bypass the HTTP proxy **only** for that loopback forward.

```sh
curl --noproxy service.example.internal --max-time 20 \
  --connect-to service.example.internal:443:127.0.0.1:18443 \
  https://service.example.internal/
```

## Diagnose a failed connection

- **No local listener.** Check `"$SOCAT" -V`, `getent hosts proxy`, and `ss -ltn` in the outer executor. Check shell policy if it blocks listeners or the proxy. Rerun the installer to recover the cached path. For a damaged cache, remove only its versioned socat directory and rerun.
- **CONNECT rejected.** The local listener starts CONNECT only when the client connects. For `403`, check the CONNECT destination and applicable grant. `vpn_no_ipv4` means no IPv4 answer. `vpn_protected_destination` means an address is protected or would use non-Tailscale transport. Keep the block in place. A `503` with `vpn_not_ready` or `vpn_policy_unavailable` needs operator investigation.
- **CONNECT succeeds but the service fails.** Check protocol, service CA, and application authentication. For timeouts, check tailnet ACLs, accepted subnet routes, firewalls, and the service listener. Each additional TCP endpoint needs its own forward. UDP, QUIC, ICMP, inbound access, and transparent routing are unsupported. Recreate forwards after restart and reconnect after VPN loss.

Report the intended host and port, execution path, and sanitized error. If only an approved outer command or integrated terminal succeeds, identify that path. For unresolved failures use [environment diagnostics](diagnostics.md).
