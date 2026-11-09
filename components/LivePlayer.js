'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { API } from '@/lib/api';

export { API };

const ICE = [{ urls: 'stun:stun.l.google.com:19302' }];

function waitIce(pc, ms = 1500) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const check = () => pc.iceGatheringState === 'complete' && done();
    const t = setTimeout(done, ms);
    function done() {
      clearTimeout(t);
      pc.removeEventListener('icegatheringstatechange', check);
      resolve();
    }
    pc.addEventListener('icegatheringstatechange', check);
  });
}

const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;

export default function LivePlayer({ live }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const hideRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | connecting | waiting | playing | error
  const [mode, setMode] = useState('');          // webrtc | hls
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [full, setFull] = useState(false);
  const [ui, setUi] = useState(true);

  const whepUrl = live?.whepUrl || '';
  const hlsUrl = live?.hlsUrl || '';
  const isLive = !!live?.isLive && !!(whepUrl || hlsUrl);

  // ---------- connect: WebRTC first, HLS fallback ----------
  useEffect(() => {
    const video = videoRef.current;
    if (!isLive || !video) {
      setStatus('idle');
      return;
    }

    let stop = false;
    let pc = null;
    let hls = null;
    let retry = null;
    let lost = null;
    let fails = 0;

    const later = (fn, ms) => {
      clearTimeout(retry);
      retry = setTimeout(fn, ms);
    };

    const cleanup = () => {
      clearTimeout(retry);
      clearTimeout(lost);
      if (pc) {
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.close();
        pc = null;
      }
      if (hls) {
        hls.destroy();
        hls = null;
      }
      video.srcObject = null;
      video.removeAttribute('src');
    };

    const startHls = async () => {
      if (stop || !hlsUrl) return;
      cleanup();
      setMode('hls');
      setStatus('connecting');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl; // Safari / iOS
        video.play().catch(() => {});
        return;
      }
      const { default: Hls } = await import('hls.js');
      if (stop) return;
      if (!Hls.isSupported()) {
        setStatus('error');
        return;
      }
      hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 4,
        maxLiveSyncPlaybackRate: 1.15,
        backBufferLength: 10,
      });
      hls.on(Hls.Events.ERROR, (_e, d) => {
        if (!d.fatal || !hls) return;
        if (d.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setStatus('waiting');
          later(startHls, 3000);
        }
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      video.play().catch(() => {});
    };

    const onLost = () => {
      if (stop) return;
      fails += 1;
      setStatus('waiting');
      if (fails >= 3 && hlsUrl) startHls();
      else later(startRtc, 2000);
    };

    async function startRtc() {
      if (stop) return;
      if (!whepUrl || typeof RTCPeerConnection === 'undefined') {
        startHls();
        return;
      }
      cleanup();
      setMode('webrtc');
      setStatus('connecting');
      try {
        const conn = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' });
        pc = conn;
        conn.addTransceiver('video', { direction: 'recvonly' });
        conn.addTransceiver('audio', { direction: 'recvonly' });

        conn.ontrack = (e) => {
          try {
            if ('jitterBufferTarget' in e.receiver) e.receiver.jitterBufferTarget = 50;
          } catch { /* ignore */ }
          if (video.srcObject !== e.streams[0]) video.srcObject = e.streams[0];
          video.play().catch(() => {});
        };
        conn.onconnectionstatechange = () => {
          const st = conn.connectionState;
          if (st === 'connected') {
            clearTimeout(lost);
            fails = 0;
          } else if (st === 'disconnected') {
            clearTimeout(lost);
            lost = setTimeout(onLost, 4000);
          } else if (st === 'failed') {
            onLost();
          }
        };

        await conn.setLocalDescription(await conn.createOffer());
        await waitIce(conn);
        const res = await fetch(whepUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: conn.localDescription.sdp,
        });
        if (stop) return;
        if (res.status === 404) {
          // OBS theke ekhono stream ashe nai
          cleanup();
          setStatus('waiting');
          later(startRtc, 3000);
          return;
        }
        if (!res.ok) throw new Error('WHEP ' + res.status);
        await conn.setRemoteDescription({ type: 'answer', sdp: await res.text() });
      } catch (err) {
        if (stop) return;
        fails += 1;
        if (fails >= 2 && hlsUrl) startHls();
        else {
          setStatus('waiting');
          later(startRtc, 3000);
        }
      }
    }

    startRtc();

    return () => {
      stop = true;
      cleanup();
    };
  }, [isLive, whepUrl, hlsUrl]);

  // ---------- video state ----------
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.volume = volume;
  }, [muted, volume]);

  // ---------- fullscreen ----------
  const toggleFull = useCallback(() => {
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el) return;
    if (fsElement()) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      return;
    }
    if (el.requestFullscreen) {
      el.requestFullscreen()
        .then(() => screen.orientation?.lock?.('landscape').catch(() => {}))
        .catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (v?.webkitEnterFullscreen) {
      v.webkitEnterFullscreen(); // iPhone
    }
  }, []);

  useEffect(() => {
    const on = () => setFull(!!fsElement());
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      document.removeEventListener('webkitfullscreenchange', on);
    };
  }, []);

  useEffect(() => {
    const key = (e) => {
      if (!isLive || /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'f' || e.key === 'F') toggleFull();
      if (e.key === 'm' || e.key === 'M') setMuted((m) => !m);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [isLive, toggleFull]);

  // ---------- controls auto-hide ----------
  const poke = useCallback(() => {
    setUi(true);
    clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => setUi(false), 3000);
  }, []);
  useEffect(() => () => clearTimeout(hideRef.current), []);

  const showUi = ui || status !== 'playing';
  const when = live?.scheduledAt ? new Date(live.scheduledAt) : null;

  return (
    <div
      ref={wrapRef}
      className={'lp' + (full ? ' is-full' : '') + (showUi ? '' : ' idle')}
      onMouseMove={poke}
      onTouchStart={poke}
      onDoubleClick={isLive ? toggleFull : undefined}
    >
      <style>{css}</style>

      <video
        ref={videoRef}
        className="lp-video"
        autoPlay
        muted
        playsInline
        onPlaying={() => setStatus('playing')}
        onWaiting={() => status === 'playing' && setStatus('connecting')}
        style={{ visibility: isLive ? 'visible' : 'hidden' }}
      />

      {!isLive && (
        <div className="lp-msg">
          <strong>এখন কোনো লাইভ চলছে না</strong>
          <span>
            {when
              ? 'পরবর্তী লাইভ: ' + when.toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })
              : 'লাইভ শুরু হলে এখানেই দেখা যাবে।'}
          </span>
        </div>
      )}

      {isLive && status !== 'playing' && (
        <div className="lp-msg">
          <div className="lp-spin" aria-hidden="true" />
          <strong>{status === 'error' ? 'ভিডিও চালানো যাচ্ছে না' : status === 'waiting' ? 'সম্প্রচারের অপেক্ষায়…' : 'সংযোগ হচ্ছে…'}</strong>
        </div>
      )}

      {isLive && status === 'playing' && muted && (
        <button type="button" className="lp-unmute" onClick={() => setMuted(false)}>
          🔊 শব্দ চালু করুন
        </button>
      )}

      {isLive && (
        <div className="lp-bar">
          <span className="lp-live"><i />লাইভ</span>
          <span className="lp-mode">{mode === 'webrtc' ? 'দ্রুত সংযোগ' : mode === 'hls' ? 'স্ট্যান্ডার্ড' : ''}</span>
          <span className="lp-gap" />
          <button type="button" aria-label={muted ? 'শব্দ চালু' : 'শব্দ বন্ধ'} onClick={() => setMuted((m) => !m)}>
            {muted || volume === 0 ? '🔇' : '🔊'}
          </button>
          <input
            type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
            aria-label="ভলিউম"
            onChange={(e) => { const v = +e.target.value; setVolume(v); setMuted(v === 0); }}
          />
          <button type="button" aria-label={full ? 'ফুলস্ক্রিন বন্ধ' : 'ফুলস্ক্রিন'} onClick={toggleFull}>
            {full ? '⤡' : '⛶'}
          </button>
        </div>
      )}
    </div>
  );
}

