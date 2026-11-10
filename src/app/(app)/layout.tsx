import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-10 md:px-10 md:py-[78px] xl:px-[100px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
