export function escolherDataEHorarios(dados) {
    const diasDisponiveis = dados.horariosDisponiveis;

    if (!diasDisponiveis || diasDisponiveis.length === 0) {
        throw new Error('Nenhum dia disponível');
    }

    const dia = diasDisponiveis[Math.floor(Math.random() * diasDisponiveis.length)];

    if (!dia.horarios || dia.horarios.length === 0) {
        throw new Error('Dia sem horários disponíveis');
    }

    const horario = dia.horarios[Math.floor(Math.random() * dia.horarios.length)];

    const mapaServico = {
        "09:00": "ESCOVA",
        "10:00": "CORTE",
        "10:30": "COLORAÇÃO",
        "11:00": "ESCOVA",
        "11:30": "CORTE",
        "13:30": "ESCOVA",
        "14:00": "COLORAÇÃO",
        "15:00": "CORTE",
        "16:00": "ESCOVA",
        "16:30": "CORTE",
        "17:30": "COLORAÇÃO",
        "18:00": "ESCOVA"
    };

    return {
        data: dia.datas,
        horario,
        servico: mapaServico[horario]
    };
}
