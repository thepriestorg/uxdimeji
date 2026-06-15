"use client";

export default function V2Footer() {
  return (
    <footer className="site-footer">
      <span>
        © <span data-year>{new Date().getFullYear()}</span> Dimeji A.
      </span>
      <div>
        <a
          href="https://www.linkedin.com/in/uiuxoladimeji/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Read.cv
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Dribbble
        </a>
      </div>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
