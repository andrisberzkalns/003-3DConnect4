export default function Footer() {
  return (
    <div className="absolute bottom-0 w-full bg-orange-900 bg-opacity-30 p-2 text-center text-neutral-200">
      © {new Date().getFullYear()} Copyright:&nbsp;
      <a
        className="font-bold text-neutral-200 hover:text-neutral-100"
        target="_blank"
        href="https://andris.berzkalns.com/"
      >
        Andris Bērzkalns
      </a>
    </div>
  );
}
