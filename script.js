const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyxYRqtPNDrBUcEkj_jaToUwnpq_1bssM5C_EDirDpa9pWp5sEVJMrd-jMfPuVQZcqXrQ/exec";

/* =========================
   ELEMENTOS
========================= */
const dataInput = document.getElementById("data");
const refeicaoSelect = document.getElementById("refeicao");
const horaSelect = document.getElementById("hora");
const form = document.getElementById("formReserva");

const nomeInput = document.getElementById("nome");
const telefoneInput = document.getElementById("telefone");
const pessoasInput = document.getElementById("pessoas");

let funcionamento = {};

/* =========================
   FUNCIONAMENTO
========================= */
async function carregarFuncionamento() {
  const res = await fetch(`${SCRIPT_URL}?action=getFuncionamento`);
  funcionamento = await res.json();
}

function validarDia() {
  const data = dataInput.value;
  if (!data) return;

  const dia = new Date(data + "T00:00:00").getDay();

  if (!funcionamento[dia]?.aberto) {
    alert("O restaurante encontra-se encerrado neste dia.");
    dataInput.value = "";
    limparHoras();
    return;
  }

  carregarHoras();
}

/* =========================
   HORAS
========================= */
async function carregarHoras() {
  const data = dataInput.value;
  const refeicao = refeicaoSelect.value;

  horaSelect.innerHTML = "";

  if (!data || !refeicao) return;

  try {
    const res = await fetch(
      `${SCRIPT_URL}?action=getHoras&data=${data}&refeicao=${refeicao}`
    );
    const horas = await res.json();

    if (!horas.length) {
      const o = document.createElement("option");
      o.textContent = "Sem disponibilidade";
      o.disabled = true;
      o.selected = true;
      horaSelect.appendChild(o);
      return;
    }

    horas.forEach(h => {
      const o = document.createElement("option");
      o.value = h;
      o.textContent = h;
      horaSelect.appendChild(o);
    });

  } catch (e) {
    alert("Erro ao carregar horários");
    console.error(e);
  }
}

function limparHoras() {
  horaSelect.innerHTML = "";
}

/* =========================
   RESERVA
========================= */
async function enviarReserva(e) {
  e.preventDefault();

  const url =
    `${SCRIPT_URL}?action=novaReserva` +
    `&nome=${encodeURIComponent(nomeInput.value)}` +
    `&telefone=${encodeURIComponent(telefoneInput.value)}` +
    `&data=${dataInput.value}` +
    `&refeicao=${refeicaoSelect.value}` +
    `&hora=${horaSelect.value}` +
    `&pessoas=${pessoasInput.value}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.ok) {
      alert(json.erro || "Erro ao enviar reserva");
      return;
    }

    alert("Reserva confirmada 🍽️");
    form.reset();
    limparHoras();

  } catch (err) {
    alert("Erro de ligação ao servidor");
    console.error(err);
  }
}

/* =========================
   EVENTOS
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await carregarFuncionamento();

  dataInput.addEventListener("change", validarDia);
  refeicaoSelect.addEventListener("change", carregarHoras);
  form.addEventListener("submit", enviarReserva);
});