const css = `
.lp{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:14px;overflow:hidden;color:#fff;font-family:inherit}
.lp.is-full{aspect-ratio:auto;height:100%;border-radius:0}
.lp.idle{cursor:none}
.lp-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}
.lp-msg{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:8px;text-align:center;padding:24px;background:#0b1f1d}
.lp-msg strong{font-size:1.15rem}
.lp-msg span{opacity:.75}
.lp-spin{width:34px;height:34px;border-radius:50%;border:3px solid rgba(255,255,255,.2);border-top-color:#e3a62f;animation:lpspin .9s linear infinite}
@keyframes lpspin{to{transform:rotate(360deg)}}
.lp-unmute{position:absolute;top:14px;right:14px;background:rgba(0,0,0,.65);color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:99px;padding:8px 16px;font:inherit;cursor:pointer}
.lp-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:28px 14px 12px;background:linear-gradient(transparent,rgba(0,0,0,.75));transition:opacity .25s}
.lp.idle .lp-bar{opacity:0;pointer-events:none}
.lp-bar button{background:none;border:0;color:#fff;font-size:1.35rem;cursor:pointer;min-width:40px;height:40px;border-radius:8px}
.lp-bar button:hover{background:rgba(255,255,255,.18)}
.lp-bar input{width:90px;padding:0;border:0;box-shadow:none;background:transparent;accent-color:#e3a62f}
.lp-gap{flex:1}
.lp-live{display:inline-flex;align-items:center;gap:7px;font-weight:700}
.lp-live i{width:10px;height:10px;border-radius:50%;background:#ff4d4d}
.lp-mode{opacity:.7;font-size:.85rem}
@media(max-width:600px){.lp{border-radius:0}.lp-bar input{display:none}}
@media(prefers-reduced-motion:reduce){.lp-spin{animation-duration:3s}}
`;