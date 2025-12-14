export function escolherDataEHorarios(dados) {
    const diasDisponiveis = dados.horariosDisponiveis;

    if (!diasDisponiveis || diasDisponiveis.length === 0) {
        throw new Error('Nenhum dia disponível para agendamento');
    }
    
    const diaEscolhido =
        diasDisponiveis[Math.floor(Math.random() * diasDisponiveis.length)];

    if (!diaEscolhido.horarios || diaEscolhido.horarios.length === 0) {
        throw new Error('Dia escolhido não possui horários disponíveis');
    }
    
    const horarioEscolhido =
        diaEscolhido.horarios[
            Math.floor(Math.random() * diaEscolhido.horarios.length)
        ];

    return {
        data: diaEscolhido.datas,
        horario: horarioEscolhido.nome,
        servico: horarioEscolhido.servico
    };
}
