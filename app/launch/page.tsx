import Link from "next/link";
import Image from "next/image";

export default function LaunchPage() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-white text-black">
            <header className="w-full max-w-3xl flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Image src="/tukn-logo.png" alt="Tukn" width={48} height={48} />
                    <h1 className="text-2xl font-bold">Tukn</h1>
                </div>
                <Link href="/" className="text-sm text-gray-600 underline">
                    Back
                </Link>

            </header>

            <div role="alert" className="w-full max-w-3xl bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
                <p className="font-semibold text-red-800">Make the Blink visible on X</p>
                <p className="text-sm text-red-700 mt-1">To make sure the Blink is visible on X, follow these two things 👇</p>
                <ol className="list-decimal list-inside mt-2 text-sm text-red-700 space-y-1">
                    <li>Use a desktop browser (Blinks will not appear on mobile).</li>
                    <li>Enable the experimental Blink feature setting in your Solana wallet.</li>
                </ol>
                <p className="text-sm text-red-700 mt-2">Once you do these, the Blink should unfurl.</p>
            </div>

            <main className="w-full max-w-3xl flex flex-col items-center gap-6">
                <p className="text-center text-lg text-gray-700 max-w-xl">
                    Choose where you want to launch your token. <br /> You can launch directly from X (Twitter) or via Dialect.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <a
                        href="https://x.com/tuknfun/status/1984352846545125474"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold"
                    >
                        Use Tukn on X (Twitter)

                    </a>

                    <a
                        href="https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Ftukn.vercel.app%2Fapi%2Factions%2Ftoken%2Fcreate&cluster=devnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-full font-semibold"
                    >
                        Launch Tukn on Dialect
                    </a>
                </div>
            </main>
        </div>
    );
}
