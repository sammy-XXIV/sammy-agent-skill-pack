# Service previews

The app runs on the Cloud computer. Cloud's `localhost` reaches the app only inside that computer.

There are three ways to see it:

- **HTTP preview** is an authenticated hosted URL for the environment owner. It works from the user's Codex desktop app, web, or mobile client. The app's port must be configured under HTTP Previews. This does not publish the app publicly.
- **SSH forwarding** connects a Cloud app port to a local URL on the computer running the user's Codex desktop app. `open_cloud_preview` creates the connection using Cloud SSH access. The app port does not need an HTTP preview setting. The returned URL works only on that user's computer, and the app handles authentication.
- **Cloud desktop** is the remote Cloud computer's graphical interface, including shared Chrome. Use the `cloud-desktop` skill to inspect the app there or open its viewer for the user. The Cloud desktop is distinct from the user's Codex desktop app.

For a website link intended for other people, use Codex Sites when available and publish for the intended audience.

## Check

1. Determine where the user wants to open the app. Honor explicit hosted-only or private-only requests. Use current client information if available. A Desktop instruction or tool from an earlier turn may persist after a device switch. Ask where to open the preview only if the answer changes the route.
2. Call `cloud_environment.environment_status({})` for the selected environment. In `portals`, a matching `protocol: http` and app port identifies an HTTP preview. Its `url` is the hosted link. `protocol: ssh`, normally port 22, identifies SSH access. Discover `open_cloud_preview` among the offered tools if forwarding is relevant.
3. When choosing the app port, exclude the Cloud system ports listed under **Start a server** in the runtime Skill and check for existing listeners. Prefer a suitable configured HTTP port among the remaining ports. Start or keep the app running and verify its response. For HTTP preview, verify it listens on `0.0.0.0` at that port.

## Choose and reply

For an ordinary preview, use these options in order:

1. Check for a suitable configured HTTP preview. If one is ready, link its exact `url`.
2. If HTTP is unavailable, try SSH forwarding when the user's destination can use the Codex desktop app and `open_cloud_preview` is offered. Call `open_cloud_preview({port: APP_PORT})` and link its exact `localUrl`, labeled local to that computer. If the tool is absent, the user may be on web or mobile, or forwarding may be unavailable for another reason. Tool availability alone does not establish the current client.
3. If neither connection works, guide the user through adding an HTTP preview port when hosted access is acceptable.

Honor explicit hosted-only or private-only requests. For a private-only preview on the user’s Codex desktop app, if status confirms SSH access is disabled, ask the owner to enable **SSH access** under **Edit Environment** and choose **Apply to this chat**, then recheck and try forwarding. If the editor or forwarding tool is unavailable, explain what is needed. A temporary forwarding failure can be retried if useful. Move to the available fallback without dwelling on routine setup failures; explain an error when it affects the user's next step or they ask for troubleshooting. Stop on authorization denial. A forward being established does not verify that the user's browser loaded the page. For a broken forwarded link, recheck the app and reconnect the chat in the user's Codex desktop app.

## Missing or unavailable HTTP preview

Only say a port is missing after a successful lookup confirms no matching HTTP entry. Ask the owner to open **Edit Environment → HTTP Previews**, add the exact app port, and choose **Apply to this chat**. Edits to a saved Agent Config affect new runtimes. If necessary, start a new runtime with that config. `cloud_environment.request_changes` cannot add preview ports.

After the change, refresh status, recheck the selected environment and app listener, and link the exact matching URL. Start the app again if a new runtime was required.

If status fails, describes another environment, reports `portals_error`, or lacks a valid `portals` list, retry once and explain any remaining discovery problem. An offered SSH forward can still be tried for the user's Codex desktop app when SSH status is unknown. If the HTTP port exists without a URL, refresh and report that the link is not ready instead of asking to add the port again. Never invent a URL or return Cloud's localhost as a user-accessible link.
