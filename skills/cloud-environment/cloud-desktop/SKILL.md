---
name: cloud-desktop
description: Open an app in shared Chrome, test a user flow, inspect a Linux window, capture the screen, or hand control to the user. Diagnose missing Cloud desktop tools and Browser Use errors.
---

The Cloud desktop is the remote Cloud computer’s graphical interface, separate from the user’s Codex desktop app, web, or mobile client. You can interact with its shared Chrome session and Linux applications, inspect what is visibly rendered, or let the user watch and take control through the viewer. You can also use the project’s test runner, headless browser automation, or service-level checks.

Choose the method that provides the evidence the task needs. Visible UI state or a native application may require the Cloud desktop. Repeatable assertions or a suite may be better served by automation. Combine methods when that helps diagnose or verify the result, and report what you actually observed. Honor any browser, tab, device, or test mode the user specifies. Cloud-local URLs can be opened inside shared Chrome without forwarding them to the user's device.

## Open and inspect

Use the running app if it is ready. To start it, follow the environment’s **Start skill** and its readiness check when available, or use the project’s usual command and verify it responds. When starting an app, avoid managed browser ports such as `8000` and `8085`, even if they appear free. If the app’s port conflicts, use the project’s supported port override and verify the app responds on the new port. For a UI fix, reproduce the problem when possible and repeat those steps after the change. Use the Linux desktop for native windows, file pickers, or flows that cross apps. For example, open an exported PDF to check its layout.

For the Cloud desktop, follow the first-call instructions on the desktop JavaScript tool offered for this turn (usually `cua_repl.js`). To open a new tab in shared Chrome, use `await cua.createBrowserTab("cdp", url)` when offered. To find an existing tab, use `await cua.getState()` and follow the tool’s tab selection or claiming instructions. For a native window or a screenshot of the whole desktop, follow the same tool’s computer-use instructions. Inspect what loaded before reporting success.

When the user asks to see a visual result, or an image or video would help communicate the outcome, capture or export the relevant visual to a file on the Cloud computer. Keep credentials and unrelated sensitive content out of shared captures. Verify the saved result and include it in the final chat reply using a supported inline media format or a clickable link to its absolute path. A screenshot visible only in a tool trace does not deliver the visual to the user.

If the user requests a recording, use a recorder that can capture the chosen tab or window. Keep sign-in and credentials out of the footage. Play back the saved video to verify it shows the requested steps, then link the file in this chat.

## Let the user watch or take over

When the user wants to watch or interact with the Cloud desktop, open the viewer with `open_in_codex({"target":{"type":"cloud-desktop"}})` if offered. In supported Codex desktop chats, the user can also choose **New tab (+) → Desktop** in the right panel. For sign-in or another handoff, have the user select **Take over** and pause your input. After they select **Return control**, inspect the same screen before continuing. Closing the panel leaves the desktop running.

## Preview or share an app

If the user wants a preview or link to an app running on the Cloud computer, use this plugin’s `cloud-environment-runtime` Skill and read its Service previews reference. For a website the user wants to share with other people, use Codex Sites when available and set the intended audience through its publishing workflow.

## If Browser Use can't load its permissions

On `Browser Use could not read requirements` or `Cannot retrieve cloud browser requirements`, try using Chrome as a regular desktop app. Follow the computer-use instructions from the same JavaScript tool (usually `cua_repl.js`) to inspect the Chrome window and continue with the mouse and keyboard. Follow the tool's permissions. Never switch tools to get around a denied site or action.

If the task needs a browser-only feature, tell the user which step is blocked and how to retry it. Check this Cloud computer’s internet settings. If internet access is off or ChatGPT is blocked, include the next step even when the user asks to keep settings unchanged. For example, “I can click and type in Chrome, but to inspect the page structure I need to check browser permissions with ChatGPT. If you want me to retry, allow `chatgpt.com` under **Internet access** in this Cloud environment’s settings. Other sites can stay blocked.”

Leave settings unchanged unless the user wants help applying the change. Then follow [Environment changes](../runtime/references/environment-changes.md) to request approval. If access is already allowed, retry once without broadening it.

If Chrome itself won't start, native windows may still work. If a page won't load, check the app's port or compare the same URL with the shell's configured HTTP client before suggesting a network change.

## If you can't control the desktop

Check `cloud_environment.environment_status({})` for the matching `environment_id` if available. Once the environment is running, check whether this chat offers its desktop JavaScript tool. If `capabilities[].remote_desktop.enabled` is explicitly `false`, explain that the desktop is disabled here and offer a project test. Respect any separate restriction on agent control.

A missing desktop entry or `state: unknown` doesn't tell you whether the desktop works. Status can stay unknown after startup. Try the desktop tool or viewer when offered. Either can start an idle display. Check what opens instead of polling for readiness.

If the tool is missing with no explicit restriction, check for these files in the Cloud shell.

```sh
ls -Ld /usr/local/bin/cloud-agent-browser-runtime \
  /opt/codex/marketplaces/openai-bundled/plugins/unified-computer-use/.codex-plugin/plugin.json
```

- **“No such file or directory.”** If the user needs desktop control, offer a fresh environment in plain language. For example, “This Cloud environment may have been created before desktop control was available. To try it, start a new chat and choose **Cloud → Default**, or create a new environment with your project settings. Your work stays here, and the new chat has its own workspace.”
- **Both files exist, or you can't inspect them.** The plugin can be installed without being enabled for this chat. If `observations_current` is true and status reports `browser_setup_failed`, explain that browser setup failed and suggest a new chat with the same environment, keeping this one open. Otherwise say “I can’t click or type on this Cloud computer in this chat.” Don't try to enable the plugin or recommend rebuilding.

Lead with what you can still do in plain language. Keep internal tool names and file paths out of the explanation. If the viewer works, offer to open it and name the step they can do with **Take over**. If a project test can answer their question, run it and say what it verified. If still blocked, give them the failed step, short error and environment ID for support.
