import { useEffect, useMemo, useState } from 'react';

const formatOptions = [
  { id: 'social', label: 'Social Posts', emoji: '📱' },
  { id: 'email', label: 'Email Copy', emoji: '✉️' },
  { id: 'ads', label: 'Ad Copy', emoji: '🎯' },
  { id: 'launchCopy', label: 'Launch Copy', emoji: '🚀' },
  { id: 'headlines', label: 'Headlines', emoji: '💡' },
];

const toneOptions = ['Confident', 'Playful', 'Premium', 'Direct', 'Friendly'];

const defaultForm = {
  brand: 'Northstar Studio',
  audience: 'small business owners',
  offer: 'AI-powered marketing support',
  objective: 'more qualified leads',
  tone: 'Confident',
  angle: 'less busywork and faster growth',
};

const planCards = [
  { name: 'Starter', price: '$19', description: 'For solo creators and founders', perks: ['10 generations per month', 'Save to your library', 'Copy & export text'] },
  { name: 'Growth', price: '$49', description: 'For marketing teams running more campaigns', perks: ['Unlimited generations', 'Brand voice presets', 'Campaign planning tools'] },
  { name: 'Agency', price: '$99', description: 'For client work and multi-brand teams', perks: ['Team workspaces', 'Shared assets', 'Priority support'] },
];

const sectionOrder = ['social', 'email', 'ads', 'launchCopy', 'headlines'];

