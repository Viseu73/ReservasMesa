const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxAQIi25t1ea_glXaF4HMVEkBTDdfao62jayjSWvFCav1K062Wp-oVoSfuwD_eu2zIk/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const refeicao = document.getElementById("refeicao");
  const hora = document.getElementById("hora");

  atualizarHoras();
  refeicao.addEventListener("change", atualizarHoras);
  form.addEventListener("submit", enviarReserva);

  function atualizarHoras() {
    hora.innerHTML = "";
    const horas =
      refeicao.value === "almoco"
        ? ["12:00", "12:30", "13:00", "13:30", "14:00"]
        : ["19:30", "20:00", "20:30", "21:00"];

    horas.forEach(h => {
      const o = document.createElement("option");
      o.value = h;
      o.textContent = h;
      hora.appendChild(o);
    });
  }

  async function enviarReserva(e) {
    e.preventDefault();

    const reserva = {
      nome: nome.value.trim(),
      telefone: telefone.value.trim(),
      data: data.value,
      refeicao: refeicao.value,
      hora: hora.value,
      pessoas: parseInt(pessoas.value),
      origem: "cliente",
      mesas: []
    };

    if (!reserva.nome || !reserva.telefone || !reserva.data || !reserva.pessoas) {
      alert("Preenche todos os campos");
      return;
    }

    try {
      await fetch(SCRIPT_URL + "?action=novaReserva", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserva)
      });

      alert("Reserva enviada com sucesso!");
      form.reset();
      atualizarHoras();

    } catch (err) {
      alert("Erro ao enviar reserva");
      console.error(err);
    }
  }
});
let funcionamento = {};

async function carregarFuncionamento() {
  const res = await fetch(SCRIPT_URL + "?action=getFuncionamento");
  funcionamento = await res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarFuncionamento();
});

