export function getProximosDiasUteis(qtd = 5) {
  const dias = [];
  const MS_POR_DIA = 24 * 60 * 60 * 1000;
  const SP_OFFSET_MS = 3 * 60 * 60 * 1000; 

  const agoraAjustado = new Date(Date.now() - SP_OFFSET_MS);

  const ano = agoraAjustado.getUTCFullYear();
  const mes = agoraAjustado.getUTCMonth();
  const dia = agoraAjustado.getUTCDate();

  let dataUtc = new Date(Date.UTC(ano, mes, dia));

  while (dias.length < qtd) {
    const diaSemana = dataUtc.getUTCDay(); 

    // O salão atende apenas de terça à sábado
    if (diaSemana >= 2 && diaSemana <= 6) {
      const dd = String(dataUtc.getUTCDate()).padStart(2, '0');
      const mm = String(dataUtc.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = dataUtc.getUTCFullYear();
      dias.push(`${dd}/${mm}/${yyyy}`);
    }

    dataUtc = new Date(dataUtc.getTime() + MS_POR_DIA);
  }

  return dias;
}
