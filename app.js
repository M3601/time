const hours = document.querySelector("#hours");
const minutes = document.querySelector("#minutes");
const seconds = document.querySelector("#seconds");
const bell = new Audio("bell.mp3");
let timerData = { index: undefined, interval: undefined, timeout: undefined };
let timers = JSON.parse(window.localStorage.getItem("timers") ?? "[]");

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function pad(n, length) {
  let result = `${n}`;
  if (result.length < length)
    result = "0".repeat(length - result.length) + result;
  return result;
}

async function setTime(time) {
  hours.dataset.value = pad(time.h, 2);
  minutes.dataset.value = pad(time.m, 2);
  seconds.dataset.value = pad(time.s, 2);
}

class Time {
  h;
  m;
  s;
  constructor(h, m, s) {
    this.h = h;
    this.m = m;
    this.s = s;
  }
  increment() {
    this.s++;
    if (this.s % 60 == 0) {
      this.m++;
      this.s = 0;
      if (this.m % 60 == 0) {
        this.h = (this.h + 1) % 24;
        this.m = 0;
      }
    }
  }
  decrement() {
    if (this.s == 0) {
      this.s = 59;
      if (this.m == 0) {
        this.m = 59;
        if (this.h == 0) this.h = 23;
        else this.h--;
      } else this.m--;
    } else this.s--;
  }
  isZero() {
    return this.h == 0 && this.m == 0 && this.s == 0;
  }
  zero() {
    this.h = 0;
    this.m = 0;
    this.s = 0;
  }
  ms() {
    return this.h * 3600000 + this.m * 60000 + this.s * 1000;
  }
}

async function setTimer(time) {
  hours.dataset.unit = pad(time.h, 2);
  minutes.dataset.unit = pad(time.m, 2);
  seconds.dataset.unit = pad(time.s, 2);
}

function clear() {
  document.querySelector("main").classList.remove("timer");
  hours.dataset.unit = "hours";
  minutes.dataset.unit = "minutes";
  seconds.dataset.unit = "seconds";
  timerData.index = undefined;
}

function addTimer(time) {
  const footer = document.querySelector("footer");
  const timer = document.createElement("div");
  timer.classList.add("timer");
  const h = pad(time.h, 2);
  const m = pad(time.m, 2);
  const s = pad(time.s, 2);
  timer.dataset.value = h + m + s;
  timer.dataset.index = footer.children.length - 1;
  let tmp;
  tmp = document.createElement("div");
  tmp.innerText = h;
  timer.appendChild(tmp);
  tmp = document.createElement("div");
  tmp.innerText = m;
  timer.appendChild(tmp);
  tmp = document.createElement("div");
  tmp.innerText = s;
  timer.appendChild(tmp);
  footer.appendChild(timer);
  timer.focus();

  let startTimer = () => {
    let value = timer.dataset.value;
    if (timerData.index != undefined) {
      clearInterval(timerData.interval);
      clearTimeout(timerData.timeout);
      document.querySelector(".timer.loaded").classList.remove("loaded");
      if (timerData.index == timer.dataset.index) return clear();
      clear();
    }
    timerData.index = timer.dataset.index;
    document.querySelector("main").classList.add("timer");
    let time = new Time(
      +value.substr(0, 2),
      +value.substr(2, 2),
      +value.substr(4, 2)
    );
    timer.classList.add("loaded");
    setTimer(time);
    timerData.timeout = setTimeout(() => {
      clearInterval(timerData.interval);
      bell.play();
      clear();
      timer.classList.remove("loaded");
    }, time.ms());
    time.decrement();
    timerData.interval = setInterval(() => {
      setTimer(time);
      time.decrement();
    }, 1000);
  };

  let shortPress = undefined;
  let longPress = undefined;
  timer.addEventListener("pointerdown", () => {
    shortPress = setTimeout(() => {
      timer.classList.add("delete");
    }, 500);
    longPress = setTimeout(async () => {
      timer.classList.add("removed");
      await sleep(700);
      let index = timer.dataset.index;
      timer.remove();
      window.localStorage.setItem(
        "timers",
        JSON.stringify(timers.filter((_v, i) => i != index))
      );
    }, 3000);
  });
  timer.addEventListener("pointerup", () => {
    if (longPress) clearTimeout(longPress);
    if (shortPress) clearTimeout(shortPress);
    longPress = undefined;
    shortPress = undefined;
    timer.classList.remove("delete");
    if (!timer.classList.contains("removed")) startTimer();
  });
}

