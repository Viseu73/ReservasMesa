const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwtfdRCzxxK9qzt8J1sNW25BGpDr6NLu0bjAyt7u9bAtAG91F6AZ-_k2FBEswa-lZZM9Q/exec";

/* =========================
   VARIÁVEIS
========================= */
let funcionamento = {};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Sistema iniciado");

  await carregarFuncionamento();

  document.getElementById("data").addEventListener("change", validarDia);
  document.getElementById("refeicao").addEventListener("change", carregarHoras);

  const form = document.getElementById("form");
  if (!form) {
    console.error("❌ FORM NÃO ENCONTRADO");
    return;
  }

  form.addEventListener("submit", enviarReserva);
});

/* =========================
   FUNCIONAMENTO
========================= */
async function carregarFuncionamento() {
  const res = await fetch(SCRIPT_URL + "?action=getFuncionamento");
  funcionamento = await res.json();
  console.log("📅 Funcionamento:", funcionamento);
}

/* =========================
   VALIDAR DIA
========================= */
function validarDia() {
  const dataInput = document.getElementById("data");
  const data = dataInput.value;
  if (!data) return;

  const dia = new Date(data + "T00:00:00").getDay();

  if (!funcionamento[dia]?.aberto) {
    alert("❌ Restaurante encerrado neste dia.");
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
  const data = document.getElementById("data").value;
  const refeicao = document.getElementById("refeicao").value;
  const horaSelect = document.getElementById("hora");

  horaSelect.innerHTML = "";

  if (!data || !refeicao) return;

  try {
    const url = `${SCRIPT_URL}?action=getHoras&data=${data}&refeicao=${refeicao}`;
    console.log("⏱ GET HORAS:", url);

    const res = await fetch(url);
    const horas = await res.json();

    console.log("🕐 HORAS RECEBIDAS:", horas);

    if (!horas.length) {
      const opt = document.createElement("option");
      opt.textContent = "Sem disponibilidade";
      opt.disabled = true;
      opt.selected = true;
      horaSelect.appendChild(opt);
      return;
    }

    horas.forEach(h => {
      const o = document.createElement("option");
      o.value = h;
      o.textContent = h;
      horaSelect.appendChild(o);
    });

  } catch (e) {
    console.error("❌ Erro horários:", e);
    alert("Erro ao carregar horários");
  }
}

function limparHoras() {
  document.getElementById("hora").innerHTML = "";
}

/* =========================
   ENVIAR RESERVA
========================= */
async function enviarReserva(e) {
  e.preventDefault();

  console.log("👉 enviarReserva chamada");

  const reserva = {
    nome: document.getElementById("nome").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    data: document.getElementById("data").value,
    refeicao: document.getElementById("refeicao").value,
    hora: document.getElementById("hora").value,
    pessoas: parseInt(document.getElementById("pessoas").value),
  };

  if (!reserva.nome || !reserva.telefone || !reserva.data || !reserva.hora || !reserva.pessoas) {
    alert("⚠️ Preenche todos os campos");
    return;
  }

  try {
    const res = await fetch(SCRIPT_URL + "?action=novaReserva", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reserva)
    });

    const text = await res.text();
    console.log("📨 RESPOSTA RAW:", text);

    if (!text) {
      alert("✅ Reserva confirmada!");
      limparHoras();
      document.getElementById("form").reset();
      return;
    }

    const json = JSON.parse(text);

    if (!json.ok) {
      alert(json.erro || "Erro ao enviar reserva");
      return;
    }

    alert("✅ Reserva confirmada!");
    limparHoras();
    document.getElementById("form").reset();

  } catch (err) {
    console.error("❌ ERRO FETCH:", err);
    alert("Erro de ligação ao servidor");
  }
}
