export default function DiscordPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="heading text-3xl md:text-4xl text-center mb-6 text-white">Join our Discord</h1>
      <p className="text-center text-neutral-300 mb-8">
        Connect with the Salem County community, get help, and share your creations.
      </p>
      <div className="flex justify-center">
        <a
          href="https://discord.gg/salemcounty"
          target="_blank"
          className="btn-primary px-6 py-3 rounded-2xl font-bold bg-gradient-to-br from-rose-700 to-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
        >
          Join Salem County Discord →
        </a>
      </div>
    </div>
  );
}