async function loadTimers() {
  if (window.localStorage.getItem("timers") == null) {
    timers.push({
      h: 0,
      m: 0,
      s: 30,
    });
    timers.push({
      h: 0,
      m: 1,
      s: 0,
    });
    timers.push({
      h: 0,
      m: 2,
      s: 0,
    });
    timers.push({
      h: 0,
      m: 5,
      s: 0,
    });
    timers.push({
      h: 0,
      m: 10,
      s: 0,
    });
    window.localStorage.setItem("timers", JSON.stringify(timers));
  }
  for (let i = 0; i < timers.length; i++) {
    const timer = timers[i];
    addTimer(new Time(timer.h, timer.m, timer.s));
  }
}

function inChildren(element, search) {
  if (element == search) return true;
  if (element.children)
    for (const node of element.children)
      if (inChildren(node, search)) return true;
  return false;
}

async function initModal() {
  const modal = document.querySelector("#modal");
  const inputh = document.querySelector("#input_hours");
  const inputm = document.querySelector("#input_minutes");
  const inputs = document.querySelector("#input_seconds");
  document.addEventListener("click", (ev) => {
    if (inChildren(document.querySelector(".timer.add"), ev.target)) return;
    if (!modal.classList.contains("show")) return;
    if (!inChildren(modal, ev.target)) modal.classList.remove("show");
  });
  document.querySelector(".timer.add").addEventListener("click", () => {
    modal.classList.add("show");
  });
  document.addEventListener("keyup", () => {
    if (!modal.classList.contains("show")) return;
    if (inputh.value.length > 0)
      inputh.value = /[0-9][0-9]?/.exec(inputh.value)[0];
    if (inputm.value.length > 0)
      inputm.value = /[0-9][0-9]?/.exec(inputm.value)[0];
    if (inputs.value.length > 0)
      inputs.value = /[0-9][0-9]?/.exec(inputs.value)[0];
  });
  document.querySelector("#modal #submit").addEventListener("click", () => {
    if (inputh.value == "") inputh.value = 0;
    if (inputm.value == "") inputm.value = 0;
    if (inputs.value == "") inputs.value = 0;
    let h = +inputh.value;
    let m = +inputm.value;
    let s = +inputs.value;
    const time = new Time(h, m, s);
    if (time.isZero()) {
      inputh.classList.add("error");
      inputm.classList.add("error");
      inputs.classList.add("error");
      return;
    }
    modal.classList.remove("show");
    inputh.classList.remove("error");
    inputm.classList.remove("error");
    inputs.classList.remove("error");
    inputh.value = "";
    inputm.value = "";
    inputs.value = "";
    addTimer(time);
    timers.push({
      h: h,
      m: m,
      s: s,
    });
    window.localStorage.setItem("timers", JSON.stringify(timers));
  });
}

async function registerSW() {
  if ("serviceWorker" in navigator)
    try {
      await navigator.serviceWorker.register("sw.js");
    } catch (e) {}
}

async function main() {
  registerSW();

  loadTimers();
  initModal();

  clear();
  const date = new Date();
  let time = new Time(date.getHours(), date.getMinutes(), date.getSeconds());
  setTime(time);
  await sleep(1000 - date.getMilliseconds());
  while (true) {
    time.increment();
    setTime(time);
    await sleep(1000);
  }
}

document.addEventListener("DOMContentLoaded", main);
