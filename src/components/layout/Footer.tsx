import Logo from "../Logo";

export default function Footer() {
  return (
    <footer className="bg-surface mt-auto">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-[30px]">
        <Logo className="text-logo-dark w-[101px]" />
        <p className="text-sm">Abricot 2025</p>
      </div>
    </footer>
  );
}
