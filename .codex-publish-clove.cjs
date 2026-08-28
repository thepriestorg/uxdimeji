const fs = require("fs");

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      let value = line.slice(index + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      return [line.slice(0, index).trim(), value];
    }),
);

const image = (name) =>
  `https://res.cloudinary.com/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/portfolio/clove/${name}.png`;

const text = (value) => ({ type: "text", text: value });
const paragraph = (value) => ({ type: "paragraph", content: [text(value)] });
const heading = (value) => ({
  type: "heading",
  attrs: { level: 2 },
  content: [text(value)],
});
const figure = (name, alt, caption) => ({
  type: "figure",
  attrs: { src: image(name), alt, caption },
});

const content = {
  type: "doc",
  content: [
    heading("Clove"),
    paragraph(
      "Clove is an AI-assisted hiring workspace that brings jobs, candidates, interviews, communication and team decisions into one operating system. Instead of adding AI as a separate destination, the product uses it as a layer across the hiring workflow—surfacing what needs attention and helping teams act on it.",
    ),
    heading("The problem it’s solving"),
    paragraph(
      "Hiring teams rarely lack information. The harder problem is that the information is scattered across candidate records, interview notes, scorecards, inboxes and spreadsheets. By the time a recruiter finds the full picture, a decision may already be late or a strong candidate may have gone quiet.",
    ),
    paragraph(
      "The design challenge was to make a dense recruiting system feel calm without stripping away the context people need to make responsible decisions. Each screen prioritizes the next useful action while keeping the evidence behind it close by.",
    ),
    heading("Overview: a decision-first home"),
    paragraph(
      "The overview is built around the questions a hiring lead asks at the start of the day: what is blocked, which candidates need attention and where is the pipeline slowing down? The daily brief turns those signals into three clear decisions before the page expands into metrics, interviews and role health.",
    ),
    paragraph(
      "This is why the page does not begin with a generic analytics dashboard. Clove leads with urgency and action, then provides the numbers needed to understand the wider system.",
    ),
    heading("Clove AI: intelligence inside the workspace"),
    paragraph(
      "Clove AI opens as a side panel, allowing recruiters to ask questions without losing the page or role they were working in. The live workspace pulse gives the assistant immediate context—decisions due, time at risk and pressure by hiring stage—before the user types anything.",
    ),
    figure(
      "ai-workspace-pulse",
      "Clove AI workspace pulse and suggested hiring questions",
      "Clove AI starts with live hiring signals and useful prompts instead of an empty chat state.",
    ),
    paragraph(
      "A comparison request produces a short recommendation grounded in scorecards, portfolio evidence and interview availability. The response names the trade-off between candidates and keeps supporting records one action away, so the assistant helps with judgment without pretending to replace it.",
    ),
    figure(
      "ai-candidate-comparison",
      "Clove AI comparing Product Designer candidates",
      "Candidate comparison combines a recommendation, supporting evidence and a clear next action.",
    ),
    paragraph(
      "Notifications follow the same principle. They group overdue feedback, candidate replies, pipeline risks and completed automations by urgency, with the relevant action attached to each item.",
    ),
    figure(
      "notifications",
      "Clove notification center with hiring alerts",
      "Notifications are designed as an action queue rather than a passive activity feed.",
    ),
    heading("Jobs: one view of pipeline health"),
    paragraph(
      "The Jobs workspace keeps role selection, pipeline stages and candidate review on the same canvas. A hiring lead can move from a high-level health score to the strongest candidates without navigating through separate reports.",
    ),
    paragraph(
      "The right-side role brief is intentionally opinionated: it highlights the next decision and the signals behind it. This gives AI a useful supporting role while the central table remains the source of truth for the team.",
    ),
    figure(
      "jobs-pipeline",
      "Clove jobs workspace showing a Product Designer pipeline",
      "Role health, pipeline distribution and candidate evidence stay visible in one working view.",
    ),
    heading("Candidates: evidence before activity"),
    paragraph(
      "The candidate record is designed around progression and evidence. Stage history, contact details, scorecard coverage and recent activity are visible together, reducing the need to reconstruct a candidate’s story from several tabs.",
    ),
    paragraph(
      "The next-step card calls out the weakest evidence area rather than simply repeating the candidate’s overall match score. That makes the recommendation more useful: it tells the team what the next interview should clarify.",
    ),
    figure(
      "candidate-record",
      "Clove candidate profile with stage progress and role evidence",
      "The candidate record connects progress, verified evidence and the next hiring decision.",
    ),
    heading("Scorecards: making alignment visible"),
    paragraph(
      "Scorecards are treated as a decision system, not a document archive. Completion, overall rating, panel range and decision status sit in one row, making missing feedback and disagreement visible before the hiring meeting.",
    ),
    paragraph(
      "Color is used sparingly for meaning—ready, discuss, missing and overdue—so the table can stay dense without becoming noisy.",
    ),
    figure(
      "scorecards",
      "Clove active scorecards and panel alignment dashboard",
      "Completion and panel alignment make decision readiness scannable across every active candidate.",
    ),
    heading("Inbox: communication without losing hiring context"),
    paragraph(
      "The Inbox uses a board to separate conversations that need a reply, are in progress or have been resolved. That structure turns candidate communication into a manageable workflow instead of a chronological pile of messages.",
    ),
    figure(
      "inbox-board",
      "Clove inbox board organized by conversation status",
      "The board view makes ownership and response state visible at a glance.",
    ),
    paragraph(
      "Opening a conversation preserves the board in the background and brings the thread into a side panel. Candidate context and an AI-generated useful-context note sit beside the conversation, helping the recruiter respond without switching back to the candidate record.",
    ),
    figure(
      "inbox-conversation",
      "Clove candidate conversation with useful hiring context",
      "Conversation detail adds candidate context without removing the recruiter from the inbox workflow.",
    ),
    heading("Talent pools: relationships beyond open roles"),
    paragraph(
      "Talent pools organize promising people by discipline and relationship signal, including past finalists and employee referrals. Warm counts and overlapping avatars make each pool feel active and reusable rather than like a static folder.",
    ),
    figure(
      "talent-pools",
      "Clove talent pool library",
      "Reusable pools help teams return to known candidates before starting every search from zero.",
    ),
    heading("Referrals: a visible hiring channel"),
    paragraph(
      "The referrals experience connects programme performance with the people behind it. The summary shows introductions, strong matches and hires, while the active pipeline makes waiting referrals and review states immediately visible.",
    ),
    paragraph(
      "Top advocates and shareable role kits reinforce the behaviour the product wants to grow: trusted introductions that can be followed through, measured and acknowledged.",
    ),
    figure(
      "referrals",
      "Clove employee referral programme dashboard",
      "Referral performance, active introductions and advocates are presented as one connected channel.",
    ),
    heading("Analytics: performance with an explanation"),
    paragraph(
      "The analytics page moves from headline hiring health to conversion, source quality, stage velocity and team capacity. Each chart is paired with a takeaway or comparison, reducing the burden on the user to interpret every number from scratch.",
    ),
    paragraph(
      "The layout deliberately separates volume from quality. A source can bring fewer candidates and still be the strongest signal, which is why referral quality is given its own panel beside the conversion funnel.",
    ),
    figure(
      "analytics",
      "Clove hiring analytics dashboard",
      "Conversion, quality, velocity and capacity reveal where the hiring system is healthy or slowing down.",
    ),
    heading("Automations: control before scale"),
    paragraph(
      "The automation builder makes triggers, conditions and actions visible as a readable flow. The selected step opens in a configuration panel with a live message preview and delivery rules, allowing teams to automate follow-up without giving up review or candidate safeguards.",
    ),
    figure(
      "automations",
      "Clove hiring automation builder",
      "Visual workflow logic and delivery controls keep automation understandable and reviewable.",
    ),
    heading("Integrations: extending the system"),
    paragraph(
      "Integrations are grouped by the jobs they support—communication, calendars, sourcing and HRIS—rather than presented as an undifferentiated logo wall. Installed and available states are immediately clear, and the connected-system summary explains why these tools matter to the hiring workflow.",
    ),
    figure(
      "integrations",
      "Clove integrations settings",
      "The integration library frames connected tools as parts of one synchronized hiring system.",
    ),
    heading("What this demonstrates"),
    paragraph(
      "Clove is a study in designing for operational density without making the product feel heavy. The repeated patterns—left navigation, focused workspaces, contextual side panels and evidence-led AI—create consistency across very different jobs, from reviewing a candidate to diagnosing a slow pipeline.",
    ),
    paragraph(
      "The most important design decision was keeping recommendations close to their evidence. AI can suggest what deserves attention, but the team can still see why, open the supporting record and make the final call.",
    ),
  ],
};

const project = {
  title: "Clove",
  slug: "clove",
  category: "AI SaaS",
  year: "2026",
  featured_image: image("overview"),
  color: "bg-blue-950",
  content: JSON.stringify(content),
  is_featured: true,
  order: -1,
};

const baseUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/projects`;
const headers = {
  apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function publish() {
  const existingResponse = await fetch(`${baseUrl}?select=id,slug&slug=eq.clove`, { headers });
  const existing = await existingResponse.json();
  const method = Array.isArray(existing) && existing.length ? "PATCH" : "POST";
  const url = method === "PATCH" ? `${baseUrl}?slug=eq.clove` : baseUrl;
  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(project),
  });
  const body = await response.text();
  console.log(JSON.stringify({ status: response.status, method, body }, null, 2));
  if (!response.ok) process.exit(1);
}

publish().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
