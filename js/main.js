/* Заполняет сайт данными из config.js, включает меню и переключатель стилей.
   Обычно этот файл менять не нужно. */
(function () {
  var S = window.SITE || {};
  var phones = S.phones || [];
  var main = phones[0] || { number: "" };
  var tel = function (n) { return "tel:" + (n || "").replace(/[^\d+]/g, ""); };
  var q = encodeURIComponent(S.mapQuery || S.address || "");

  var links = {
    "phone-link": tel(main.number),
    "tg-link": S.telegram,
    "max-link": S.max,
    "tgchannel-link": S.tgChannel,
    "email-link": "mailto:" + (S.email || ""),
    "yandex-link": (S.lat && S.lon)
      ? "https://yandex.ru/maps/?pt=" + S.lon + "," + S.lat + "&z=16&l=map&text=" + q
      : "https://yandex.ru/maps/?text=" + q,
    "route-link": (S.lat && S.lon)
      ? "https://yandex.ru/maps/?rtext=~" + S.lat + "," + S.lon + "&rtt=auto"
      : "https://yandex.ru/maps/?rtext=~" + q + "&rtt=auto",
    "google-link": "https://www.google.com/maps/search/?api=1&query=" +
      ((S.lat && S.lon) ? S.lat + "," + S.lon : q)
  };
  var external = { "tg-link": 1, "max-link": 1, "tgchannel-link": 1, "route-link": 1 };
  var values = { phone: main.number };

  document.querySelectorAll("[data-site]").forEach(function (el) {
    var key = el.getAttribute("data-site");
    if (key in links) {
      if (!links[key]) { el.style.display = "none"; return; }  // ссылка не указана — прячем кнопку
      el.setAttribute("href", links[key]);
      if (external[key]) { el.target = "_blank"; el.rel = "noopener"; }
    } else if (key === "email-row") {
      if (!S.email) el.remove();
    } else if (values[key] !== undefined) {
      el.textContent = values[key];
    } else if (S[key] !== undefined) {
      el.textContent = S[key];
    }
  });

  // Список телефонов в контактах
  var list = document.getElementById("phones");
  if (list) {
    phones.forEach(function (p) {
      var li = document.createElement("li");
      li.innerHTML = '<a></a><small></small>';
      li.firstChild.href = tel(p.number);
      li.firstChild.textContent = p.number;
      li.lastChild.textContent = p.label || "";
      list.appendChild(li);
    });
  }

  if (S.name) document.title = S.name + " — лазерная резка, ЧПУ, сварка, гальваника";
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Карта Яндекса внутри сайта (на вашем домене загрузится автоматически)
  var map = document.getElementById("map");
  var isPreview = /claude/i.test(location.hostname);
  if (false && map && !isPreview && (S.lat && S.lon || q)) { // карта Яндекса отключена — показываем схему проезда
    var frame = document.createElement("iframe");
    frame.src = (S.lat && S.lon)
      ? "https://yandex.ru/map-widget/v1/?ll=" + S.lon + "," + S.lat + "&z=16&pt=" + S.lon + "," + S.lat + ",pm2rdm"
      : "https://yandex.ru/map-widget/v1/?text=" + q + "&z=15";
    frame.title = "Карта";
    frame.loading = "lazy";
    map.appendChild(frame);
  }

  // Отправить геолокацию: на телефоне — меню «Поделиться», на компьютере — копирует ссылку
  var shareBtn = document.getElementById("share-geo");
  if (shareBtn) {
    var geoUrl = links["yandex-link"];
    var geoText = (S.name || "") + ", " + (S.address || "") + " — корпус 1/3. " + geoUrl;
    shareBtn.addEventListener("click", function () {
      var note = document.getElementById("share-note");
      var done = function (msg) { if (note) note.textContent = msg; };
      if (navigator.share) {
        navigator.share({ title: S.name, text: geoText, url: geoUrl }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(geoText).then(function () { done("Ссылка на нашу точку скопирована — вставьте её в сообщение."); }, function () { done(geoUrl); });
      } else { done(geoUrl); }
    });
  }

  // Мобильное меню
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () { document.body.classList.toggle("menu-open"); });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });
  }

  // Переключатель стилей (для выбора варианта)
  if (S.themeSwitcher) {
    var themes = [["light", "Светлый"], ["dark", "Тёмный"], ["blue", "Синий"], ["yellow", "Промышленный"], ["modern", "Модерн"]];
    var box = document.createElement("div");
    box.className = "theme-switch";
    box.innerHTML = "<span>Стиль:</span>";
    var root = document.documentElement;
    themes.forEach(function (t) {
      var b = document.createElement("button");
      b.innerHTML = "<i>" + (themes.indexOf(t) + 1) + "</i><em> · " + t[1] + "</em>";
      b.dataset.theme = t[0];
      if (root.getAttribute("data-theme") === t[0]) b.className = "is-active";
      b.addEventListener("click", function () {
        root.setAttribute("data-theme", t[0]);
        try { localStorage.setItem("theme", t[0]); } catch (e) {}
        box.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      });
      box.appendChild(b);
    });
    document.body.appendChild(box);
  } else {
    try { localStorage.removeItem("theme"); } catch (e) {}
    document.documentElement.setAttribute("data-theme", S.theme || "light");
  }
})();
