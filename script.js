// ===============================
// CONFIG
// ===============================
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyLVll7EUtcWYKCEnxaFSXWAlr4jmx6lBWyMmGI0BhFQ2pRRw5y8Q1DqGUm0V-TFTioTg/exec";

let funcionamento = {};

console.log("🚀 Sistema iniciado");

// ===============================
// JSONP HELPER (ANTI-CORS)
// ===============================
function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = "cb_" + Math.random().toString(36).substring(2);

    window[cb] = data => {
      resolve(data);
      delete window[cb];
      script.remove();
    };

    const script = document.createElement("script");
    script.src = `${url}&callback=${cb}`;
    script.onerror = reject;

    document.body.appendChild(script);
  });
}

// ===============================
// CARREGAR FUNCIONAMENTO
// ===============================
async function carregarFuncionamento() {
  const url = `${SCRIPT_URL}?action=getFuncionamento`;
  console.log("📡 GET FUNCIONAMENTO:", url);

  funcionamento = await jsonp(url);
  console.log("📥 FUNCIONAMENTO:", funcionamento);
}

// ===============================
// VALIDAR DIA
// ===============================
function validarDia() {
  const dataInput = document.getElementById("data");
  const data = dataInput.value;
  if (!data) return;

  const dia = new Date(data + "T00:00:00").getDay(); // 0–6

  if (!funcionamento[dia]?.aberto) {
    alert("O restaurante encontra-se encerrado neste dia.");
    dataInput.value = "";
    limparHoras();
    return;
  }

  carregarHoras();
}

// ===============================
// CARREGAR HORAS DISPONÍVEIS
// ===============================
async function carregarHoras() {
  const data = document.getElementById("data").value;
  const refeicao = document.getElementById("refeicao").value;
  const horaSelect = document.getElementById("hora");

  horaSelect.innerHTML = "";

  if (!data || !refeicao) return;

  const url = `${SCRIPT_URL}?action=getHoras&data=${data}&refeicao=${refeicao}`;
  console.log("📡 GET HORAS:", url);

  const horas = await jsonp(url);
  console.log("🕒 HORAS RECEBIDAS:", horas);

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
}

function limparHoras() {
  document.getElementById("hora").innerHTML = "";
}

// ===============================
// ENVIAR RESERVA (JSONP)
// ===============================
async function enviarReserva(e) {
  e.preventDefault();
  console.log("👉 enviarReserva chamada");

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const data = document.getElementById("data").value;
  const refeicao = document.getElementById("refeicao").value;
  const hora = document.getElementById("hora").value;
  const pessoas = document.getElementById("pessoas").value;

  if (!nome || !telefone || !data || !hora || !pessoas) {
    alert("Preenche todos os campos");
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
    const res = await jsonp(url);
    console.log("✅ RESPOSTA:", res);

    if (res.erro) {
      alert(res.erro);
      return;
    }

    alert("Reserva confirmada com sucesso!");
    document.getElementById("form").reset();
    limparHoras();

  } catch (err) {
    console.error("❌ ERRO FETCH:", err);
    alert("Erro de ligação ao servidor");
  }
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
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
