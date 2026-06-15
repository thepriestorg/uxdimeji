"use client";

export default function V2Profile() {
  return (
    <section className="profile" id="about">
      <header className="section-intro reveal">
        <p className="eyebrow">Profile / Approach</p>
        <div>
          <h2>Close to the problem. Clear about the outcome.</h2>
        </div>
      </header>
      <div className="profile-grid">
        <p className="profile-statement">
          I am Dimeji, a product designer with five years of experience helping
          teams make difficult products easier to understand and use.
        </p>
        <div className="profile-detail">
          <p>
            My work spans early product definition, research, interaction
            design, visual systems, and launch. I am at my best when the problem
            is consequential, the constraints are real, and design needs to
            create alignment as well as a better interface.
          </p>
          <p>
            I have worked with product, engineering, operations, research, and
            leadership teams across fintech, healthcare, and travel.
          </p>
          <p>
            My work does not end at Figma. I prototype and build functional,
            testable products, closing the gap between design intent and what
            people can actually use.
          </p>
        </div>
      </div>
      <div className="practice-list reveal">
        <div>
          <span>01</span>
          <h3>Frame</h3>
          <p>
            Clarify the problem, the user need, and the product decision that
            matters.
          </p>
        </div>
        <div>
          <span>02</span>
          <h3>Shape</h3>
          <p>
            Turn evidence into flows, prototypes, and a coherent product
            direction.
          </p>
        </div>
        <div>
          <span>03</span>
          <h3>Ship</h3>
          <p>
            Prototype, build, and work closely with engineering to protect the
            details through release.
          </p>
        </div>
      </div>
    </section>
  );
}
