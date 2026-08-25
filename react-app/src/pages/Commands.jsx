import { useReveal } from '../hooks/useReveal'
import { CommandModule, CommandList, CommandEntry, SubgroupTitle, ChipGrid, badgeStyles } from '../components/CommandsUI'
import '../styles/homepage.css'

const toc = [
  { href: '#statbot', label: '📈 Stat Bot' },
  { href: '#achievements', label: '🏆 Achievements' },
  { href: '#moderation', label: '🛡 Moderation' },
  { href: '#starboard', label: '⭐ Starboard' },
  { href: '#setup', label: '⚙️ Server Setup' },
  { href: '#giveaway', label: '🎁 Giveaway' },
  { href: '#counting', label: '🔢 Counting' },
  { href: '#economy', label: '💰 Economy' },
  { href: '#rpg', label: '⚔️ RPG Game' },
  { href: '#interactions', label: '🎉 Interactions' },
  { href: '#emoji', label: '🎭 Emoji Tools' },
  { href: '#chatexport', label: '🗂️ Chat Export' },
]

export default function Commands() {
  const [ref, visible] = useReveal({ threshold: 0.05 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-spotlight" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-reveal ${visible ? 'is-visible' : ''}`} style={{ maxWidth: 900 }}>
        <div className="home-page-eyebrow-row">
          <div className="home-eyebrow"><span className="home-dot" aria-hidden="true" /> Reference</div>
        </div>
        <h1>Commands</h1>
        <p className="home-lede">
          Everything A.L.I.C.E can do, grouped by module. Jump to a section below,
          or just scroll through — every command shown here is a Discord slash command
          unless noted otherwise.
        </p>

        <nav className="home-toc" aria-label="Command sections">
          {toc.map((item) => (
            <a href={item.href} key={item.href}>{item.label}</a>
          ))}
        </nav>

        <CommandModule
          id="statbot"
          title="📈 Stat Bot"
          description="Tracks messages and voice activity for every member and reports back rankings and activity over the last 1, 7, and 14 days."
        >
          <CommandList>
            <CommandEntry name="/ping">Check if the bot is alive and see its current latency.</CommandEntry>
            <CommandEntry name="/stats [user]">
              Show message and voice activity (1d / 7d / 14d) plus server-wide rank for yourself or another member.
            </CommandEntry>
            <CommandEntry name="/statleaderboard [count]">
              Show the server's top members by messages and voice activity (10 per category by default).
            </CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="achievements"
          title="🏆 Achievements"
          description={
            <>
              Tracks activity across the whole bot — messages, voice time, economy habits,
              counting streaks, gambling, and pets — and unlocks milestones as you go, each
              with a coin and XP reward. Separate from the RPG game's own quest achievements
              below (that's why this command is named <code>/milestones</code> and not{' '}
              <code>/achievements</code> — Discord doesn't allow two commands with the same name).
            </>
          }
        >
          <CommandList>
            <CommandEntry name="/milestones [user]">
              Browse your (or another member's) unlocked and still-locked achievements, by category.
            </CommandEntry>
            <CommandEntry name="/rank [user]">View your (or another member's) achievement XP rank card.</CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="moderation"
          title="🛡 Moderation"
          description={
            <>
              Automatic message filtering plus an anonymous warning system — three
              warnings within 24 hours automatically jails the member for 3 hours.
              Automod deletes the message and issues a warning on its own for
              blocked words, Discord invite links, emoji spam, excessive caps,
              repeated messages, and rapid short-message spam — no command needed.
              Channels can be exempted from the spam checks (slurs and invites
              still apply everywhere) via <code>/setup spam-exempt</code>.
            </>
          }
        >
          <CommandList>
            <CommandEntry name="/warn <user> <reason> [message_id]" badges={[badgeStyles.mods]}>
              Anonymously warn a user. Optionally reference a message in the current channel to delete it along with the warning.
            </CommandEntry>
            <CommandEntry name="Warn Message" badges={[badgeStyles.mods, badgeStyles.contextMenu]}>
              Context-menu action — warn a message's author directly, with the message auto-filled and deleted, same as /warn.
            </CommandEntry>
            <CommandEntry name="/warns [user]">Check how many warnings (out of 3) a user has and when they reset.</CommandEntry>
            <CommandEntry name="/clearwarns <user>" badges={[badgeStyles.mods]}>Clear all warnings for a user.</CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="starboard"
          title="⭐ Starboard"
          description={
            <>
              Messages that get enough ⭐ reactions are automatically reposted into
              a dedicated starboard channel, and the post keeps updating live as more
              stars come in. Configured entirely through <code>/setup starboard</code> — see Server Setup below.
            </>
          }
        />

        <CommandModule
          id="setup"
          title="⚙️ Server Setup"
          description="One command to configure everything else on this list — moderation channels, the jailed role, the starboard, the counting channel, automod exemptions, and the Interactions pack. Every subcommand requires Administrator permission."
        >
          <CommandList>
            <CommandEntry name="/setup channels [mod_warn] [hall_of_shame] [general] [logs]" badges={[badgeStyles.admin]}>
              Set the channels used for /warn, full warn details, light warn notices, and numbered mod-log cases (warn/jail/unjail/timeout).
            </CommandEntry>
            <CommandEntry name="/setup role <jailed>" badges={[badgeStyles.admin]}>
              Set the role applied automatically on a member's 3rd warning.
            </CommandEntry>
            <CommandEntry name="/setup starboard [channel] [threshold]" badges={[badgeStyles.admin]}>
              Set the starboard channel and/or how many ⭐ reactions are needed (default 3).
            </CommandEntry>
            <CommandEntry name="/setup counting <channel>" badges={[badgeStyles.admin]}>
              Set the channel the counting game runs in — required before /count, /buysave, or /saves do anything.
            </CommandEntry>
            <CommandEntry name="/setup spam-exempt <add|remove> <channel>" badges={[badgeStyles.admin]}>
              Exempt a channel from automod's spam checks (slur and invite detection still apply).
            </CommandEntry>
            <CommandEntry name="/setup interactions <mature_commands> <command_gifs>" badges={[badgeStyles.admin]}>
              Turn on the Interactions pack (see below) for this server, choosing whether to also allow 18+ commands and whether replies attach GIFs.
            </CommandEntry>
            <CommandEntry name="/setup view" badges={[badgeStyles.admin]}>View this server's current configuration.</CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="giveaway"
          title="🎁 Giveaway"
          description={
            <>
              Timed giveaways with weighted entries — messages sent, voice time, and
              daily-challenge completions can each earn tickets (all three on by default,
              independently toggleable per giveaway). Members enter by typing{' '}
              <code>!giveaway</code> in the giveaway channel while one is active — not a
              slash command. The channel becomes entry-only while a giveaway is running;
              non-mod messages posted there are automatically deleted.
            </>
          }
        >
          <CommandList>
            <CommandEntry
              name="/giveaway start <channel> <duration> <winners> <prize> [track_messages] [messages_per_entry] [track_voice] [hours_per_entry] [track_dailies]"
              badges={[badgeStyles.admin]}
            >
              Start a new giveaway — set how long it runs (e.g. <code>3d</code>, <code>12h30m</code>), how many winners, and the
              prize. Optionally toggle which activity earns entries and adjust how much of it earns one ticket.
            </CommandEntry>
            <CommandEntry name="/giveaway end" badges={[badgeStyles.admin]}>
              Force-end the active giveaway immediately and draw winners.
            </CommandEntry>
            <CommandEntry name="/giveaway reroll <user>" badges={[badgeStyles.admin]}>
              Reroll a specific winner from the giveaway that just ended — for example, if they didn't claim their prize in time.
            </CommandEntry>
            <CommandEntry name="/giveaway config <action> [channel]" badges={[badgeStyles.admin]}>
              Add, remove, or view the channels excluded from message-count tracking (e.g. bot-command channels).
            </CommandEntry>
            <CommandEntry name="/giveaway status">View the active giveaway's details and your own current entry count.</CommandEntry>
            <CommandEntry name="/giveaway entries [user]" badges={[badgeStyles.admin]}>
              See ticket totals and the message/voice/daily breakdown for every entrant, or for one specific member.
            </CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="counting"
          title="🔢 Counting"
          description={
            <>
              A community counting game in a designated channel (set via <code>/setup counting</code>) — count up one number at a
              time, one member at a time. Post the wrong number, or count twice in a row, and the count resets to 1 — unless a
              save covers the mistake.
            </>
          }
        >
          <CommandList>
            <CommandEntry name="/count">Check the server's current count, what's next, and the highest count ever reached.</CommandEntry>
            <CommandEntry name="/buysave">
              Buy a save for 1,000 coins — automatically forgives your next wrong-number or counted-twice mistake without resetting the count.
            </CommandEntry>
            <CommandEntry name="/saves [user]">Check your (or another member's) counting save balance.</CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="economy"
          title="💰 Economy"
          description={
            <>
              A wallet-and-bank currency system with daily rewards, a full grind
              loop, a shop, heists, and a few ways to gamble it all away.{' '}
              <strong>Tip:</strong> most commands below also work as a <code>?</code>-prefix
              shortcut (e.g. <code>?bal</code>, <code>?daily</code>, <code>?slots 50</code>) — run
              <code> /econhelp</code> in Discord for the full alias list. The Pets and Roses &amp; Challenges
              commands below, plus <code>/toolbench</code>, <code>/dailyshop</code>, and{' '}
              <code>/buydaily</code>, are slash-only.
            </>
          }
        >
          <SubgroupTitle>Currency &amp; Banking</SubgroupTitle>
          <CommandList>
            <CommandEntry name="/balance [user]">
              Check wallet and bank balance. Bank balances over 100 coins earn 1% interest daily (1.5% with the Vault Upgrade).
            </CommandEntry>
            <CommandEntry name="/leaderboard">See the richest members in the server (wallet + bank combined).</CommandEntry>
            <CommandEntry name="/deposit <amount|all>">Move coins from your wallet into your bank.</CommandEntry>
            <CommandEntry name="/withdraw <amount|all>">Move coins from your bank into your wallet.</CommandEntry>
            <CommandEntry name="/transfer <user> <amount>">Send coins from your wallet to another member.</CommandEntry>
          </CommandList>

          <SubgroupTitle>Grinding</SubgroupTitle>
          <CommandList>
            <CommandEntry name="/daily">
              Claim 500 coins, plus a streak bonus (+5% per consecutive day, capped at +100%). Resets every 24 hours, with a
              48-hour grace period to keep your streak alive.
            </CommandEntry>
            <CommandEntry name="/work">Work a shift for a quick, reliable payout.</CommandEntry>
            <CommandEntry name="/apply <job>">Apply for a job — purely cosmetic, flavors the results of your /work.</CommandEntry>
            <CommandEntry name="/beg">Beg for spare change — low risk, low reward.</CommandEntry>
            <CommandEntry name="/crime">
              Commit a crime for quick cash — riskier than /daily, but a bigger payout if it succeeds. Failing costs a fine.
            </CommandEntry>
            <CommandEntry name="/dig">Dig through the dumpster for whatever you can find.</CommandEntry>
            <CommandEntry name="/search">Search around for spare coins — safer than /beg, but a smaller reward.</CommandEntry>
            <CommandEntry name="/fish">Cast your line and see what you catch — requires a Fishing Rod from /shop.</CommandEntry>
            <CommandEntry name="/hunt">
              Head into the woods and see what you bag — requires a Rifle from /shop. Can come back empty-handed.
            </CommandEntry>
            <CommandEntry name="/sell [item] [quantity|all]">
              Sell fish or hunted animals from your inventory for coins — omit the item to open an interactive sell menu.
            </CommandEntry>
            <CommandEntry name="/fishdex">View every fish species, its rarity, catch odds, and sell price.</CommandEntry>
            <CommandEntry name="/huntdex">View every huntable animal, its rarity, catch odds, and sell price.</CommandEntry>
          </CommandList>

          <SubgroupTitle>Gambling</SubgroupTitle>
          <CommandList>
            <CommandEntry name="/coinflip <heads|tails> <amount|all>">Bet on a coin flip — double or nothing.</CommandEntry>
            <CommandEntry name="/slots <amount|all>">
              Spin a 3-reel slot machine. Two matching symbols pay a small multiplier, three of a kind hits the jackpot.
            </CommandEntry>
            <CommandEntry name="/blackjack <amount|all>">Play blackjack against the dealer using Hit / Stand / Double Down buttons.</CommandEntry>
          </CommandList>

          <SubgroupTitle>Heist &amp; Protection</SubgroupTitle>
          <CommandList>
            <CommandEntry name="/bankrob <user>">
              Attempt to rob a user's bank — works solo, but others can click "Join Heist" within 30 seconds to improve the odds.
              Failing costs everyone involved a fine.
            </CommandEntry>
            <CommandEntry name="/rob <user>">
              Attempt to steal coins straight from another member's wallet — instant and solo, riskier than /crime. Failing costs a fine.
            </CommandEntry>
            <CommandEntry name="/passive">
              Toggle Passive Mode — protects you from being robbed, but restricts your own robbing and lowers grind earnings while it's active.
            </CommandEntry>
          </CommandList>

          <SubgroupTitle>Shop &amp; Items</SubgroupTitle>
          <CommandList>
            <CommandEntry name="/shop [category]">Browse items available to buy — Tools, Consumables, or permanent Upgrades.</CommandEntry>
            <CommandEntry name="/buy <item> [quantity]">Buy an item from the shop (quantity is ignored for one-time upgrades).</CommandEntry>
            <CommandEntry name="/inventory">See your tools, consumables, collectables, and upgrades.</CommandEntry>
            <CommandEntry name="/use <item> [quantity]">
              Use one or more of a consumable (Coffee, Lucky Charm, Disguise, etc.) for a boost on your next matching command —
              specify a number or "all" (defaults to 1).
            </CommandEntry>
            <CommandEntry name="/dailyshop">View today's rotating shop selection — a second, separately-stocked shop from /shop that refreshes daily.</CommandEntry>
            <CommandEntry name="/buydaily <item> [quantity]">Buy an item from today's rotating shop.</CommandEntry>
            <CommandEntry name="/toolbench">Purchase, enhance, and upgrade your Fishing Rod and Rifle through an interactive button menu.</CommandEntry>
          </CommandList>

          <SubgroupTitle>Pets</SubgroupTitle>
          <CommandList>
            <CommandEntry name="/petshop">
              View the current pet shop rotation (refreshes every few minutes) — 5 slots, one of which can roll a rarer
              "wildcard" tier.
            </CommandEntry>
            <CommandEntry name="/buypet <slot>">Buy the pet sitting in a given /petshop slot (1-5).</CommandEntry>
            <CommandEntry name="/petdex">Browse every pet tier and species — spawn odds, price range, and coin-earn rate.</CommandEntry>
            <CommandEntry name="/pets view [user]">List every pet you (or another member) own, both on display and in storage.</CommandEntry>
            <CommandEntry name="/pets sell <pet>">Sell an owned pet for coins, by its number from /pets view.</CommandEntry>
            <CommandEntry name="/pets feed <pet>">Feed a Pet Treat to a fatigued pet to restore it — pets stop earning once fully fatigued.</CommandEntry>
            <CommandEntry name="/display view [user]">
              View your (or another member's) display slots and how much coin production is waiting to be collected.
            </CommandEntry>
            <CommandEntry name="/display place <pet> <slot>">Place an owned pet into a display slot so it starts earning coins passively.</CommandEntry>
            <CommandEntry name="/display remove <slot>">Remove the pet in a display slot and send it back to storage.</CommandEntry>
            <CommandEntry name="/display collect">Collect your pet display's accrued coin production.</CommandEntry>
            <CommandEntry name="/petmenu">A single button-and-menu hub for buying, viewing, placing, feeding, and selling pets — no typing required.</CommandEntry>
          </CommandList>

          <SubgroupTitle>Roses &amp; Challenges</SubgroupTitle>
          <CommandList>
            <CommandEntry name="/challenges">
              View today's daily challenges (send messages, count correctly, gamble, shop, and more) — complete enough of them
              and you earn a 🌹 rose.
            </CommandEntry>
            <CommandEntry name="/gift-rose <user> <amount>">
              Gift roses you've earned to another member. Gifted roses can't be re-gifted, so they can't be passed around indefinitely.
            </CommandEntry>
            <CommandEntry name="/econhelp">Show every economy command, grouped by category, along with its prefix-command aliases.</CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="rpg"
          title="⚔️ RPG Game"
          description="A text-based adventure — explore, fight monsters, complete quests, gear up (including a blacksmith's forge for crafting weapons and armor from mined ore), and chase achievements across multiple unlockable areas."
        >
          <CommandList>
            <CommandEntry name="/start">Create your character and begin the adventure.</CommandEntry>
            <CommandEntry name="/rpgstats">View your level, XP, gold, HP, attack, and equipped title.</CommandEntry>
            <CommandEntry name="/achievements">
              Browse your unlocked (and still-locked) RPG quest achievements — a separate system from the server-wide /milestones (see Achievements above).
            </CommandEntry>
            <CommandEntry name="/rpglb">Show this server's RPG leaderboard.</CommandEntry>
            <CommandEntry name="/rpginventory">Browse your inventory by category — weapons, armor, consumables, tools, materials, items, and titles.</CommandEntry>
            <CommandEntry name="/quests">View available quests and accept or claim them.</CommandEntry>
            <CommandEntry name="/rpguse <item> [quantity]">Use a consumable item from your inventory.</CommandEntry>
            <CommandEntry name="/rpgsell <item> [amount]">Sell an item from your inventory for gold.</CommandEntry>
            <CommandEntry name="/equip <item>">Equip a weapon or armor piece.</CommandEntry>
            <CommandEntry name="/unequip <slot>">Unequip whatever is currently in a gear slot.</CommandEntry>
            <CommandEntry name="/travel <destination>">Freely travel between areas you've already discovered (unlocked after defeating the Bear King).</CommandEntry>
            <CommandEntry name="/progress">Move on to the next area, once you meet its level and item requirements.</CommandEntry>
            <CommandEntry name="/resume">Resend your last fight, gold find, or exploration result if you lost track of it.</CommandEntry>
            <CommandEntry name="/reset">Permanently delete your character so you can /start over.</CommandEntry>
          </CommandList>

          <SubgroupTitle>Admin Commands</SubgroupTitle>
          <CommandList>
            <CommandEntry name="/give <user> <item> [amount]" badges={[badgeStyles.admin]}>Give an item directly to a player.</CommandEntry>
            <CommandEntry name="/givetitle <user> <title>" badges={[badgeStyles.admin]}>Give a title directly to a player.</CommandEntry>
            <CommandEntry name="/setlevel <user> <level>" badges={[badgeStyles.admin]}>Set a player's level directly.</CommandEntry>
            <CommandEntry name="/fightmonster <monster> [user]" badges={[badgeStyles.admin]}>
              Start a fight against a specific monster, for yourself or another member.
            </CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="interactions"
          title="🎉 Interactions"
          description={
            <>
              A pack of lighthearted social action commands — <code>/hug</code>, <code>/kiss</code>, <code>/dance</code>, and
              about 20 more. Each one posts a themed message about you (and, for the targeted ones, whoever you aim it at),
              optionally with an attached GIF. <strong>Off by default</strong> — none of these exist as slash commands in a
              server until an admin runs <code>/setup interactions</code> (see Server Setup above), which also chooses whether
              to allow 18+ commands and whether replies attach GIFs.
            </>
          }
        >
          <SubgroupTitle>Aimed at someone</SubgroupTitle>
          <p className="home-cmd-desc" style={{ marginBottom: '0.9rem' }}>Each takes a required <code>user</code> option — who it's aimed at.</p>
          <ChipGrid
            items={[
              '/greet', '/highfive', '/dap', '/handshake', '/poke', '/handhold', '/laughwith', '/laughat', '/nuzzle',
              '/smile', '/hug', '/kiss', '/slap', '/punch', '/kick', '/bite', '/lick', '/cuddle', '/pat', '/tickle',
            ]}
          />

          <SubgroupTitle>Solo</SubgroupTitle>
          <p className="home-cmd-desc" style={{ marginBottom: '0.9rem' }}>
            <code>/dance</code> and <code>/pout</code> take an optional <code>user</code>; the rest take none at all.
          </p>
          <ChipGrid items={['/dance [user]', '/pout [user]', '/laugh', '/cry', '/sing', '/sleep']} />
        </CommandModule>

        <CommandModule
          id="emoji"
          title="🎭 Emoji Tools"
          description="Quickly bring a custom emoji from another server into this one."
        >
          <CommandList>
            <CommandEntry name="/steal <emoji> [name]" badges={[badgeStyles.manageExpressions]}>
              Steal a custom emoji into this server, optionally giving it a new name.
            </CommandEntry>
          </CommandList>
        </CommandModule>

        <CommandModule
          id="chatexport"
          title="🗂️ Chat Export"
          description="Pulls a channel's full message history out as a JSON file. Gated to Administrator rather than just Moderate Members, since it can expose a lot of message content at once."
        >
          <CommandList>
            <CommandEntry name="/export-chat-history [channel]" badges={[badgeStyles.admin]}>
              Export a channel's full message history as a JSON file (defaults to the current channel).
            </CommandEntry>
          </CommandList>
        </CommandModule>
      </div>
    </main>
  )
}
