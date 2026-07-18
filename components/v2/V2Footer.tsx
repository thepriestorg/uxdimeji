"use client";

export default function V2Footer() {
  return (
    <footer className="site-footer">
      <span>
        &copy; <span data-year>{new Date().getFullYear()}</span> Oladimeji Abubakar
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
      <a href="#top">
        Back to top <span className="arrow-icon arrow-up" aria-hidden="true" />
      </a>
    </footer>
  );
}
