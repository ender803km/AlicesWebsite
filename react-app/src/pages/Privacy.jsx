import { useReveal } from '../hooks/useReveal'
import { SUPPORT_SERVER_URL } from '../lib/links'
import '../styles/system.css'

// Written against what the bot actually does, not from a template. If a
// behaviour described here changes in the bot, this page is wrong until
// someone updates it — the specific things to watch are autoMod/warns.js
// (stores message content), autoMod/llmMod/ (sends content to NVIDIA),
// memberCleanup/ and guildLifecycle/ (the two deletion windows).

const LAST_UPDATED = 'September 19, 2026'

export default function Privacy() {
  const [ref, visible] = useReveal({ threshold: 0.05 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-wrap-narrow home-legal home-reveal ${visible ? 'is-visible' : ''}`}>
        <span className="home-eyebrow">Legal</span>
        <h1>Privacy Policy</h1>
        <p className="home-legal-meta">Last updated {LAST_UPDATED}</p>

        <p className="home-lede">
          A.L.I.C.E is a Discord bot and dashboard run by one person as a hobby project. This
          page explains exactly what it stores, what leaves it, and how long any of it lasts.
          It covers both the bot and this website.
        </p>

        <h2>What Discord already tells us</h2>
        <p>
          When the bot can see a message or a voice channel, Discord hands it the same things it
          hands every bot: user IDs, server and channel IDs, roles, and message content in
          channels the bot can read. None of that is a choice we make — it is how Discord works.
          What matters is what we then keep, which is the rest of this page.
        </p>

        <h2>What the bot stores</h2>
        <ul className="home-list">
          <li>
            <strong>Identifiers.</strong> Discord user IDs, server IDs, channel IDs and role IDs.
            We never store usernames as a record of their own — the ID is what everything is
            keyed by.
          </li>
          <li>
            <strong>Activity for stats and leaderboards.</strong> Timestamps of messages you send
            in a server, and the start and end times of voice sessions. Timestamps only — the
            text of ordinary messages is never written down.
          </li>
          <li>
            <strong>Game and economy data.</strong> Balances, items, pets, fishing and hunting
            records, RPG progress, achievements, alliance membership, giveaway entries, counting
            saves and weekly rotation points.
          </li>
          <li>
            <strong>Moderation records.</strong> Warnings, jails and mod-log entries, including
            who issued them and why. <strong>Warnings also store the text of the message that
            triggered them</strong> — see the next section.
          </li>
          <li>
            <strong>Server settings.</strong> Everything an admin configures through{' '}
            <code className="home-code">/setup</code> or this dashboard: which modules are on,
            which channels and roles things post to, thresholds and cooldowns.
          </li>
        </ul>

        <h2>Message content, specifically</h2>
        <p>
          The bot does not keep a copy of what people say. There are three exceptions, and they
          are worth stating plainly rather than burying.
        </p>
        <ul className="home-list">
          <li>
            <strong>Warnings.</strong> When a message triggers a warning, the text of that
            message is saved with the warning record so moderators can see what was actioned.
            It stays until the warning is removed or the server&rsquo;s data is deleted.
          </li>
          <li>
            <strong>AI moderation, where a server has enabled it.</strong> This is off by default
            and each server opts in. When it is on, a message that first trips a local word and
            pattern filter is sent to NVIDIA&rsquo;s classification API, along with a few
            preceding messages from that channel for context — those lines include their
            authors&rsquo; display names and text. Messages that do not trip the local filter are
            never sent anywhere. Nothing sent this way is stored by us; what NVIDIA does with it
            is governed by their own terms.
          </li>
          <li>
            <strong>Channel exports.</strong> A server administrator can export a channel&rsquo;s
            history to a file. The file is produced on request and handed to the administrator who
            asked for it. We do not keep a copy.
          </li>
        </ul>
        <p>
          Separately, if the AI moderation flags a message as a possible self-harm or child-safety
          concern, an excerpt of it is posted into a private channel that the server&rsquo;s admins
          configure, so a human can look at it. That excerpt goes to that server&rsquo;s
          moderators, not to us.
        </p>

        <h2>The dashboard and your account</h2>
        <p>
          Logging in uses Discord&rsquo;s standard OAuth, asking for two things: your basic
          profile, and the list of servers you are in. We use the server list to work out which
          servers you can configure — the ones where you have Manage Server and A.L.I.C.E is
          installed.
        </p>
        <p>
          Your session is a signed token stored in your own browser. There is no session database
          on our side, so logging out or clearing your browser data ends it. The only thing the
          dashboard records is a log of configuration changes: which Discord ID changed which
          setting, when, and what the previous value was. That exists so a server owner can find
          out who turned something off.
        </p>

        <h2>Who else is involved</h2>
        <ul className="home-list">
          <li><strong>Discord</strong> — the platform everything runs on.</li>
          <li>
            <strong>NVIDIA</strong> — receives message text for classification, only for servers
            that have enabled AI moderation and only for messages that trip the local filter first.
          </li>
          <li>
            <strong>MongoDB Atlas</strong> — where the data above is stored, on servers in the
            United States.
          </li>
          <li><strong>Railway</strong> — runs the bot, the API and this website.</li>
          <li>
            <strong>nekos.best and otakugifs.xyz</strong> — where interaction GIFs come from. These
            requests carry no information about you; the bot just asks for a random image.
          </li>
        </ul>
        <p>
          We do not sell data, share it for advertising, or hand it to anyone not listed here.
        </p>

        <h2>How long it is kept</h2>
        <p>
          Most of it deletes itself, and has done since before this page existed:
        </p>
        <ul className="home-list">
          <li>
            <strong>You leave a server</strong> — your stats and economy data for that server are
            deleted after 7 days. The delay is so that leaving and rejoining does not wipe your
            progress.
          </li>
          <li>
            <strong>The bot is removed from a server</strong> — everything belonging to that
            server is deleted after 14 days, including settings, moderation records and everyone&rsquo;s
            game data for it.
          </li>
          <li>
            <strong>Everything else</strong> is kept while the bot is in the server and you are a
            member of it.
          </li>
        </ul>

        <h2>Asking to see or delete your data</h2>
        <p>
          Ask in the support server and we will tell you what is stored about you, or delete it,
          within 30 days. Deletion covers your stats, economy and game data. Moderation records
          are the one thing we may keep, because they belong to the server that issued them as
          much as to you — if you want those gone, the server&rsquo;s admins can remove them.
        </p>
        <p>
          You can also just leave a server, or ask its admins to remove the bot, and the automatic
          deletion above takes care of the rest.
        </p>

        <h2>Age</h2>
        <p>
          Discord requires users to be at least 13, and older in some countries. A.L.I.C.E is for
          people who meet Discord&rsquo;s minimum age. If we learn that someone below it has data
          stored, we delete it.
        </p>

        <h2>Security</h2>
        <p>
          Connections are encrypted, the database is not publicly readable, and the dashboard can
          only write the specific settings the bot says are configurable. That said — this is a
          hobby project run by one person, not an organisation with a security team. Treat it
          accordingly, and do not put anything in a Discord server that would be a problem if it
          got out.
        </p>

        <h2>Changes</h2>
        <p>
          If what the bot does with data changes, this page changes with it, and the date at the
          top moves. Substantial changes will be announced in the support server.
        </p>

        <h2>Contact</h2>
        <p>
          Questions, deletion requests and complaints all go to the{' '}
          <a href={SUPPORT_SERVER_URL} target="_blank" rel="noopener">support server</a>.
        </p>
      </div>
    </main>
  )
}
