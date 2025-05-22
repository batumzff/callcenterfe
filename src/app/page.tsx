export default function Home() {
  return (
    <div className="space-y-8 bg-background rounded-xl py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">Call Center Yönetim Sistemi</h1>
        <p className="text-text max-w-2xl mx-auto text-lg">
          Modern ve kullanıcı dostu arayüz ile çağrı merkezi operasyonlarınızı yönetin.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-primary">Çağrı Yönetimi</h2>
          <p className="text-text">Gelen ve giden çağrıları etkin bir şekilde yönetin.</p>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-primary">Raporlama</h2>
          <p className="text-text">Detaylı analizler ve raporlarla performansınızı takip edin.</p>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-primary">Ekip Yönetimi</h2>
          <p className="text-text">Çağrı merkezi ekibinizi verimli bir şekilde yönetin.</p>
        </div>
      </section>
    </div>
  );
}
