import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Image src="/tukn-logo.png" alt="Tukn Logo" width={70} height={70} />
          <h1 className="text-4xl font-semibold">Tukn</h1>
        </div>
        <Link
          href="/launch"
          className="group inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-600 transition-all"
        >
          Launch Tukn
          <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </Link>


      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 min-h-screen bg-cover bg-center bg-no-repeat">
        <h2 className="text-3xl sm:text-5xl font-bold mb-4">
          Launch your token directly from your socials
        </h2>
        <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mb-8">
          Tukn lets anyone create and launch tokens or memecoins — directly from X(Twitter) powered by Solana Blinks ⚡
        </p>
        <Link
          href="/launch"
          className="group inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-600 transition-all"
        >
          Launch Tukn
          <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </Link>

      </main>


      {/* About Section */}
      <section className="px-8 py-12 bg-gray-50 text-center">
        <h3 className="text-2xl font-semibold mb-4">About Tukn</h3>
        <p className="max-w-2xl mx-auto text-gray-700 text-lg">
          Tukn is a launchpad that lets anyone create and launch tokens or memecoins directly from their socials (X) in just a few seconds. Built on Solana Blinks, it brings seamless on-chain token creation straight to your feed.
        </p>
        <br />
        <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-lg">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-contain"
          >
            <source src="/tukn-X-video.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-200">
        <a
          href="https://x.com/tuknfun"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-gray-600 hover:text-black transition-colors"
        >
          <span className="text-lg font-medium">Follow us on</span>
          <Image
            src="/x-logo.png"
            alt="X logo"
            width={28}
            height={28}
            className="mt-2 opacity-80 hover:opacity-100 transition-opacity"
          />
        </a>


      </footer>
    </div>
  );
}
