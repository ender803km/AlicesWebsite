// Structured command reference for A.L.I.C.E.
//
// GENERATED FROM THE BOT SOURCE, not written by hand. Every command name,
// argument list, description and permission below was read out of the bot
// repo's own command builders (`new SlashCommandBuilder()` /
// `ContextMenuCommandBuilder`), and every module name and description tracks
// the `meta` manifest each module registers with the bot's feature registry
// (core/features.js). Module `id`s match the anchors the old table of
// contents used, so existing deep links keep working.
//
// access: 'everyone' | 'mods' | 'admin' | 'manageExpressions'
// kind:   'slash' | 'prefix' | 'context' | 'both'
//         'both' marks a slash command that also answers to the `?` text
//         prefix — see the Text Prefix Bridge module for the alias list.

export const CATEGORIES = [
  {
    id: 'moderation',
    name: 'Moderation',
    blurb:
      'Automod across two tiers, anonymous warnings, a hard safety lock, and the ' +
      'single dashboard that configures every other module.',
    modules: [
      {
        id: 'moderation',
        name: 'Moderation',
        emoji: '🛡',
        description:
          'A two-tier filter plus an anonymous warning system. Tier 1 is a plain-text ' +
          'pass that deletes and warns on its own for slurs, Discord invite links, ' +
          'emoji spam, excessive caps, repeated messages and rapid short-message spam — ' +
          'no command needed, and its thresholds are tunable per server. Tier 2 is an ' +
          'opt-in LLM check that reads context before acting, and routes anything it ' +
          'flags as self-harm or child-safety to their own private alert channels ' +
          'rather than burying it in the mod log. Three warnings inside 24 hours jails ' +
          'a member for 3 hours. Channels can be exempted from the spam checks (slurs ' +
          'and invites still apply everywhere).',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/warn',
                args: '<user> <reason> [message_id]',
                desc:
                  'Anonymously warn a user. Optionally reference a message in the current ' +
                  'channel to delete it along with the warning.',
                access: 'mods',
                kind: 'slash',
              },
              {
                name: 'Warn Message',
                args: null,
                desc:
                  'Context-menu action that warns a message\'s author directly, with the message ' +
                  'auto-filled and deleted, same as /warn.',
                access: 'mods',
                kind: 'context',
              },
              {
                name: '/warns',
                args: '[user]',
                desc: 'Check warnings for a user, and when they reset.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/clearwarns',
                args: '<user>',
                desc: 'Clear warnings for a user (mods only).',
                access: 'mods',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        name: 'Server Setup',
        emoji: '⚙️',
        description:
          'Everything a server admin configures now lives behind one command. /setup ' +
          'dashboard opens an interactive screen listing every module, with ' +
          'Enable/Disable and a Configure page per module — log and announcement ' +
          'channels, the jailed role, the starboard threshold, the counting and ' +
          'one-word-story channels, giveaway host role, economy sub-toggles, and the ' +
          'Weekly Rotation\'s winner role. It replaced the old per-thing subcommands ' +
          '(/setup channels, /setup starboard, /setup counting and the rest), so there ' +
          'is one place to look rather than eight.',
        groups: [
          {
            title: null,
            note:
              'Disabling a module warns you about anything that depends on it, and modules ' +
              'that hard-require another one cannot be enabled until it is on.',
            commands: [
              {
                name: '/setup dashboard',
                args: null,
                desc: 'Open the interactive settings dashboard for this server.',
                access: 'admin',
                kind: 'slash',
              },
              {
                name: '/setup challenges-launch',
                args: null,
                desc:
                  'Start this server\'s Weekly Rotation phase clock. One-time and cannot be ' +
                  'undone — standalone challenges go live immediately, the rotation itself ' +
                  'unlocks 7 days later.',
                access: 'admin',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'safetylock',
        name: 'Safety Lock',
        emoji: '🔒',
        description:
          'A hard safe word for a designated channel. Saying it — in any spelling or ' +
          'spacing — immediately removes Send Messages from the configured role in that ' +
          'channel, with no reliance on anyone choosing to stop. Configured from the ' +
          'dashboard; it has no commands of its own on purpose, so it cannot be ' +
          'triggered or bypassed by one.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
            ],
          },
        ],
      },
      {
        id: 'membercleanup',
        name: 'Member Cleanup',
        emoji: '🧹',
        description:
          'Wipes a departed member\'s stats and economy data after a grace period, so a ' +
          'server that churns does not carry ghost entries on its leaderboards forever. ' +
          'Runs on its own. Requires Stat Bot and Economy to be enabled.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'economy',
    name: 'Economy',
    blurb:
      'Coins, jobs, gambling, fishing and hunting, pets that earn while you sleep, ' +
      'gifting, six-person alliances, and a different scoring theme every day of ' +
      'the week.',
    modules: [
      {
        id: 'economy',
        name: 'Economy',
        emoji: '💰',
        description:
          'The currency hub, and the reason people open the server every day. Coins are ' +
          'earned by talking, working, grinding and gambling, banked at interest, spent ' +
          'in three different shops, and quietly generated in the background by pets on ' +
          'display. Fishing and hunting need real tools that wear out, get enhanced and ' +
          'can be deployed from a Tool Shed while you are offline.',
        groups: [
          {
            title: 'Currency & Banking',
            note: null,
            commands: [
              {
                name: '/balance',
                args: '[user]',
                desc: 'Check your wallet and bank balance.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/deposit',
                args: '<amount>',
                desc: 'Deposit coins from your wallet into the bank.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/withdraw',
                args: '<amount>',
                desc: 'Withdraw coins from your bank to your wallet.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/transfer',
                args: '<user> <amount>',
                desc: 'Send coins from your wallet to another user.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/daily',
                args: null,
                desc: 'Claim your daily coins.',
                access: 'everyone',
                kind: 'both',
              },
            ],
          },
          {
            title: 'Grinding',
            note:
              'Every command here feeds daily challenges and, once launched, the Weekly ' +
              'Rotation.',
            commands: [
              {
                name: '/work',
                args: null,
                desc: 'Work a shift for a quick, reliable payout.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/apply',
                args: '<job>',
                desc: 'Apply for a job — purely cosmetic, flavors your /work results.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/beg',
                args: null,
                desc: 'Pick a spot and hold out your hand.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/crime',
                args: null,
                desc: 'Pick a job and hope it isn\'t the one that goes wrong.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/dig',
                args: null,
                desc: 'Pick somewhere to dig through and see what\'s in it.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/search',
                args: null,
                desc: 'Pick somewhere to search and hope you picked right.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/fish',
                args: null,
                desc: 'Cast your line and see what you catch — requires a Fishing Rod.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/hunt',
                args: null,
                desc: 'Head into the woods and see what you bag — requires a Rifle.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/sell',
                args: '[item] [quantity]',
                desc:
                  'Sell fish or hunted animals from your inventory for coins — omit the item ' +
                  'for a menu.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/creaturedex',
                args: null,
                desc:
                  'Browse every huntable and fishable creature, including Tool Shed deployment ' +
                  'catches.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/flow start',
                args: null,
                desc:
                  'Open your grind panel — run the repeatable earners from buttons instead of ' +
                  'retyping commands.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
          {
            title: 'Gambling',
            note: null,
            commands: [
              {
                name: '/blackjack',
                args: '<amount>',
                desc: 'Play a game of blackjack.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/coinflip',
                args: '<side> <amount>',
                desc: 'Bet on heads or tails.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/slots',
                args: '<amount>',
                desc: 'Spin the slot machine.',
                access: 'everyone',
                kind: 'both',
              },
            ],
          },
          {
            title: 'Heist & Protection',
            note: null,
            commands: [
              {
                name: '/rob',
                args: '<user>',
                desc: 'Attempt to steal coins from another user\'s wallet — riskier than /crime.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/bankrob',
                args: '<user>',
                desc:
                  'Attempt to rob a user\'s bank. Works solo, but others can join to improve the ' +
                  'odds.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/passive',
                args: null,
                desc:
                  'Toggle Passive Mode — protects you from /rob and /bankrob, but stops you ' +
                  'robbing and lowers your earnings.',
                access: 'everyone',
                kind: 'both',
              },
            ],
          },
          {
            title: 'Shop & Items',
            note: null,
            commands: [
              {
                name: '/shop',
                args: '[category]',
                desc: 'Browse items available to buy.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/buy',
                args: '<item> [quantity] [max]',
                desc: 'Buy an item from the shop.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/dailyshop',
                args: null,
                desc: 'View today\'s rotating shop selection.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/buydaily',
                args: '<item> [quantity]',
                desc: 'Buy an item from today\'s rotating shop.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/inventory',
                args: null,
                desc: 'See your tools, consumables, giftables, collectibles and upgrades.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/use',
                args: '<item> [quantity]',
                desc: 'Use a consumable from your inventory.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/toolbench',
                args: null,
                desc:
                  'Purchase, enhance and upgrade your Fishing Rod and Rifle, and run Tool Shed ' +
                  'deployments.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
          {
            title: 'Pets',
            note:
              'Placed pets keep producing coins while their owner is offline, and get ' +
              'fatigued until they are fed.',
            commands: [
              {
                name: '/petmenu',
                args: null,
                desc: 'Open the pet menu — buy pets and manage your display.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/pets view',
                args: '[user]',
                desc: 'List every pet you own, placed and in storage.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/pets sell',
                args: '<pet>',
                desc: 'Sell an owned pet for coins.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/pets feed',
                args: '<pet>',
                desc: 'Feed a Pet Treat to a fatigued pet to restore it.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/display view',
                args: '[user]',
                desc: 'View your display slots and stored coin production.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/display place',
                args: '<pet> <slot>',
                desc: 'Place an owned pet into a display slot.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/display remove',
                args: '<slot>',
                desc: 'Remove the pet in a display slot back into storage.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/display collect',
                args: null,
                desc: 'Collect your pet display\'s accrued coin production.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/petshop',
                args: null,
                desc: 'View the currently rotating pet shop selection.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/buypet',
                args: '<slot>',
                desc: 'Buy a pet from the current pet shop rotation.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/petdex',
                args: null,
                desc:
                  'View every pet tier, its spawn rate, price range, earn rate and fatigue ' +
                  'window.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
          {
            title: 'Gifting',
            note:
              'Gifting is off until an admin enables it and sets a gift channel. Roses are ' +
              'the exception — they are paid from your earned rose balance and post ' +
              'nowhere.',
            commands: [
              {
                name: '/gift',
                args: '<user> <gift>',
                desc:
                  'Send a gift from the catalog to another user. Gifts build Bond Points ' +
                  'between the two of you.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/gifts',
                args: null,
                desc: 'Browse the full gift catalog, from cheapest to most expensive.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/rings',
                args: null,
                desc:
                  'Preview the ring catalog. Admin-only, and temporary — a preview until the ' +
                  'real Ring Shop ships.',
                access: 'admin',
                kind: 'slash',
              },
            ],
          },
          {
            title: 'Help',
            note: null,
            commands: [
              {
                name: '/econhelp',
                args: null,
                desc: 'Show every economy command, grouped by category.',
                access: 'everyone',
                kind: 'both',
              },
            ],
          },
        ],
      },
      {
        id: 'alliances',
        name: 'Alliances',
        emoji: '🤝',
        description:
          'Up to six members pool their weekly points into one alliance with a shared ' +
          'treasury, a rank ladder, and a Tech Center of upgrades bought with coins — a ' +
          'charter and motto, a private channel, treasury redistribution. Founding one ' +
          'costs 50,000,000 coins by default, deliberately steep: it is a six-person ' +
          'clubhouse, not something to start on a whim. The cost is tunable per server, ' +
          'and the whole system can be switched off from the dashboard. Upgrades are ' +
          'cosmetic or redistributive on purpose — nothing you can buy multiplies your ' +
          'Weekly Rotation points.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/alliance',
                args: null,
                desc:
                  'View your alliance, or start one. Everything else — invites, ranks, ' +
                  'treasury, upgrades — runs from buttons on that screen.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'challenges',
        name: 'Challenges & Weekly Rotation',
        emoji: '🔄',
        description:
          'Two layers of recurring goals. Daily challenges refresh every day and pay ' +
          'coins, a completion bonus, and giveaway entries. On top of them sits the ' +
          'Weekly Rotation: each day of the week scores a different theme — Monday ' +
          'Hustle + Pets, Tuesday Social + Gifts, Wednesday Expansion, Thursday Casino, ' +
          'Friday Voice, Saturday the Heist — with Sunday as Results Day, when the ' +
          'standings post and the top three take the winner role. A server starts its ' +
          'own clock with /setup challenges-launch; standalone challenges are live ' +
          'immediately and the rotation unlocks seven days later.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/challenges',
                args: null,
                desc:
                  'View today\'s daily challenges and your progress, and preview the Weekly ' +
                  'Rotation, your points and your rank.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'packs',
        name: 'Packs & Premium',
        emoji: '💎',
        description:
          'An in-Discord storefront listing planned premium subscriptions and one-time ' +
          'item packs across gold, rings, pets, gifts and RPG upgrades, with a link out ' +
          'to the website. It is informational only — nothing here processes a payment ' +
          'or grants an item, and no feature is gated behind payment today.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/pack shop',
                args: null,
                desc: 'Browse the subscription tiers and item packs.',
                access: 'admin',
                kind: 'slash',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'adventure',
    name: 'Adventure',
    blurb:
      'A turn-based RPG with its own gold and gear, and a real poker table running ' +
      'as a Discord Activity.',
    modules: [
      {
        id: 'rpg',
        name: 'Ashwood (RPG)',
        emoji: '⚔️',
        description:
          'A turn-based RPG living inside your server, with its own gold separate from ' +
          'the economy\'s coins. Make a character, fight through areas you unlock one at ' +
          'a time, take quests, forge and enchant gear, and climb the Ashwood board on ' +
          'the leaderboard hub. Combat, stats and the Ashwood inventory all run from ' +
          'buttons on the fight and profile screens rather than separate commands.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/start',
                args: null,
                desc: 'Create your RPG character.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/resume',
                args: null,
                desc:
                  'Resend your last fight, gold find, or nothing result if you lost track of ' +
                  'it.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/quests',
                args: null,
                desc: 'View your available quests.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/progress',
                args: null,
                desc: 'Move on to the next area, if you meet the requirements.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/travel',
                args: '<destination>',
                desc: 'Freely travel between areas you have already discovered.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/equip',
                args: '<item>',
                desc: 'Equip a weapon or armor piece.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/unequip',
                args: '<slot>',
                desc: 'Unequip whatever is in a gear slot.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/rpguse',
                args: '<item> [quantity]',
                desc: 'Use an item.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/rpgsell',
                args: '<item> [amount]',
                desc: 'Sell an item from your inventory for gold.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/achievements',
                args: null,
                desc: 'View your Ashwood achievements.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
          {
            title: 'Admin',
            note: null,
            commands: [
              {
                name: '/reset',
                args: '[user]',
                desc:
                  'Permanently delete your character so you can /start over. Passing another ' +
                  'user requires Administrator.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'poker',
        name: 'Poker',
        emoji: '🃏',
        description:
          'Texas Hold\'em played as a Discord Activity — a real table rendered in ' +
          'Discord\'s own Activity panel, running as its own service and sharing your ' +
          'server\'s economy balance for buy-ins. Note that Discord registers the launch ' +
          'button globally rather than per server, so unlike every other module this ' +
          'one cannot be switched off for a single server from the dashboard.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/launch',
                args: null,
                desc:
                  'Open the Texas Hold\'em poker table. Registered by Discord\'s Activities ' +
                  'system rather than by the bot.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'community',
    name: 'Community',
    blurb:
      'Giveaways weighted by real activity, a counting game, a starboard, a ' +
      'collaborative story, reaction GIFs, stats and one leaderboard hub for all of ' +
      'it.',
    modules: [
      {
        id: 'giveaway',
        name: 'Giveaway',
        emoji: '🎁',
        description:
          'Giveaways weighted by how active people actually are, rather than who ' +
          'clicked first. Entries can be earned from messages sent, hours in voice, and ' +
          'daily challenge completions, each at a rate you choose, with channels ' +
          'excludable from the message count. The entry channel stays clean ' +
          'automatically — anything that is not an entry is removed. Beyond ' +
          'Administrator, a host role can be given permission to run giveaways.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '!giveaway',
                args: null,
                desc:
                  'Typed in the giveaway channel to enter. Not a slash command — the message ' +
                  'and its confirmation are both cleaned up after a few seconds.',
                access: 'everyone',
                kind: 'prefix',
              },
              {
                name: '/giveaway start',
                args: '<channel> <winners> <prize> [duration] [end_date] [track_messages] [messages_per_entry] [track_voice] [hours_per_entry] [track_dailies]',
                desc: 'Start a new giveaway and choose which activity earns entries.',
                access: 'admin',
                kind: 'slash',
              },
              {
                name: '/giveaway status',
                args: null,
                desc: 'View the active giveaway and your own entries.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/giveaway end',
                args: null,
                desc: 'Force-end the active giveaway right now.',
                access: 'admin',
                kind: 'slash',
              },
              {
                name: '/giveaway reroll',
                args: '<user>',
                desc: 'Reroll a specific winner (e.g. they didn\'t respond).',
                access: 'admin',
                kind: 'slash',
              },
              {
                name: '/giveaway config',
                args: '<action> [channel]',
                desc: 'Manage the giveaway message-count exclusion list.',
                access: 'admin',
                kind: 'slash',
              },
              {
                name: '/giveaway entries',
                args: '[user]',
                desc: 'See ticket totals and breakdowns for the active giveaway.',
                access: 'admin',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'counting',
        name: 'Counting',
        emoji: '🔢',
        description:
          'One number per message in a dedicated channel, counting up as a server. ' +
          'Breaking the streak resets it — unless someone has bought a save, which ' +
          'absorbs the mistake. Counting correctly also scores on Monday of the Weekly ' +
          'Rotation.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/count',
                args: null,
                desc: 'Check the server\'s current count.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/buysave',
                args: null,
                desc: 'Buy a counting save with coins.',
                access: 'everyone',
                kind: 'both',
              },
              {
                name: '/saves',
                args: '[user]',
                desc: 'Check your (or another user\'s) counting saves balance.',
                access: 'everyone',
                kind: 'both',
              },
            ],
          },
        ],
      },
      {
        id: 'starboard',
        name: 'Starboard',
        emoji: '⭐',
        description:
          'Reposts highly-starred messages into a channel of their own. The star ' +
          'threshold is set per server from the dashboard. No commands — it reacts to ' +
          'reactions.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
            ],
          },
        ],
      },
      {
        id: 'interactions',
        name: 'Interactions',
        emoji: '🎉',
        description:
          'Reaction commands with GIFs and a running per-person count. These are not ' +
          'registered globally — they only appear in a server after an admin turns them ' +
          'on from the dashboard, and 18+ ones stay off unless separately enabled, ' +
          'flagged so Discord only shows them in age-restricted channels.',
        groups: [
          {
            title: 'Aimed at someone',
            note: null,
            commands: [
              {
                name: '/greet',
                args: '<user>',
                desc: 'Greet someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/highfive',
                args: '<user>',
                desc: 'High Five someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/dap',
                args: '<user>',
                desc: 'Dap someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/handshake',
                args: '<user>',
                desc: 'Handshake someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/poke',
                args: '<user>',
                desc: 'Poke someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/handhold',
                args: '<user>',
                desc: 'Hand Hold someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/laughwith',
                args: '<user>',
                desc: 'Laugh With someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/laughat',
                args: '<user>',
                desc: 'Laugh At someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/nuzzle',
                args: '<user>',
                desc: 'Nuzzle someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/smile',
                args: '<user>',
                desc: 'Smile someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/hug',
                args: '<user>',
                desc: 'Hug someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/kiss',
                args: '<user>',
                desc: 'Kiss someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/slap',
                args: '<user>',
                desc: 'Slap someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/punch',
                args: '<user>',
                desc: 'Punch someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/kick',
                args: '<user>',
                desc: 'Kick someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/bite',
                args: '<user>',
                desc: 'Bite someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/lick',
                args: '<user>',
                desc: 'Lick someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/cuddle',
                args: '<user>',
                desc: 'Cuddle someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/pat',
                args: '<user>',
                desc: 'Pat someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/tickle',
                args: '<user>',
                desc: 'Tickle someone!',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
          {
            title: 'Solo or aimed',
            note: 'These work alone or at someone — the user is optional.',
            commands: [
              {
                name: '/dance',
                args: '[user]',
                desc: 'Dance someone!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/pout',
                args: '[user]',
                desc: 'Pout someone!',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
          {
            title: 'Solo',
            note: null,
            commands: [
              {
                name: '/laugh',
                args: null,
                desc: 'Laugh!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/cry',
                args: null,
                desc: 'Cry!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/sing',
                args: null,
                desc: 'Sing!',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/sleep',
                args: null,
                desc: 'Sleep!',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'zgifs',
        name: 'Z Gifs',
        emoji: '📼',
        description:
          'A small set of A.L.I.C.E. reaction GIFs, kept as its own module so it can be ' +
          'switched off separately from the interaction commands.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/z gif',
                args: null,
                desc: 'Receive a random A.L.I.C.E. GIF.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'ows',
        name: 'One-Word Story',
        emoji: '📖',
        description:
          'A collaborative story built one word per message in its own channel. Words ' +
          'are checked against a dictionary, a PG filter and the slur list before they ' +
          'land, and finished sentences get a grammar rating. A role can be pinged ' +
          'every fifth sentence. Configured from the dashboard, including how many ' +
          'sentences make a story; no commands of its own.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
            ],
          },
        ],
      },
      {
        id: 'ambientchat',
        name: 'Ambient Chat',
        emoji: '💬',
        description:
          'An opt-in, for-fun AI chime-in on quiet channels. It reads a short window of ' +
          'recent messages for context and only speaks when a rate-limit slot is free ' +
          'right now — it shares that budget with moderation\'s Tier 2 check and takes ' +
          'lower priority, so a chime-in never delays a moderation call. Off by ' +
          'default.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
            ],
          },
        ],
      },
      {
        id: 'statbot',
        name: 'Stat Bot',
        emoji: '📈',
        description:
          'Message and voice activity tracking, rank cards, and the per-member profile ' +
          'the Gift Wall and Bond Leaderboard hang off. Requires Economy to be enabled ' +
          '— the cards blend live balance data in.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/stats',
                args: '[user]',
                desc:
                  'Show stats for a user, with the Gift Wall and Bond Leaderboard behind its ' +
                  'buttons.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/statleaderboard',
                args: '[count]',
                desc: 'Show the server\'s top members by messages and voice activity.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/ping',
                args: null,
                desc: 'Check if the bot is alive.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'achievements',
        name: 'Achievements',
        emoji: '🏆',
        description:
          'Milestones across every system, paying coins into the economy wallet as they ' +
          'unlock, plus an XP rank card. Requires Economy to be enabled.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/milestones',
                args: '[user]',
                desc: 'View your (or another user\'s) achievements.',
                access: 'everyone',
                kind: 'slash',
              },
              {
                name: '/rank',
                args: '[user]',
                desc: 'View your (or another user\'s) achievement XP rank card.',
                access: 'everyone',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'leaderboards',
        name: 'Leaderboards',
        emoji: '📊',
        description:
          'One command, six boards behind a dropdown: Assets, Server Bond, Gift Sending ' +
          'Points, Ashwood, the Weekly Rotation, and Alliance Standings. Replaces the ' +
          'separate per-system leaderboard commands that used to exist.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/leaderboard',
                args: null,
                desc: 'Open the leaderboard hub and switch between the six boards.',
                access: 'everyone',
                kind: 'both',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    blurb: 'The small things you would otherwise add a fourth bot for.',
    modules: [
      {
        id: 'emoji',
        name: 'Emoji Tools',
        emoji: '🎭',
        description: 'Pull a custom emoji out of another server and into this one.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/steal',
                args: '<emoji> [name]',
                desc: 'Steal a custom emoji into this server, optionally giving it a new name.',
                access: 'manageExpressions',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'chatexport',
        name: 'Chat Export',
        emoji: '🗂️',
        description:
          'Pulls a channel\'s full message history out as a JSON file. Gated to ' +
          'Administrator rather than just Moderate Members, since it can expose a lot ' +
          'of message content at once.',
        groups: [
          {
            title: null,
            note: null,
            commands: [
              {
                name: '/export-chat-history',
                args: '[channel]',
                desc:
                  'Export a channel\'s full message history as a JSON file (defaults to the ' +
                  'current channel).',
                access: 'admin',
                kind: 'slash',
              },
            ],
          },
        ],
      },
      {
        id: 'prefix',
        name: 'Text Prefix Bridge',
        emoji: '⌨️',
        description:
          'Every economy command above also answers to a ? prefix typed as a normal ' +
          'message — ?⁠bal, ?⁠dep 500, ?⁠bj 1000 — with short aliases for the ones ' +
          'people type most. It is the same handler either way, not a second ' +
          'implementation, so the two can never drift apart. Commands with a ? form are ' +
          'badged above. This module can be switched off if you would rather keep the ' +
          'server slash-only.',
        groups: [
          {
            title: null,
            note:
              'Full list: ?⁠balance (?⁠bal, ?⁠wallet) · ?⁠leaderboard (?⁠lb, ?⁠top) · ' +
              '?⁠deposit (?⁠dep) · ?⁠withdraw (?⁠wd, ?⁠with) · ?⁠transfer (?⁠pay, ?⁠give) · ' +
              '?⁠daily · ?⁠coinflip (?⁠cf, ?⁠flip) · ?⁠slots (?⁠slot) · ?⁠blackjack (?⁠bj) ' +
              '· ?⁠crime · ?⁠bankrob (?⁠heist) · ?⁠rob · ?⁠passive · ?⁠buysave (?⁠bs) · ' +
              '?⁠saves (?⁠save) · ?⁠count · ?⁠beg · ?⁠work · ?⁠apply · ?⁠shop · ?⁠buy · ' +
              '?⁠sell · ?⁠inventory (?⁠inv, ?⁠items) · ?⁠use · ?⁠fish · ?⁠hunt · ?⁠dig ' +
              '(?⁠dumpster) · ?⁠creaturedex (?⁠fishdex, ?⁠fishindex, ?⁠fdex, ?⁠huntdex, ' +
              '?⁠huntindex, ?⁠hdex) · ?⁠search · ?⁠econhelp (?⁠econ, ?⁠ecommands, ' +
              '?⁠ecohelp).',
            commands: [
            ],
          },
        ],
      },
    ],
  },
]

export const ALL_COMMANDS = CATEGORIES.flatMap((category) =>
  category.modules.flatMap((mod) =>
    mod.groups.flatMap((group) =>
      group.commands.map((command) => ({
        ...command,
        categoryId: category.id,
        categoryName: category.name,
        moduleId: mod.id,
        moduleName: mod.name,
        groupTitle: group.title,
      })),
    ),
  ),
)

export const COMMAND_COUNT = ALL_COMMANDS.length
