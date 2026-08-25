// Every outbound link the site uses, in one place. The invite URL in
// particular used to be pasted into three components, which is exactly
// how a permissions integer drifts out of sync.

export const DISCORD_CLIENT_ID = '1520771362246103091'

export const INVITE_URL =
  `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
  '&permissions=1392442207446&integration_type=0&scope=bot+applications.commands'

export const SUPPORT_SERVER_URL = 'https://discord.gg/Rtnrd5G38a'

export const GITHUB_URL = 'https://github.com/ender803km'

// The one label used for the primary conversion everywhere on the site.
// The nav shortens it to "Invite" for space; nothing else varies it.
export const INVITE_LABEL = 'Invite to Discord'
