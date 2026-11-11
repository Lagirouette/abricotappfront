import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Lien d'évitement (WCAG 2.4.1) : visible seulement quand il reçoit le focus clavier */}
      <a
        href="#contenu"
        className="bg-dark sr-only z-50 rounded-[10px] px-4 py-3 text-sm text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-10 md:px-10 md:py-[78px] xl:px-[100px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
