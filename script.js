const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxAQIi25t1ea_glXaF4HMVEkBTDdfao62jayjSWvFCav1K062Wp-oVoSfuwD_eu2zIk/exec";

let funcionamento = {};

document.addEventListener("DOMContentLoaded", async () => {
  await carregarFuncionamento();

  document.getElementById("data").addEventListener("change", validarDia);
  document.getElementById("refeicao").addEventListener("change", carregarHoras);
  document.getElementById("form").addEventListener("submit", enviarReserva);
});

/* ===============================
   FUNCIONAMENTO
================================ */

async function carregarFuncionamento() {
  const res = await fetch(SCRIPT_URL + "?action=getFuncionamento");
  funcionamento = await res.json();
}

function validarDia() {
  const dataInput = document.getElementById("data");
  const data = dataInput.value;
  if (!data) return;

  const dias = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado"
  ];

  const d = new Date(data + "T00:00:00");
  const dia = dias[d.getDay()];

  if (!funcionamento[dia] || !funcionamento[dia].aberto) {
    alert("O restaurante encontra-se encerrado neste dia.");
    dataInput.value = "";
    limparHoras();
    return;
  }

  carregarHoras();
}


  carregarHoras();
}

/* ===============================
   HORAS DISPONÍVEIS
================================ */

async function carregarHoras() {
  const data = document.getElementById("data").value;
  const refeicao = document.getElementById("refeicao").value;
  const horaSelect = document.getElementById("hora");

  horaSelect.innerHTML = "";

  if (!data || !refeicao) return;

  try {
    const res = await fetch(
      `${SCRIPT_URL}?action=getHoras&data=${data}&refeicao=${refeicao}`
    );
    const horas = await res.json();

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
    alert("Erro ao carregar horários");
    console.error(e);
  }
}

function limparHoras() {
  const horaSelect = document.getElementById("hora");
  horaSelect.innerHTML = "";
}

/* ===============================
   ENVIAR RESERVA
================================ */

async function enviarReserva(e) {
  e.preventDefault();

  const reserva = {
    nome: nome.value.trim(),
    telefone: telefone.value.trim(),
    data: data.value,
    refeicao: refeicao.value,
    hora: hora.value,
    pessoas: parseInt(pessoas.value),
    origem: "cliente"
  };

  if (
    !reserva.nome ||
    !reserva.telefone ||
    !reserva.data ||
    !reserva.hora ||
    !reserva.pessoas
  ) {
    alert("Preenche todos os campos");
    return;
  }

  try {
    const res = await fetch(SCRIPT_URL + "?action=novaReserva", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reserva)
    });

    const r = await res.json();

    if (r.erro) {
      alert(r.erro);
      return;
    }

    alert("Reserva confirmada com sucesso!");
    document.getElementById("form").reset();
    limparHoras();

  } catch (err) {
    alert("Erro ao enviar reserva");
    console.error(err);
  }
}

