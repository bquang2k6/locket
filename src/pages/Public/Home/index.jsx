import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import './home.css';

export default function Home() {

  useEffect(() => {
    const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const $ = s => document.querySelector(s), wait = ms => new Promise(r => setTimeout(r, ms));
    const PH = ['p1', 'p2', 'p3'], NAMES = ['Lan', 'Minh', 'Hà'];

    /* home screen builder */
    function buildHome(el, { widget = true, minis = 0 } = {}) {
      if (!el) return;
      el.innerHTML = (widget ? `<div class="wgt">${PH.map((p, i) => `<div class="ph ${p}${i ? '' : ' on'}"></div>`).join('')}<div class="who"><i></i><span>${NAMES[0]}</span></div></div>` : '')
        + '<div class="ic"></div>'.repeat(widget ? 4 : 0)
        + (widget ? '<div class="wl">Locket Wan</div>' : '')
        + Array.from({ length: minis }, (_, i) => `<div class="mini ${PH[i % 3]}"></div>`).join('')
        + '<div class="ic"></div>'.repeat(8);
    }
    function cycle(el, i) {
      if (!el) return;
      const p = el.querySelectorAll('.ph');
      if (!p.length) return;
      p.forEach((x, k) => x.classList.toggle('on', k === i % 3));
      const n = el.querySelector('.who span');
      if (n) n.textContent = NAMES[i % 3];
    }
    function burst(scr, set) {
      if (!scr) return;
      const e = [['😍', '💛'], ['🔥', '💯'], ['🌊', '☀️', '🩵']][set % 3];
      for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'fl';
        s.textContent = e[i % e.length];
        s.style.left = (10 + Math.random() * 75) + '%';
        s.style.fontSize = (22 + Math.random() * 8) + 'px';
        s.style.animationDelay = (i * .1) + 's';
        scr.appendChild(s);
        setTimeout(() => s.remove(), 2800);
      }
    }

    /* ===== HERO ===== */
    const G = [
      'linear-gradient(135deg,#ff8a5c,#ff5e8a)',
      'linear-gradient(135deg,#4fd1c5,#3b82f6)',
      'linear-gradient(135deg,#a78bfa,#f472b6)',
      'linear-gradient(135deg,#fde68a,#fb923c)',
      'linear-gradient(135deg,#86efac,#22d3ee)',
      'linear-gradient(135deg,#93c5fd,#c4b5fd)',
      'linear-gradient(135deg,#fca5a5,#fcd34d)',
      'linear-gradient(135deg,#6ee7b7,#3b82f6)'
    ];
    const FB = [
      { l: 21, t: 29, s: 13.5, de: .18, du: .75, dr: 6, dd: 7, img: '/assets/index/bubbles/michid.webp', br: 18 },
      { l: 88, t: 26, s: 14.5, de: .04, du: .95, dr: 9, dd: 10, img: '/assets/index/bubbles/widget-1.webp', br: 18 },
      { l: 9, t: 72, s: 17, de: .12, du: .7, dr: 8, dd: 6.5, img: '/assets/index/captions/good-morning.webp', br: 20 },
      { l: 7, t: 45, s: 16, de: .26, du: .7, dr: 6, dd: 7.5, img: '/assets/index/stickers/bff.webp', c: 'bff show-mob' },
      { l: 10.5, t: 22, s: 11.7, de: .1, du: .8, dr: 6, dd: 8, img: '/assets/index/stickers/hearts-duo.webp', r: -6 },
      { l: 17, t: 55, s: 14.3, de: 0, du: .9, dr: 7, dd: 9, img: '/assets/index/stickers/heart-flat.webp', r: -5 },
      { l: 26, t: 54, s: 9.1, de: .22, du: .7, dr: 5, dd: 6.5, img: '/assets/index/stickers/heart-3d.webp' },
      { l: 20.5, t: 75, s: 10.4, de: .16, du: .75, dr: 6, dd: 7, img: '/assets/index/stickers/megaphone.webp', r: 4 },
      { l: 71.5, t: 19, s: 10.4, de: .08, du: .8, dr: 6, dd: 7.5, tag: ['I ♥ Locket Wan', '#fff', '#1a1200'], r: 7 },
      { l: 69.5, t: 35, s: 10.4, de: .2, du: .75, dr: 5, dd: 8, tag: ['+ Thêm bạn', '#FFB000', '#1a1200'], r: -6, desk: 1 },
      { l: 80, t: 46, s: 11.7, de: .14, du: .85, dr: 7, dd: 9, img: '/assets/index/stickers/locket-tile.webp', r: 14 },
      { l: 92.5, t: 52, s: 10.4, de: .06, du: .8, dr: 6, dd: 7, img: '/assets/index/stickers/heart-flat.webp' },
      { l: 85, t: 78, s: 14, de: .28, du: .75, dr: 7, dd: 8, img: '/assets/index/stickers/locket-red.webp', r: -7, c: 'heart show-mob' },
      { l: 75.5, t: 60, s: 10.4, de: .06, du: .8, dr: 6, dd: 7, img: '/assets/index/stickers/i-heart-locket.webp' },
    ];

    const fl = $('#fl');
    if (fl) {
      fl.innerHTML = FB.map((b, i) => {
        const w = b.s + 'vmin', r = `transform:rotate(${b.r || 0}deg)`;
        let c;
        if (b.img) c = `<img src="${b.img}" style="width:${w};height:auto;max-width:none;${r};${b.br ? `border-radius:${b.br}%` : ''};filter:drop-shadow(0 12px 24px rgba(0,0,0,0.15))">`;
        else if (b.k) c = `<div class="stk" style="font-size:${b.s * .85}vmin;${r}">${b.k}</div>`;
        else if (b.tag) c = `<div class="stk tag" style="font-size:${b.s * .42}vmin;background:${b.tag[1]};color:${b.tag[2]};${r}">${b.tag[0]}</div>`;
        else if (b.tile) c = `<div class="stk tile" style="width:${w};background:${b.tile};${r}"><i></i></div>`;
        else c = `<div class="photo" style="width:${w};background:${G[b.g]}"><div class="pf">${b.g < 3 ? '<i class="av"></i>' : ''}${b.cap ? `<span class="cap">${b.cap}</span>` : ''}</div></div>`;
        return `<div class="fb${b.desk ? ' desk' : ''}${b.c ? ' ' + b.c : ''}" style="left:${b.l}%;top:${b.t}%"><div class="fe" data-i="${i}"><div class="fd" style="--dr:${b.dr}px;--dd:${b.dd}s"><div class="fp">${c}</div></div></div></div>`;
      }).join('');
    }

    /* home screen in the hero phone */
    const ICO = ['#ffb000', '#4fd1c5', '#a78bfa', '#ff8a5c', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#818cf8', '#2dd4bf', '#fb7185'];
    const RZ = [[0, 2], [0, 3], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2], [2, 3], [3, 0], [3, 1], [3, 2], [3, 3]];
    const hg = $('#hg');
    if (hg) {
      hg.innerHTML = `<div class="hw" id="hw"><div class="hwi" style="background:url('/assets/index/bubbles/widget-1.webp') center/cover"></div><div class="hl">Locket Wan</div></div>`
        + ICO.map((c, i) => { const [e, t] = RZ[i], d = (Math.max(e > 1 ? e - 1 : 0, t > 1 ? t - 1 : 0) - 1 + (e + t) * .08) * 125; return `<div class="ic2" style="--dl:${d}ms"><b style="background:url('/assets/index/appicons/icon-${i + 1}.png') center/cover"></b><s></s></div>`; }).join('');
    }

    let hs = 0, heroVis = true, cyc;
    function hstep() {
      hs++;
      const hw = $('#hw');
      if (hs === 1 && hw && hg) { hw.classList.add('on'); hg.classList.add('dip'); }
    }
    function cycleHero(first) {
      clearTimeout(cyc);
      cyc = setTimeout(() => { if (heroVis && !document.hidden) hstep(); cycleHero(false); }, first ? 1200 : 3400);
    }

    const heroEl = $('#hero');
    const heroObserver = new IntersectionObserver(([e]) => { heroVis = e.isIntersecting; }, { threshold: .2 });
    if (heroEl) heroObserver.observe(heroEl);

    /* scroll: nền trượt ra ngoài và mờ dần */
    const fps = [...document.querySelectorAll('.fp')];
    function par() {
      const vw = innerWidth, vh = innerHeight, p = Math.min(scrollY / vh, 1);
      fps.forEach((el, i) => {
        const b = FB[i];
        if (b && el) {
          el.style.transform = `translate(${p * (b.l - 50) * .15 * vw / 100}px,${p * (b.t - 50) * .15 * vh / 100}px)`;
          el.style.opacity = 1 - p;
        }
      });
    }
    if (!RM) addEventListener('scroll', par, { passive: true });

    const chev = $('#chev');
    if (chev) {
      chev.onclick = () => {
        const d = $('#cta-section') || $('.cards');
        if (d) scrollTo({ top: Math.max(0, d.getBoundingClientRect().top + scrollY - 90), behavior: RM ? 'auto' : 'smooth' });
      };
    }

    /* intro: chữ đóng dấu -> nền bay ra -> điện thoại xoay vào */
    function reveal() {
      const hero = $('#hero');
      if (hero) hero.classList.add('go');
      const o = { duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' };
      const grp = $('#grp');
      if (grp) grp.animate([{ opacity: 0, transform: 'rotate(-10deg) scale(.45)', offset: 0 }, { opacity: 1, offset: .45 }, { opacity: 1, transform: 'none' }], o);
      const tb = $('#tb');
      if (tb) tb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 450, fill: 'both' });
      document.querySelectorAll('.fe').forEach(el => {
        const b = FB[+el.dataset.i];
        if (b) {
          el.animate([{ opacity: 0, transform: `translate(${(50 - b.l) * .8}vw,${(50 - b.t) * .8}vh) scale(.1)` }, { opacity: 1, transform: 'none' }], { duration: b.du * 1000, delay: b.de * 1000, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
        }
      });
      cycleHero(true);
    }

    (async () => {
      const st = $('#stamp');
      if (!st) return;
      const ls = [...st.querySelectorAll('b')];
      if (RM) {
        st.style.display = 'none';
        ls.forEach(b => b.style.opacity = 0);
        const grp = $('#grp'); if (grp) grp.style.opacity = 1;
        const tb = $('#tb'); if (tb) tb.style.opacity = 1;
        const hero = $('#hero'); if (hero) hero.classList.add('go');
        document.querySelectorAll('.fe').forEach(e => e.style.opacity = 1);
        hstep();
        return;
      }
      const rot = [-3, 1, -2.5], xs = [-5, 0, 6];
      await wait(350);
      for (let i = 0; i < 3; i++) {
        const sg = i % 2 ? 1 : -1;
        if (ls[i]) {
          ls[i].animate([{ opacity: 0, transform: `translateX(${xs[i]}%) rotate(${rot[i] + 14 * sg}deg) scale(0)` }, { opacity: 1, transform: `translateX(${xs[i]}%) rotate(${rot[i]}deg) scale(1)` }], { duration: 520, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'both' });
        }
        await wait(450);
      }
      await wait(50);
      st.classList.add('out');
      await wait(325);
      reveal();
    })();

    /* header + theme-color */
    const hd = $('#hd'), tc = $('#tc');
    const scrollHandler = () => {
      const y = scrollY;
      if (hd) hd.classList.toggle('solid', y > 24);
      if (tc) tc.content = y > 8 ? '#FFFBF1' : '#FFE091';
    };
    addEventListener('scroll', scrollHandler, { passive: true });

    /* card + section reveal */
    const cardIo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); cardIo.unobserve(e.target); } }), { threshold: .6 });
    document.querySelectorAll('.obs').forEach(x => cardIo.observe(x));
    document.querySelectorAll('.row button').forEach(b => b.onclick = () => { b.textContent = 'Đã thêm'; b.classList.add('ok'); });

    /* marquee */
    const R = [
      ['r', 'Nhiều tính năng hay', 'Có thể up ảnh, ví dụ nhiều cap... quay video khá nét, nhiều caption ok.'],
      ['t', '@nguoi_dung', 'Mượt, nhiều chức năng và khá dễ dùng. Khá hài lòng.'],
      ['q', 'Trải nghiệm cao cấp', 'Các tính năng giống locket gold, được trải nghiệm những thứ locket gold có.'],
      ['t', '@fan_locket', 'Up ảnh bên wan xem được người xem mà bên chính thức không thấy hiện.'],
      ['r', 'Mong đợi bản cập nhật', 'Mong app cải thiện độ mượt mà giao diện, thêm tính năng đồng bộ thông báo thì quá tuyệt.'],
      ['q', 'Góp ý từ người dùng', 'Giao diện giống app gốc là đẹp; hy vọng app khắc phục một số lỗi nhỏ khi tải vòng vòng để hoàn thiện hơn nữa.']
    ];
    const card = ([k, a, b]) => k === 'q' ? `<div class="rv q"><h4>${a}</h4><small>${b}</small></div>` : k === 'r' ? `<div class="rv"><div class="s">★★★★★</div><h4>${a}</h4><p>${b}</p></div>` : `<div class="rv"><h4>${a}</h4><p>${b}</p></div>`;
    const track = $('#track');
    if (track) track.innerHTML = (R.map(card).join('')) + (R.map(card).join(''));

    /* story dialog */
    const storyBtn = $('#storyBtn'), dlg = $('#dlg'), dclose = $('#dclose');
    if (storyBtn && dlg) storyBtn.onclick = () => dlg.showModal();
    if (dclose && dlg) dclose.onclick = () => dlg.close();
    if (dlg) dlg.onclick = e => { if (e.target === e.currentTarget) e.currentTarget.close(); };

    return () => {
      clearTimeout(cyc);
      if (!RM) removeEventListener('scroll', par);
      removeEventListener('scroll', scrollHandler);
      heroObserver.disconnect();
      cardIo.disconnect();
    };

  }, []);

  return (
    <div className="home-page font-nunito">
      <HomeHeader />
      <section className="hero" id="hero">
        <div className="fl-layer" id="fl" aria-hidden="true"></div>
        <h1 className="sr">Locket Wan</h1>
        <div className="stamp" id="stamp" aria-hidden="true">
          <div><b>Locket</b><b>Wan</b></div>
        </div>
        <div className="grp-o">
          <div className="grp" id="grp" style={{ zIndex: 30 }}>
            <div className="pv">
              <div className="ph2">
                <div className="pb">
                  <div className="sb" style={{ padding: "6cqw 7cqw 0" }}>
                    <img
                      src="/assets/index/status-bar.svg"
                      alt="status"
                      style={{ width: "100%", height: "auto", filter: "invert(1)" }}
                    />
                  </div>
                  <div className="hg" id="hg"></div>
                </div>
              </div>
            </div>
            <div className="qr">
              <a
                href="https://apk.locket-wan.top/download"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tải Locket Wan apk"
              >
                <img
                  src="/assets/index/qr-hero.svg"
                  alt="QR Code"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: "1%",
                    boxShadow: "0 16px 50px #0000002e",
                  }}
                />
              </a>
              <div className="tip">Quét mã bằng điện thoại<br />để tải Locket Wan</div>
            </div>
          </div>
        </div>
        <div className="tb" id="tb">
          <div className="wmk">Locket Wan</div>
          <p style={{ textAlign: 'center', color: '#8c8678' }}>
            App mod dành cho android <br />luôn update liên tục<br />caption đa dạng...
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <a
              className="btn get"
              href="https://apk.locket-wan.top/download"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "rgb(var(--accent))", color: "#1a1200" }}
            >
              Tải bản android
            </a>
            <Link
              className="btn get"
              to="/locket"
              style={{ background: "#1a1200", color: "#ffffff" }}
            >
              Dùng bản Web
            </Link>
          </div>
          <button className="chev" id="chev" aria-label="Cuộn xuống">
            <svg viewBox="0 0 46 16" fill="currentColor">
              <path
                d="M2 2l21 12L44 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          {/* CTA Box thay cho Carousel */}
          {/* <div className="cta-box" id="cta-section">
            <div className="cta-content">
              <span className="cta-badge">🚀 Trải nghiệm Locket Wan</span>
              <h2 className="cta-title">Sẵn sàng kết nối khoảnh khắc?</h2>
              <p className="cta-desc">
                Dùng ngay trên trình duyệt máy tính & điện thoại hoặc tải ứng dụng Android để có trải nghiệm trọn vẹn nhất.
              </p>
              <div className="cta-buttons">
                <Link to="/locket" className="cta-btn cta-btn-web">
                  <div className="cta-btn-icon-wrap">
                    <svg className="cta-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div className="cta-btn-text">
                    <span className="cta-btn-label">Trải nghiệm bản Web</span>
                    <span className="cta-btn-sub">Dùng ngay trên trình duyệt</span>
                  </div>
                  <span className="cta-btn-arrow">→</span>
                </Link>

                <a
                  href="https://apk.locket-wan.top/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-btn cta-btn-android"
                >
                  <div className="cta-btn-icon-wrap">
                    <svg className="cta-btn-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9996.4482.9996.9993.0001.5511-.4485.9997-.9996.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9994.4482.9994.9993 0 .5511-.4483.9997-.9994.9997m11.4045-6.02l1.996-3.4572c.1122-.1944.0455-.443-.1488-.5552-.1948-.1122-.4436-.0456-.5558.1488l-2.023 3.504c-1.442-.6588-3.048-1.025-4.75-1.025-1.7019 0-3.308.3662-4.75 1.025L5.6769 5.4578c-.1122-.1944-.361-.261-.5558-.1488-.1943.1122-.261.3608-.1488.5552l1.996 3.4572C3.3934 11.2335 1.0664 15.011 1 19.3444h22c-.0664-4.3334-2.3934-8.1109-5.9185-10.023" />
                    </svg>
                  </div>
                  <div className="cta-btn-text">
                    <span className="cta-btn-label">Tải app Android</span>
                    <span className="cta-btn-sub">Cài đặt file APK trực tiếp</span>
                  </div>
                  <span className="cta-btn-arrow">↓</span>
                </a>
              </div>
            </div>
          </div> */}

          <div className="cards">
            <div className="card obs">
              <div className="ico">🌈</div>
              <div>
                <h3>Caption đa sắc màu</h3>
                <p>Caption màu sắc khác nhau theo sở thích người dùng</p>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">📜</div>
              <div>
                <h3>Xem lại Lịch sử đã đăng</h3>
                <p>Ai đã xem bài viết</p>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">🔥</div>
              <div>
                <h3>Giữ chuỗi Streak</h3>
                <p>Khôi phục chuỗi</p>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">📶</div>
              <div>
                <h3>Chế độ Ngoại tuyến</h3>
                <p>Tự tải lên khi có mạng</p>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">💬</div>
              <div>
                <h3>Nhắn tin tức thời</h3>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">📤</div>
              <div>
                <h3>Up ảnh & Video</h3>
                <p>Upload ảnh, video không giới hạn</p>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">🎨</div>
              <div>
                <h3>Giao diện tùy biến</h3>
                <p>Đổi theme dễ dàng</p>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">📅</div>
              <div>
                <h3>Tính năng lịch giống iOS</h3>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">🖼️</div>
              <div>
                <h3>Tùy chỉnh khung widget (beta)</h3>
              </div>
            </div>
            <div className="card obs">
              <div className="ico">👥</div>
              <div>
                <h3>Tính năng kết bạn</h3>
                <p>Tìm kiếm bạn bè, kết bạn, kết bạn với celeb</p>
              </div>
            </div>
          </div>
        </div>

        <div className="marq" aria-label="Cảm nhận từ người dùng">
          <div className="track" id="track"></div>
        </div>

        <div className="wrap safer obs" id="safer">
          <h3>
            <svg
              className="shield"
              viewBox="0 0 34 40"
              fill="none"
              stroke="#677789"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3 4 8v10c0 9 6 16 13 19 7-3 13-10 13-19V8z" />
              <path d="m11 20 4 4 8-9" />
            </svg>
            <span>An toàn</span> cho người dùng
          </h3>
          <ul>
            <li>App không lưu bất kì dữ liệu nhạy cảm như mật khẩu người dùng</li>
          </ul>
          <button className="story" id="storyBtn">
            <span className="pol" aria-hidden="true">
              <i style={{ backgroundImage: "url('/assets/index/photos/p1.jpg')" }}></i>
              <i style={{ backgroundImage: "url('/assets/index/photos/p2.jpg')" }}></i>
            </span>
            <span>
              <p>Bạn có biết Locket Wan bắt đầu từ ....?</p>
              <p>Đọc câu chuyện →</p>
            </span>
          </button>
        </div>

        <div className="foot">
          <div className="wm" aria-hidden="true">Locket Wan</div>
          <nav className="links">
            <Link to="/about">Giới thiệu</Link>
            <Link to="/privacy">Chính sách bảo mật</Link>
            <Link to="/docs">Tài liệu & Điều khoản</Link>
            <a
              href="https://apk.locket-wan.top/download"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tải app Android
            </a>
            <Link to="/locket">Đăng nhập Web</Link>
          </nav>
        </div>
      </section>

      <dialog
        id="dlg"
        style={{
          backgroundColor: 'rgb(var(--bg, 255 251 241))',
          colorScheme: 'light',
          color: 'rgb(var(--fg, 26 18 0))'
        }}
      >
        <h3>Câu chuyện của Locket Wan</h3>
        <p>
          Locket Wan là 1 phiên bản mod dựa trên Locket ios nhằm tối ưu cho người dùng android.
          Đem lại trải nghiệm mượt mà, update liên tục cho người dùng mà locket gốc android không có.
        </p>
        <button className="btn" id="dclose">Đóng</button>
      </dialog>
    </div>
  );
}