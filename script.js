const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyfuMpJydFBWYcOGElvpiRxCWYvzn6Utzg4B0zBSDUgWSSyJ5wHCtiSCH9VCc8oODTtoQ/exec";

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

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const data = document.getElementById("data").value;
  const refeicao = document.getElementById("refeicao").value;
  const hora = document.getElementById("hora").value;
  const pessoas = document.getElementById("pessoas").value;

  if (!nome || !telefone || !data || !hora || !pessoas) {
    alert("⚠️ Preenche todos os campos");
    return;
  }

  const url =
    `${SCRIPT_URL}?action=novaReserva` +
    `&nome=${encodeURIComponent(nome)}` +
    `&telefone=${encodeURIComponent(telefone)}` +
    `&data=${data}` +
    `&refeicao=${refeicao}` +
    `&hora=${hora}` +
    `&pessoas=${pessoas}`;

  console.log("📡 URL:", url);

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.ok) {
      alert(json.erro || "Erro ao enviar reserva");
      return;
    }

    alert("✅ Reserva confirmada com sucesso!");
    document.getElementById("form").reset();
    limparHoras();

  } catch (err) {
    console.error("❌ ERRO FETCH:", err);
    alert("Erro de ligação ao servidor");
  }
}


