"use client";

export default function V2Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-index reveal">
        <span>Independent product designer</span>
        <span>5 years in practice</span>
      </div>
      <div className="hero-copy">
        <h1 className="reveal">
          I help teams turn complex products into{" "}
          <em>clear, useful experiences.</em>
        </h1>
        <div className="hero-support reveal">
          <p>
            Working across product strategy, interaction design, and design
            systems from early definition through launch.
          </p>
          <a href="#work">
            View selected work <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <div className="hero-capabilities reveal" aria-label="Core capabilities">
        <span>Product strategy</span>
        <span>UX and interaction</span>
        <span>Interface systems</span>
        <span>Design leadership</span>
      </div>
    </section>
  );
}
