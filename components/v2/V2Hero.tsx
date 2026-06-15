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
          <span className="hero-line">
            <span className="hero-line-inner">
              I design how products <em>think, move,</em> and work.
            </span>
          </span>
        </h1>
        <div className="hero-support reveal">
          <p>
            I do not stop at Figma. I take products through strategy,
            interaction design, interface systems, and functional builds.
          </p>
          <a href="#work">
            View selected work
            <span className="arrow-icon arrow-down" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="hero-capabilities reveal" aria-label="Core capabilities">
        <span>Product strategy</span>
        <span>UX and interaction</span>
        <span>Interface systems</span>
        <span>Functional builds</span>
      </div>
    </section>
  );
}
