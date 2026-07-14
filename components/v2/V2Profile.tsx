"use client";

const journey = [
  {
    number: "01",
    eyebrow: "Practice",
    title: "5 years",
    date: "2021 — Present",
    text: "Designing products across complex, real-world domains.",
  },
  {
    number: "02",
    eyebrow: "Foundation",
    title: "First class",
    date: "2019 — 2024",
    text: "BSc Computer Science",
  },
  {
    number: "03",
    eyebrow: "In motion",
    title: "Master's",
    date: "2026 — 2027 (expected)",
    text: "Computer Science · Currently studying",
    current: true,
  },
];

export default function V2Profile() {
  return (
    <section className="profile" id="about">
      <header className="profile-header reveal">
        <p className="eyebrow">Profile / Approach</p>
      </header>

      <div className="profile-grid">
        <div className="profile-lead">
          <p className="profile-statement">
            Five years in, I still begin the same way: get close enough to the
            problem that the right product starts to feel inevitable.
          </p>
          <p className="profile-signature">Oladimeji Abubakar — Product designer</p>
        </div>
        <div className="profile-detail">
          <p>
            I work from first principles to shipped detail—bringing research,
            product thinking, interaction, visual craft, and prototyping into
            one continuous process.
          </p>
          <p>
            A first-class degree in Computer Science sharpened how I reason
            through systems. My current master&apos;s studies keep that curiosity
            active, while practice keeps it grounded in people and outcomes.
          </p>
            <p>
              The result is work that holds together—from the logic underneath
              to the final moment in someone&apos;s hands.
            </p>
        </div>
      </div>

      <div className="profile-journey" aria-label="Experience and education">
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 62 C 240 8, 388 90, 600 50 S 950 18, 1200 60" />
        </svg>
        {journey.map((item) => (
          <article
            className={`journey-point${item.current ? " is-current" : ""}`}
            key={item.number}
          >
            <span>{item.number} / {item.eyebrow}</span>
            <strong>{item.title}</strong>
            <time>{item.date}</time>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <div className="practice-section">
        <div className="practice-heading reveal">
          <p className="eyebrow">How I work</p>
          <p>A continuous path from understanding to execution.</p>
        </div>
        <div className="practice-list reveal">
        <div>
          <span>01</span>
          <h3>Listen deeply</h3>
          <p>Find the human truth, the business tension, and the decision that matters most.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Think in systems</h3>
          <p>Shape evidence into flows and models that stay coherent as the product grows.</p>
        </div>
        <div>
          <span>03</span>
          <h3>Make it tangible</h3>
          <p>Prototype early, refine with intent, and stay close through build and release.</p>
        </div>
        </div>
      </div>
    </section>
  );
}
