# Change an environment

## Unblock the current task

Use `cloud_environment.request_changes` when offered to propose repository, HTTP access, runtime variable, or network secret changes for the running machine. Explain what the change enables and request the owner's approval. Omit `environment_id` for the current instance, or pass another managed instance ID selected in this chat. When the tool is unavailable, the user can edit the running environment from its settings in the Codex desktop chat when offered.

- Each supplied category replaces its contents. Omit unchanged categories. If you cannot identify which entries to keep, ask before proposing a change.
- Use existing vault references for credentials. Network credentials need both a matching allowed domain and a network policy that permits it. For a blocked destination, [check which policy applies](networking.md#when-the-request-fails) before changing settings. If the grant is outside the environment's published policy, a source configuration editor can review it and, when offered, add it in the running chat’s desktop settings.
- If confirmation is pending, continue independent work. If a save is uncertain, verify the settings on the selected instance before resubmitting. After a confirmed save, check the observed revision and any failure with `cloud_environment.environment_status` if it covers the target instance. Use the [readiness checks](networking.md#check-which-policy-applies) before relying on a changed setting. Retry on the target with a fresh connection or process.

## Change what future tasks receive

Applying settings in a chat changes that machine. If the user wants to update the source configuration for future chats, have them choose **Promote** when offered and review any conflicting settings before overriding them. Personal bindings stay personal. If a Default chat has no promotion action, use environment setup to create or edit a reusable configuration.

In a setup chat, follow the Cloud Environment Onboarding plugin’s `setup` skill when offered. Read the current draft before editing. Where supported, propose a network mode or domains for the user to review. Have the user enter secret values only in settings.

When the draft tool supports repositories, use existing checkouts and clone missing required repos. Inspect all project checkouts, then save the full list with `update_environment_config_draft`, one entry per repo.

Tell the user what to review in settings and continue independent setup. When offered, **Save draft** can update the running setup environment. Recheck status and test the changed access. Once setup is idle and required settings are reviewed and saved, **Publish** makes the configuration and snapshot available to future tasks. Other running tasks keep their current version. To verify the reusable setup, check it in a new task started from the published version.
