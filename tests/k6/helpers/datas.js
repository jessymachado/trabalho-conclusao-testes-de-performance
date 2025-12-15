export function escolherDataEHorarios(dadosApi, horariosEServicos) {
    const diasDisponiveis = dadosApi.horariosDisponiveis;

    if (!diasDisponiveis || diasDisponiveis.length === 0) {
        throw new Error('Nenhum dia disponível');
    }

    const dia = diasDisponiveis[
        Math.floor(Math.random() * diasDisponiveis.length)
    ];

    if (!dia.horarios || dia.horarios.length === 0) {
        throw new Error('Dia sem horários disponíveis');
    }

    const horariosValidos = horariosEServicos.filter(h =>
        dia.horarios.includes(h.horario)
    );

    if (horariosValidos.length === 0) {
        throw new Error('Nenhum horário compatível com o dataset');
    }

    const escolhido =
        horariosValidos[Math.floor(Math.random() * horariosValidos.length)];

    return {
        data: dia.datas,
        horario: escolhido.horario,
        servico: escolhido.servico
    };
}
