const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwzEyIUG0SGMD6myPiUw4wH77fNT0tois8VzavcC2X_X2yVGEkeT_FFjb9v6Sx66WvFXw/exec";

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

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const data = document.getElementById("data").value;
  const refeicao = document.getElementById("refeicao").value;
  const hora = document.getElementById("hora").value;
  const pessoas = document.getElementById("pessoas").value;

  if (!nome || !telefone || !data || !refeicao || !hora || !pessoas) {
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

  try {
    const res = await fetch(url);
    const json = await res.json();

    console.log("RESPOSTA:", json);

    if (!json.ok) {
      alert(json.erro || "Erro ao criar reserva");
      return;
    }

    alert("Reserva confirmada com sucesso 🍽️");
    document.getElementById("form").reset();
    limparHoras();

  } catch (err) {
    console.error(err);
    alert("Erro ao enviar reserva");
  }
}



