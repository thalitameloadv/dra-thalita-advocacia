import { jsPDF } from "jspdf";
import type { SimulationDraft, SimulationResult } from "@/types/simulation";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadDraftJson = (draft: SimulationDraft) => {
  const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
  downloadBlob(blob, `simulacao-draft-${draft.updatedAt}.json`);
};

export const downloadResultCsv = (result: SimulationResult) => {
  const headers = [
    "cenario",
    "der",
    "regra",
    "elegivel",
    "tempo_total_meses",
    "carencia_meses",
    "carencia_exigida",
    "rmi_sem_descarte",
    "rmi_com_descarte",
    "ganho_estimado",
  ];
  const rows: string[] = [headers.join(";")];
  result.cenarios.forEach((cenario) => {
    cenario.resultados.forEach((regra) => {
      rows.push(
        [
          cenario.derTipo,
          cenario.der,
          regra.nome,
          regra.elegivel ? "sim" : "nao",
          regra.tempoTotalMeses,
          regra.carenciaMeses,
          regra.carenciaExigida,
          regra.rmiSemDescarte ?? 0,
          regra.rmiComDescarte ?? 0,
          regra.ganhoEstimado ?? 0,
        ]
          .map((value) => `"${value}"`)
          .join(";"),
      );
    });
  });
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `simulacao-rmi-${result.simulacaoId}.csv`);
};

export const downloadResultPdf = (draft: SimulationDraft, result: SimulationResult) => {
  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text("Relatório de Simulação Previdenciária", 14, 20);
  doc.setFontSize(10);
  doc.text(`Simulação ID: ${result.simulacaoId}`, 14, 28);
  doc.text(`Gerado em: ${new Date(result.generatedAt).toLocaleString("pt-BR")}`, 14, 34);

  doc.text("Cenários Avaliados:", 14, 44);
  let y = 50;
  result.cenarios.forEach((cenario) => {
    doc.text(`- ${cenario.derTipo.toUpperCase()} (${new Date(cenario.der).toLocaleDateString("pt-BR")})`, 20, y);
    y += 6;
    cenario.resultados.forEach((regra) => {
      doc.text(
        `  • ${regra.nome} | Elegível: ${regra.elegivel ? "Sim" : "Não"} | RMI c/ descarte ${(
          regra.rmiComDescarte ?? 0
        ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        24,
        y,
      );
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  });

  y += 6;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.text("Metodologia resumida:", 14, y);
  const splitText = doc.splitTextToSize(result.metodologiaResumo, 180);
  doc.text(splitText, 14, y + 6);

  y += splitText.length * 6 + 12;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.text("Alertas:", 14, y);
  if (result.alertas.length === 0) {
    doc.text("- Nenhum alerta crítico registrado.", 20, y + 6);
  } else {
    result.alertas.forEach((alerta, index) => {
      doc.text(`- ${alerta}`, 20, y + 6 + index * 6);
    });
  }

  doc.save(`relatorio-simulacao-${result.simulacaoId}.pdf`);
};
