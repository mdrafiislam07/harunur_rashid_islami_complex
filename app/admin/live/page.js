'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

const p2 = (n) => String(n).padStart(2, '0');
const toLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

function CopyField({ label, value, secret }) {
  const [show, setShow] = useState(!secret);
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch { /* ignore */ }
  };
  return (
    <label>
      {label}
      <span className="row" style={{ flexWrap: 'nowrap' }}>
        <input readOnly type={show ? 'text' : 'password'} value={value || ''} onFocus={(e) => e.target.select()} />
        {secret && <button type="button" className="btn sm" onClick={() => setShow((v) => !v)}>{show ? 'লুকান' : 'দেখান'}</button>}
        <button type="button" className="btn sm" onClick={copy}>{done ? 'কপি হয়েছে' : 'কপি'}</button>
      </span>
    </label>
  );
}

export default function AdminLive() {
  const [d, setD] = useState(null);
  const [f, setF] = useState({ title: '', description: '', scheduledAt: '' });
  const [msg, setMsg] = useState({ t: '', err: false });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const x = await api('/live/admin');
      setD(x);
      setF({ title: x.title, description: x.description, scheduledAt: toLocal(x.scheduledAt) });
    } catch (e) {
      setMsg({ t: e.message, err: true });
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(isLive) {
    setBusy(true);
    setMsg({ t: '', err: false });
    try {
      const r = await api('/live', {
        method: 'PUT',
        body: {
          isLive,
          title: f.title,
          description: f.description,
          scheduledAt: f.scheduledAt ? new Date(f.scheduledAt).toISOString() : null,
        },
      });
      setD((o) => ({ ...o, isLive }));
      setMsg({ t: r.message || 'সেভ হয়েছে', err: false });
    } catch (e) {
      setMsg({ t: e.message, err: true });
    }
    setBusy(false);
  }

  async function regen() {
    if (!confirm('নতুন Stream Key বানালে OBS-এ নতুন key বসাতে হবে। চালিয়ে যাবেন?')) return;
    try {
      const r = await api('/live/key', { method: 'POST' });
      setD((o) => ({ ...o, streamKey: r.streamKey, rtmpKey: `live?key=${r.streamKey}` }));
      setMsg({ t: 'নতুন Stream Key তৈরি হয়েছে', err: false });
    } catch (e) {
      setMsg({ t: e.message, err: true });
    }
  }

  if (!d) return <><h1>লাইভ স্ট্রিমিং</h1>{msg.t && <p className="err">{msg.t}</p>}</>;

  return (
    <>
      <div className="bar">
        <h1>লাইভ স্ট্রিমিং</h1>
        <b style={{ color: d.isLive ? '#b3261e' : '#5b6b67' }}>{d.isLive ? '● লাইভ চলছে' : 'বন্ধ আছে'}</b>
      </div>

      {!d.configured && (
        <p className="err">
          Backend .env এ STREAM_PUBLIC_URL ও STREAM_AUTH_SECRET সেট করা নেই। সেট না করলে ওয়েবসাইটে লাইভ দেখা যাবে না।
        </p>
      )}

      <form className="form" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); save(d.isLive); }}>
        <label>শিরোনাম
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="যেমন: জুমার বয়ান" />
        </label>
        <label>বিবরণ
          <textarea rows="3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </label>
        <label>পরবর্তী লাইভের সময় (ঐচ্ছিক)
          <input type="datetime-local" value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} />
        </label>
        {msg.t && <p className={msg.err ? 'err' : 'ok'}>{msg.t}</p>}
        <div className="row">
          {d.isLive
            ? <button type="button" className="btn" disabled={busy} onClick={() => save(false)}>লাইভ বন্ধ করুন</button>
            : <button type="button" className="btn gold" disabled={busy} onClick={() => save(true)}>লাইভ শুরু করুন</button>}
          <button className="btn sm" disabled={busy}>সেভ করুন</button>
        </div>
      </form>

      <h2 style={{ marginTop: 36 }}>OBS সেটআপ</h2>
      <div className="form" style={{ maxWidth: 640 }}>
        <p className="muted" style={{ margin: 0 }}>
          সেরা অপশন: <b>WHIP</b> (OBS ৩০ বা নতুন)। এতে ভিডিও-অডিও দুটোই ১ সেকেন্ডের কম দেরিতে পৌঁছায়।
        </p>
        <CopyField label="Service: WHIP — Server" value={d.whipUrl} />
        <CopyField label="Bearer Token (Stream Key)" value={d.streamKey} secret />

        <details>
          <summary>পুরনো OBS হলে RTMP ব্যবহার করুন (অডিও ওয়েবে HLS মোডে চলবে, দেরি ২–৪ সেকেন্ড)</summary>
          <div className="form" style={{ marginTop: 12 }}>
            <CopyField label="Service: Custom — Server" value={d.rtmpServer} />
            <CopyField label="Stream Key" value={d.rtmpKey} secret />
          </div>
        </details>

        <button type="button" className="btn sm" style={{ justifySelf: 'start' }} onClick={regen}>নতুন Stream Key বানান</button>

        <h3>OBS → Settings → Output → Advanced</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Encoder: x264 (বা NVENC), Rate Control: CBR, Bitrate: ২৫০০–৪০০০ Kbps</li>
          <li>Keyframe Interval: ১ s</li>
          <li>CPU Preset: veryfast বা ultrafast, Tune: zerolatency, Profile: main বা baseline</li>
          <li>Custom x264 options: <code>bframes=0</code></li>
          <li>Video: ১৯২০×১০৮০ বা ১২৮০×৭২০, ৩০ FPS</li>
        </ul>
      </div>
    </>
  );
}