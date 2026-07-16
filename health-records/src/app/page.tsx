const cases = [
  { title: "Cardiology follow-up", patient: "John Doe", status: "Active", updated: "Today, 09:42" },
  { title: "Diabetes care plan", patient: "Maya Singh", status: "Review", updated: "Yesterday" },
  { title: "Orthopedic rehabilitation", patient: "Alex Morgan", status: "Active", updated: "Jul 14" },
];

const activity = [
  "Dr. Sharma reviewed a cardiology case",
  "Maya Singh granted consent for lab results",
  "A medication record was added to John Doe's case",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-teal-700">CAREVAULT</p>
            <h1 className="text-xl font-bold">Clinical records, with patient control.</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">Demo workspace</span>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Dr. Sharma</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          <nav className="space-y-1 text-sm font-medium">
            {['Overview', 'Cases', 'Appointments', 'Consents', 'Audit log'].map((item, index) => (
              <a className={`block rounded-lg px-3 py-2 ${index === 0 ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`} href="#" key={item}>
                {item}
              </a>
            ))}
          </nav>
          <div className="mt-8 rounded-xl bg-slate-900 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Privacy by design</p>
            <p className="mt-2 leading-5">Every access to a clinical record is captured in an audit log.</p>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-teal-700">Wednesday, July 16</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">Good morning, Dr. Sharma</h2>
              <p className="mt-2 text-slate-600">A secure, consent-aware view of your patients&apos; active care.</p>
            </div>
            <button className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">New clinical note</button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Active cases" value="24" detail="3 need review" />
            <Metric label="Today&apos;s appointments" value="8" detail="Next at 10:30" />
            <Metric label="Pending consents" value="2" detail="Awaiting patient action" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Priority cases</h3>
                <button className="text-sm font-semibold text-teal-700">View all</button>
              </div>
              <div className="mt-5 divide-y divide-slate-100">
                {cases.map((item) => (
                  <article className="flex items-center justify-between gap-4 py-4 first:pt-0" key={item.title}>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{item.patient} · Updated {item.updated}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-bold">Recent audit activity</h3>
              <ol className="mt-5 space-y-5 border-l border-slate-200 pl-5">
                {activity.map((item) => <li className="relative text-sm leading-5 text-slate-600" key={item}><span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-teal-600" />{item}<p className="mt-1 text-xs text-slate-400">Recorded securely</p></li>)}
              </ol>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-2 text-sm text-teal-700">{detail}</p></article>;
}
