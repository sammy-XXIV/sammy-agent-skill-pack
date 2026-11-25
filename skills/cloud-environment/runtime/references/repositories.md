# Work with repositories

A Cloud task can have zero, one, or several checkouts. Match the host and full owner or group path. Run commands in the matching checkout. If it is missing, open the supplied repository URL or search the connected Git provider. Use the matching GitHub.com, GitHub Enterprise Cloud, or GitLab.com connection for that host. Clone when authorized and the task needs local files.

When the user names a branch, tag, or SHA, resolve it to a commit. For a pull or merge request, use the provider’s head revision and its comparison base for a review. For “latest,” check the current remote ref. Before testing a specific revision, compare it with the checkout’s `HEAD` and inspect local changes. If the revision differs or existing edits would affect the result, use a separate worktree or checkout when supported. Preserve the user’s branch and edits. Report which commit you tested.

If GitHub access is in doubt, test the checkout’s existing HTTPS remote (for example, `git ls-remote origin HEAD` for a remote named `origin`). The checkout can work without a CLI login. A successful read establishes access to that repository. Check API or push permissions separately when needed. If GitHub requests reauthentication, reconnect that connection in **Settings → Plugins** in the same workspace. Follow SSO or 2FA guidance when the reported failure calls for it.

Distinguish a missing connection, denied access, no match, an empty repository, and a missing branch. Providers can conceal private repositories behind a 404. If **Publish** rejects an existing clone, inspect its origin, commit, and working tree.
