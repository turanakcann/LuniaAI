export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="border border-cyber-dim p-10 rounded-sm bg-cyber-gray shadow-[0_0_15px_rgba(0,255,65,0.1)]">
        <h1 className="text-5xl font-bold mb-4 tracking-tighter">
          LUNIA<span className="text-cyber-amber">.AI</span>
        </h1>
        <p className="text-cyber-green/70 mb-8 border-l-2 border-cyber-amber pl-4">
          SYSTEM_VERSION: 2.0.50 <br />
          STATUS: AWAKE <br />
          MEMORY: CONNECTED
        </p>
        <button className="bg-cyber-green text-cyber-black px-6 py-2 font-bold uppercase hover:bg-cyber-amber transition-colors duration-300">
          Init Sequence
        </button>
      </div>
    </main>
  );
}