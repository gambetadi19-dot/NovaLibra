import Footer from './Footer';
import Navbar from './Navbar';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-brand-950">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-20 h-[26rem] w-[26rem] rounded-full bg-fuchsia-600/10 blur-[140px]" />
        <div className="absolute right-[-10rem] top-0 h-[30rem] w-[30rem] rounded-full bg-violet-600/12 blur-[150px]" />
        <div className="absolute bottom-[-10rem] left-[18%] h-[24rem] w-[24rem] rounded-full bg-cyan-400/8 blur-[130px]" />
      </div>
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
