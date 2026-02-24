import { menu } from "./menu.js";

const waiters = [
  { id: 1, name: "Варя" },
  { id: 2, name: "Рита" },

];

// ---------- состояние ----------

let tabs = [];
let activeTabId = null;

// ---------- элементы ----------

const waiterSelect = document.getElementById("waiterSelect");
const menuSelect = document.getElementById("menuSelect");
const categorySelect = document.getElementById("categorySelect");
const tabsList = document.getElementById("tabsList");
const currentGuest = document.getElementById("currentGuest");

const guestNameInput = document.getElementById("guestNameInput");

const qtyInput = document.getElementById("qtyInput");
const unitPriceEl = document.getElementById("unitPrice");
const lineTotalEl = document.getElementById("lineTotal");

const orderTable = document.getElementById("orderTable");
const orderTotalEl = document.getElementById("orderTotal");

// ---------- заполнение списков ----------

waiters.forEach(w => {
  const o = document.createElement("option");
  o.value = w.id;
  o.textContent = w.name;
  waiterSelect.appendChild(o);
});

// ---------- тема ----------

const themeBtn = document.getElementById("themeToggle");

themeBtn.onclick = () => {
  const body = document.body;
  const theme = body.getAttribute("data-theme");

  body.setAttribute(
    "data-theme",
    theme === "dark" ? "light" : "dark"
  );

  themeBtn.textContent =
    theme === "dark" ? "☀️" : "🌙";
};

// ---------- счётчик количества ----------

document.getElementById("plusBtn").onclick = () => {
  qtyInput.value = Number(qtyInput.value) + 1;
  updatePreview();
};

document.getElementById("minusBtn").onclick = () => {
  if (qtyInput.value > 1) {
    qtyInput.value--;
    updatePreview();
  }
};

menuSelect.onchange = updatePreview;
qtyInput.oninput = updatePreview;

categorySelect.onchange = () => {
  renderMenuSelect();
  updatePreview();
};

// ---------- открыть счёт ----------

document.getElementById("openTabBtn").onclick = () => {

  const name = guestNameInput.value.trim();
  const waiterId = waiterSelect.value;

  if (!name || !waiterId) {
    alert("Введите имя гостя и выберите официанта");
    return;
  }

  if (tabs.some(t => t.guestName === name)) {
    alert("Гость с таким именем уже открыт");
    return;
  }

  const tab = {
    id: crypto.randomUUID(),
    guestName: name,
    waiterId,
    items: []
  };

  tabs.push(tab);
  activeTabId = tab.id;

  guestNameInput.value = "";

  renderTabs();
  renderOrder();
  saveState();
};

// ---------- добавить позицию ----------

document.getElementById("addItemBtn").onclick = () => {

  if (!activeTabId) {
    alert("Сначала выберите счёт");
    return;
  }

  const menuId = menuSelect.value;
  if (!menuId) return;

  const tab = tabs.find(t => t.id === activeTabId);
  const item = menu.find(m => m.id === menuId);

  const qty = Number(qtyInput.value);

  const existing = tab.items.find(i => i.id === item.id);

  if (existing) {
    existing.qty += qty;
  } else {
    tab.items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty
    });
  }

  qtyInput.value = 1;

  renderOrder();
  saveState();
};

// ---------- закрыть счёт ----------

document.getElementById("closeTabBtn").onclick = () => {

  if (!activeTabId) return;

  tabs = tabs.filter(t => t.id !== activeTabId);
  activeTabId = null;

  renderTabs();
  renderOrder();
  saveState();
};

// ---------- отрисовка ----------

function renderTabs() {

  tabsList.innerHTML = "";

  tabs.forEach(tab => {

    const li = document.createElement("li");
    li.textContent = tab.guestName;

    if (tab.id === activeTabId)
      li.classList.add("active");

    li.onclick = () => {
      activeTabId = tab.id;
      renderTabs();
      renderOrder();
      saveState();
    };

    tabsList.appendChild(li);
  });

  const active = tabs.find(t => t.id === activeTabId);
  currentGuest.textContent = active ? active.guestName : "не выбран";
}

function renderOrder() {

  orderTable.innerHTML = "";

  const tab = tabs.find(t => t.id === activeTabId);

  if (!tab) {
    orderTotalEl.textContent = "0.00";
    currentGuest.textContent = "не выбран";
    return;
  }

  let total = 0;

  tab.items.forEach(i => {

    const tr = document.createElement("tr");
    const sum = i.qty * i.price;

    total += sum;

    tr.innerHTML = `
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${i.price.toFixed(2)} ₾</td>
      <td>${sum.toFixed(2)} ₾</td>
    `;

    orderTable.appendChild(tr);
  });

  orderTotalEl.textContent = total.toFixed(2);
}

// ---------- предпросмотр ----------

function updatePreview() {

  const menuId = menuSelect.value;
  const qty = Number(qtyInput.value);

  if (!menuId) {
    unitPriceEl.textContent = "0.00";
    lineTotalEl.textContent = "0.00";
    return;
  }

  const item = menu.find(m => m.id === menuId);

  unitPriceEl.textContent = item.price.toFixed(2);
  lineTotalEl.textContent = (item.price * qty).toFixed(2);
}


// ---------- фильтр по меню ----------

function renderMenuSelect() {

  const category = categorySelect.value;

  menuSelect.innerHTML = "";

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Выберите товар";
  menuSelect.appendChild(empty);

  const filtered = category === "all"
    ? menu
    : menu.filter(m => m.category === category);

  filtered.forEach(m => {
    const o = document.createElement("option");
    o.value = m.id;
    o.textContent = m.name;
    menuSelect.appendChild(o);
  });
}


// ---------- сохранение в localStorage ----------

function saveState() {
  localStorage.setItem("pos_tabs", JSON.stringify(tabs));
  localStorage.setItem("pos_activeTabId", activeTabId);
}


// ---------- загрузку при старте ----------

function loadState() {
  const savedTabs = localStorage.getItem("pos_tabs");
  const savedActive = localStorage.getItem("pos_activeTabId");

  if (savedTabs) {
    tabs = JSON.parse(savedTabs);
  }

  if (savedActive) {
    activeTabId = savedActive;
  }

  renderTabs();
  renderOrder();
}

loadState();
renderMenuSelect();