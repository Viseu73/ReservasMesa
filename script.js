const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwrfyQkCCJO3hrejeOuZazT4eGV5YT0AuetO0K2xr3BHeZJ-RyFX_bfhhHKTD1KO0MYrw/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const dataInput = document.getElementById("data");
  const refeicao = document.getElementById("refeicao");
  const hora = document.getElementById("hora");

  dataInput.addEventListener("change", carregarHoras);
  refeicao.addEventListener("change", carregarHoras);
  form.addEventListener("submit", enviarReserva);
});

/* =========================
   CARREGAR HORAS
========================= */
async function carregarHoras() {
  const data = document.getElementById("data").value;
  const refeicao = document.getElementById("refeicao").value;
  const horaSelect = document.getElementById("hora");

  horaSelect.innerHTML = "";

  if (!data || !refeicao) {
    return;
  }

  try {
    const url = `${SCRIPT_URL}?action=getHoras&data=${data}&refeicao=${refeicao}`;
    console.log("GET HORAS:", url);

    const res = await fetch(url);
    const horas = await res.json();

    console.log("HORAS RECEBIDAS:", horas);

    if (!Array.isArray(horas) || horas.length === 0) {
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
    console.error("Erro getHoras:", e);
    alert("Erro ao carregar horários");
  }
}

/* =========================
   ENVIAR RESERVA
========================= */
async function enviarReserva(e) {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const data = dataInput.value;
  const refeicao = refeicaoSelect.value;
  const hora = horaSelect.value;
  const pessoas = pessoasInput.value;

  const url =
    `${SCRIPT_URL}?action=novaReserva` +
    `&nome=${encodeURIComponent(nome)}` +
    `&telefone=${encodeURIComponent(telefone)}` +
    `&data=${data}` +
    `&refeicao=${refeicao}` +
    `&hora=${hora}` +
    `&pessoas=${pessoas}`;

  try {
    const res = await fetch(url);

    if (!res.ok) throw new Error("HTTP " + res.status);

    const text = await res.text();
    console.log("Resposta RAW:", text);

    alert("Reserva confirmada com sucesso 🍽️");
    form.reset();
    limparHoras();

  } catch (err) {
    console.error("ERRO FETCH:", err);
    alert("Erro de ligação ao servidor");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formReserva");

  if (!form) {
    console.error("FORM NÃO ENCONTRADO");
    return;
  }

  form.addEventListener("submit", enviarReserva);
});


