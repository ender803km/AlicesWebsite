import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import { SUPPORT_SERVER_URL } from '../lib/links'
import '../styles/system.css'

// Deliberately says nothing about payment. The premium tiers are designed but
// nothing is purchasable, and terms describing a product that does not exist
// are worse than no terms at all. Add that section when billing actually ships.

const LAST_UPDATED = 'September 19, 2026'

export default function Terms() {
  const [ref, visible] = useReveal({ threshold: 0.05 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-wrap-narrow home-legal home-reveal ${visible ? 'is-visible' : ''}`}>
        <span className="home-eyebrow">Legal</span>
        <h1>Terms of Service</h1>
        <p className="home-legal-meta">Last updated {LAST_UPDATED}</p>

        <p className="home-lede">
          These terms cover using the A.L.I.C.E Discord bot and this dashboard. Adding the bot to
          a server, using its commands, or signing in here means you accept them. A.L.I.C.E is a
          free hobby project and is not affiliated with or endorsed by Discord.
        </p>

        <h2>Who can use it</h2>
        <p>
          You need to meet Discord&rsquo;s minimum age — 13, or higher where local law says so —
          and you have to follow{' '}
          <a href="https://discord.com/terms" target="_blank" rel="noopener">Discord&rsquo;s Terms of Service</a>{' '}
          and{' '}
          <a href="https://discord.com/guidelines" target="_blank" rel="noopener">Community Guidelines</a>.
          Anything that breaks those breaks these too.
        </p>

        <h2>Using it reasonably</h2>
        <p>Don&rsquo;t:</p>
        <ul className="home-list">
          <li>Exploit bugs, duplicate currency, or automate commands to farm rewards. If you find a way to do this, tell us in the support server rather than using it.</li>
          <li>Use the bot to harass, threaten or target anyone, or to distribute content that breaks Discord&rsquo;s rules.</li>
          <li>Try to overload, break into, reverse-engineer or interfere with the bot, the API or this site.</li>
          <li>Use the moderation tools to build records about people outside the ordinary running of a Discord server.</li>
        </ul>

        <h2>The economy is not real</h2>
        <p>
          Coins, items, pets, cards, alliances and everything else the bot tracks exist only inside
          it. They have no real-world value, cannot be exchanged for money or anything else, and
          are not your property. Selling or trading them outside Discord is not allowed.
        </p>
        <p>
          Balances and progress can be reset, corrected or lost — through a bug, a rollback, a
          server removing the bot, or the automatic deletion described in the{' '}
          <Link to="/privacy">Privacy Policy</Link>. The games that involve wagering coins are games,
          not gambling, and no money is ever involved.
        </p>

        <h2>Moderation features are tools, not a guarantee</h2>
        <p>
          Filters, warnings and the AI moderation check are there to help a server&rsquo;s own
          moderators. They will sometimes miss things and sometimes flag things they
          shouldn&rsquo;t — the AI check in particular is a classifier making judgement calls
          about tone and intent, and it can be wrong in both directions.
        </p>
        <p>
          How these are configured and what is done with what they surface is the responsibility of
          each server&rsquo;s administrators. Do not rely on A.L.I.C.E as the only thing keeping a
          community safe, and do not treat its output as a finding of fact about a person.
        </p>

        <h2>Server admins</h2>
        <p>
          If you add the bot to a server or configure it, you are confirming you have permission to
          do so. You decide which features run there and where things get logged, which means you
          decide what gets collected about your members — the{' '}
          <Link to="/privacy">Privacy Policy</Link> sets out what that is. Telling your members what
          the bot is doing is your job, not ours.
        </p>

        <h2>Availability</h2>
        <p>
          The bot is free and provided as-is. There is no uptime commitment. Features can change,
          be disabled, or be removed without notice, and the whole thing could stop running.
          Downtime, lost data and broken features are all possible, and none of them come with
          compensation.
        </p>

        <h2>Suspension</h2>
        <p>
          We can stop serving any user or any server that abuses the bot, exploits it, or uses it
          to harm people — without notice, and without owing an explanation, though you are
          welcome to ask in the support server.
        </p>

        <h2>No warranty, and what we are responsible for</h2>
        <p>
          A.L.I.C.E comes with no warranty of any kind. To the extent the law allows, we are not
          liable for anything arising from using it — lost data, lost progress, moderation
          decisions taken on the basis of what it reports, or anything that happens in a server
          because of how it was configured.
        </p>
        <p>
          Nothing here tries to exclude liability that cannot legally be excluded.
        </p>

        <h2>Changes</h2>
        <p>
          These terms can change. The date at the top moves when they do, and anything significant
          gets announced in the support server. Continuing to use the bot after a change means you
          accept it.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of the Province of Ontario and the federal laws of
          Canada that apply there, without regard to conflict-of-laws rules.
        </p>

        <h2>Contact</h2>
        <p>
          Everything goes to the{' '}
          <a href={SUPPORT_SERVER_URL} target="_blank" rel="noopener">support server</a>.
        </p>
      </div>
    </main>
  )
}