function App() {
  const [form, setForm] = useState(defaultForm);
  const [selectedTypes, setSelectedTypes] = useState(['social', 'email', 'ads']);
  const [results, setResults] = useState({});
  const [library, setLibrary] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('briefforge-library') || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('briefforge-library', JSON.stringify(library));
  }, [library]);

  const toggleType = (type) => {
    setSelectedTypes((current) => {
      if (current.includes(type)) {
        return current.filter((item) => item !== type);
      }
      return [...current, type];
    });
  };

  const saveToLibrary = (payload) => {
    setLibrary((current) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        title: payload.title || 'Saved idea',
        copy: payload.copy,
      },
      ...current,
    ]);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.log('Copy fallback not available');
    }
  };

  const generateContent = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: form.brand,
          audience: form.audience,
          offer: form.offer,
          objective: form.objective,
          tone: form.tone,
          angle: form.angle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong.');
      }

      setResults(data.results || {});
    } catch (err) {
      setError(err.message || 'Could not generate content right now.');
    } finally {
      setLoading(false);
    }
  };

  const visibleSections = useMemo(() => {
    return sectionOrder.filter((key) => selectedTypes.includes(key));
  }, [selectedTypes]);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">B</div>
          <div>
            <p className="eyebrow">AI growth studio</p>
            <h1>BriefForge AI</h1>
          </div>
        </div>

        <nav className="nav-stack">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Campaigns</button>
          <button className="nav-item">Brand Voice</button>
          <button className="nav-item">Library</button>
        </nav>

        <div className="side-card">
          <p className="side-title">Plan</p>
          <h3>Growth</h3>
          <p>Unlimited creative workflows</p>
          <button className="primary-button small">Upgrade</button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Campaign planner</p>
            <h2>Launch your next marketing push</h2>
          </div>
          <div className="topbar-meta">
            <span>{todayLabel}</span>
            <button className="ghost-button">Export</button>
          </div>
        </header>

        <section className="hero-grid">
          <div className="form-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Brief</p>
                <h3>Creative direction</h3>
              </div>
              <button className="ghost-button" onClick={() => setForm(defaultForm)}>
                Reset
              </button>
            </div>

            <div className="field-grid">
              <label>
                <span>Brand</span>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </label>
              <label>
                <span>Audience</span>
                <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
              </label>
              <label>
                <span>Offer</span>
                <input value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} />
              </label>
              <label>
                <span>Primary goal</span>
                <input value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
              </label>
              <label className="wide-field">
                <span>Positioning angle</span>
                <input value={form.angle} onChange={(e) => setForm({ ...form, angle: e.target.value })} />
              </label>
            </div>

            <div className="tone-row">
              <div className="tone-label">Tone</div>
              <div className="pill-group">
                {toneOptions.map((tone) => (
                  <button
                    key={tone}
                    className={form.tone === tone ? 'pill active' : 'pill'}
                    onClick={() => setForm({ ...form, tone })}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="content-toggle">
              <div className="tone-label">Generate</div>
              <div className="pill-group">
                {formatOptions.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    className={selectedTypes.includes(id) ? 'pill active' : 'pill'}
                    onClick={() => toggleType(id)}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            <button className="primary-button generate-button" onClick={generateContent} disabled={loading}>
              {loading ? 'Generating…' : 'Generate campaign copy'}
            </button>
            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="insight-card">
            <p className="eyebrow">Live brief</p>
            <h3>{form.brand}</h3>
            <ul>
              <li><strong>Audience:</strong> {form.audience}</li>
              <li><strong>Offer:</strong> {form.offer}</li>
              <li><strong>Goal:</strong> {form.objective}</li>
              <li><strong>Positioning:</strong> {form.angle}</li>
            </ul>

            <div className="mini-metrics">
              <div>
                <span>Campaign score</span>
                <strong>92/100</strong>
              </div>
              <div>
                <span>Brand fit</span>
                <strong>High</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="output-grid">
          {visibleSections.map((sectionKey) => (
            <div key={sectionKey} className="output-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Asset</p>
                  <h3>{formatOptions.find((item) => item.id === sectionKey)?.label || sectionKey}</h3>
                </div>
                <button
                  className="ghost-button"
                  onClick={() => {
                    const items = results[sectionKey] || [];
                    if (items[0]) {
                      copyText(items[0]);
                    }
                  }}
                >
                  Copy best
                </button>
              </div>

              <div className="copy-list">
                {(results[sectionKey] || []).map((item, index) => (
                  <article key={`${sectionKey}-${index}`} className="copy-item">
                    <p>{item}</p>
                    <div className="copy-actions">
                      <button onClick={() => copyText(item)}>Copy</button>
                      <button onClick={() => saveToLibrary({ title: `${formatOptions.find((opt) => opt.id === sectionKey)?.label || sectionKey} ${index + 1}`, copy: item })}>Save</button>
                    </div>
                  </article>
                ))}
                {!results[sectionKey]?.length && (
                  <div className="empty-state">
                    <span>Choose a brief and generate copy to see ideas here.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="library-section">
          <div className="card-header">
            <div>
              <p className="eyebrow">Saved</p>
              <h3>Creative library</h3>
            </div>
          </div>

          <div className="library-grid">
            {library.length ? (
              library.slice(0, 6).map((item) => (
                <article key={item.id} className="library-item">
                  <span>{item.title}</span>
                  <p>{item.copy}</p>
                  <button onClick={() => copyText(item.copy)}>Copy</button>
                </article>
              ))
            ) : (
              <div className="empty-state full-width">No saved copy yet. Start generating ideas to build your swipe file.</div>
            )}
          </div>
        </section>

        <section className="pricing-section">
          <div className="card-header">
            <div>
              <p className="eyebrow">Pricing</p>
              <h3>Simple plans</h3>
            </div>
          </div>

          <div className="pricing-grid">
            {planCards.map((plan) => (
              <div key={plan.name} className={plan.name === 'Growth' ? 'pricing-card featured' : 'pricing-card'}>
                <span className="plan-name">{plan.name}</span>
                <h4>{plan.price}<small>/mo</small></h4>
                <p>{plan.description}</p>
                <ul>
                  {plan.perks.map((perk) => <li key={perk}>{perk}</li>)}
                </ul>
                <button className="primary-button small">Choose plan</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
