const { func } = require('../infra/database');
const database = require('../infra/database');

exports.getOrdensServicoPainelComModeloOS = async function(date){
    //O postgres espera uma data no formato MM/DD/YYYY
    console.log(date);
    const strDate = [(date.getMonth()+1).toString().padStart(2, '0'), //o getMonth tem indice 0, portanto, precisa incrementar +1 para obter o mês correto.
            date.getDate().toString().padStart(2, '0'),
            date.getFullYear()].join('/');

    return database.query(
        `Select
            ordem_servico.data_inicio_programado::Date As DATA_PROGRAMADA,
            ordem_servico_tecnico.id_usuario As ID_USUARIO,
            users.name As USUARIO,
            ordem_servico_disponibilidade.id_periodo_dia As ID_TURNO,
            periodo_dia.descricao As DESCRICAO_TURNO,
            Count(ordem_servico.data_inicio_programado::Date) As QUANTIDADE_OS,
            modelo_ordem_servico.nome As MODELO_OS,
            '40' As VAGAS
        From
            ordem_servico Inner Join
            ordem_servico_disponibilidade On ordem_servico_disponibilidade.id_ordem_servico = ordem_servico.id_ordem_servico
            Inner Join
            periodo_dia On ordem_servico_disponibilidade.id_periodo_dia = periodo_dia.id_periodo_dia Inner Join
            ordem_servico_tecnico On ordem_servico_tecnico.id_ordem_servico = ordem_servico.id_ordem_servico Inner Join
            users On ordem_servico_tecnico.id_usuario = users.id Left Join
            tipo_ordem_servico On ordem_servico.id_tipo_ordem_servico = tipo_ordem_servico.id_tipo_ordem_servico Left Join
            modelo_ordem_servico On tipo_ordem_servico.id_modelo_ordem_servico = modelo_ordem_servico.id_modelo_ordem_servico
        Where
            ordem_servico.data_inicio_programado::Date = '${strDate}' And
            ordem_servico_tecnico.id_usuario In (2208, 2209, 2210, 2211, 2203, 2212, 2205, 2207, 2204, 2869)
        Group By
            ordem_servico.data_inicio_programado::Date,
            ordem_servico_tecnico.id_usuario,
            users.name,
            ordem_servico_disponibilidade.id_periodo_dia,
            periodo_dia.descricao,
            modelo_ordem_servico.nome
        Order By
            DATA_PROGRAMADA Desc,
            ID_USUARIO,
            ID_TURNO`
    );
}

exports.getOrdensServicoPainelSemModeloOS = async function(date){
    //O postgres espera uma data no formato MM/DD/YYYY
    console.log(date);
    const strDate = [(date.getMonth()+1).toString().padStart(2, '0'), //o getMonth tem indice 0, portanto, precisa incrementar +1 para obter o mês correto.
            date.getDate().toString().padStart(2, '0'),
            date.getFullYear()].join('/');

    return database.query(
        `Select
        ordem_servico.data_inicio_programado::Date As DATA_PROGRAMADA,
        ordem_servico_tecnico.id_usuario As ID_USUARIO,
        users.name As USUARIO,
        ordem_servico_disponibilidade.id_periodo_dia As ID_TURNO,
        periodo_dia.descricao As DESCRICAO_TURNO,
        Count(ordem_servico.data_inicio_programado::Date) As QUANTIDADE_OS,
        '40' As VAGAS
    From
        ordem_servico Inner Join
        ordem_servico_disponibilidade On ordem_servico_disponibilidade.id_ordem_servico = ordem_servico.id_ordem_servico
        Inner Join
        periodo_dia On ordem_servico_disponibilidade.id_periodo_dia = periodo_dia.id_periodo_dia Inner Join
        ordem_servico_tecnico On ordem_servico_tecnico.id_ordem_servico = ordem_servico.id_ordem_servico Inner Join
        users On ordem_servico_tecnico.id_usuario = users.id Left Join
        tipo_ordem_servico On ordem_servico.id_tipo_ordem_servico = tipo_ordem_servico.id_tipo_ordem_servico
    Where
        ordem_servico.data_inicio_programado::Date = '${strDate}' And
        ordem_servico_tecnico.id_usuario In (2208, 2209, 2210, 2211, 2203, 2212, 2205, 2207, 2204, 2869)
    Group By
        ordem_servico.data_inicio_programado::Date,
        ordem_servico_tecnico.id_usuario,
        users.name,
        ordem_servico_disponibilidade.id_periodo_dia,
        periodo_dia.descricao
    Order By
        DATA_PROGRAMADA Desc,
        ID_USUARIO,
        ID_TURNO`
    );
}

exports.getOrdensServicoPainelSemModeloOSHojeEAmanhaOLD = async function(date){
    //O postgres espera uma data no formato MM/DD/YYYY
    const strDateToday = [(date.getMonth()+1).toString().padStart(2, '0'), //o getMonth tem indice 0, portanto, precisa incrementar +1 para obter o mês correto.
                            date.getDate().toString().padStart(2, '0'),
                            date.getFullYear()].join('/');
    
    let tomorrowDate = new Date(date.getTime());
    tomorrowDate.setDate(date.getDate() + 1);
    const strDateTomorrow = [(tomorrowDate.getMonth()+1).toString().padStart(2, '0'), //o getMonth tem indice 0, portanto, precisa incrementar +1 para obter o mês correto.
                                tomorrowDate.getDate().toString().padStart(2, '0'),
                                tomorrowDate.getFullYear()].join('/');

    return database.query(
        `Select
            SubString(users.name From 14 For 22 ) As USUARIO,
            To_Char(ordem_servico.data_inicio_programado, 'DD/MM/YYYY') As DATA_PROGRAMADA,
            ordem_servico_tecnico.id_usuario As ID_USUARIO,
            ordem_servico_disponibilidade.id_periodo_dia As ID_TURNO,
            periodo_dia.descricao As DESCRICAO_TURNO,
            Count(ordem_servico.data_inicio_programado::Date) As QUANTIDADE_OS,
            '40' As VAGAS
        From
            ordem_servico Inner Join
            ordem_servico_disponibilidade On ordem_servico_disponibilidade.id_ordem_servico = ordem_servico.id_ordem_servico
            Inner Join
            periodo_dia On ordem_servico_disponibilidade.id_periodo_dia = periodo_dia.id_periodo_dia Inner Join
            ordem_servico_tecnico On ordem_servico_tecnico.id_ordem_servico = ordem_servico.id_ordem_servico Inner Join
            users On ordem_servico_tecnico.id_usuario = users.id Left Join
            tipo_ordem_servico On ordem_servico.id_tipo_ordem_servico = tipo_ordem_servico.id_tipo_ordem_servico
        Where
            (ordem_servico.data_inicio_programado::Date = '${strDateToday}' Or
                ordem_servico.data_inicio_programado::Date = '${strDateTomorrow}') And
            ordem_servico_tecnico.id_usuario In (2208, 2209, 2210, 2211, 2203, 2212, 2205, 2207, 2204, 2869)
        Group By
            SubString(users.name From 14 For 22 ),
            To_Char(ordem_servico.data_inicio_programado, 'DD/MM/YYYY'),
            ordem_servico_tecnico.id_usuario,
            ordem_servico_disponibilidade.id_periodo_dia,
            periodo_dia.descricao,
            ordem_servico.data_inicio_programado::Date
        Order By
            ID_USUARIO,
            ordem_servico.data_inicio_programado::Date,
            ID_TURNO`
    );
}
exports.getOrdensServicoPainelSemModeloOSHojeEAmanha = async function(date){
    //O postgres espera uma data no formato MM/DD/YYYY
    const strDateToday = [(date.getMonth()+1).toString().padStart(2, '0'), //o getMonth tem indice 0, portanto, precisa incrementar +1 para obter o mês correto.
                            date.getDate().toString().padStart(2, '0'),
                            date.getFullYear()].join('/');
    
    let tomorrowDate = new Date(date.getTime());
    tomorrowDate.setDate(date.getDate() + 1);
    const strDateTomorrow = [(tomorrowDate.getMonth()+1).toString().padStart(2, '0'), //o getMonth tem indice 0, portanto, precisa incrementar +1 para obter o mês correto.
                                tomorrowDate.getDate().toString().padStart(2, '0'),
                                tomorrowDate.getFullYear()].join('/');

    

    return database.query(
        `With
            tecnicos As (
            Select
                usuario_setor.id_usuario,
                a_core_regiao.setor_id_primario,
                setor.descricao,
                users.name
            From
                usuario_setor Inner Join
                users On usuario_setor.id_usuario = users.id Inner Join
                a_core_regiao On a_core_regiao.setor_id = usuario_setor.id_setor Inner Join
                setor On setor.id_setor = a_core_regiao.setor_id_primario
            Where
                users.tecnico And
                users.ativo
            Group By
                usuario_setor.id_usuario,
                a_core_regiao.setor_id_primario,
                setor.descricao,
                users.name
            Order By
                usuario_setor.id_usuario,
                a_core_regiao.setor_id_primario
            )
        Select
            tecnicos.descricao As REGIAO,
            To_Char(ordem_servico.data_inicio_programado, 'DD/MM/YYYY') As DATA_PROGRAMADA,
            ordem_servico_disponibilidade.id_periodo_dia As ID_TURNO,
            periodo_dia.descricao As DESCRICAO_TURNO,
            Count(ordem_servico.data_inicio_programado::Date) As QUANTIDADE_OS,
            a_core_regiao_turno_vaga.vagas As VAGAS
        From
            ordem_servico Inner Join
            ordem_servico_disponibilidade On ordem_servico_disponibilidade.id_ordem_servico = ordem_servico.id_ordem_servico
            Inner Join
            periodo_dia On ordem_servico_disponibilidade.id_periodo_dia = periodo_dia.id_periodo_dia Inner Join
            ordem_servico_tecnico On ordem_servico_tecnico.id_ordem_servico = ordem_servico.id_ordem_servico Left Join
            tipo_ordem_servico On ordem_servico.id_tipo_ordem_servico = tipo_ordem_servico.id_tipo_ordem_servico Inner Join
            tecnicos On ordem_servico_tecnico.id_usuario = tecnicos.id_usuario Inner Join
            a_core_regiao On tecnicos.setor_id_primario = a_core_regiao.setor_id_primario Inner Join
            a_core_regiao_turno_vaga On a_core_regiao_turno_vaga.id_regiao_primaria = a_core_regiao.setor_id_primario
                    And ordem_servico_disponibilidade.id_periodo_dia = a_core_regiao_turno_vaga.id_turno
        Where
            (ordem_servico.data_inicio_programado::Date = '${strDateToday}') Or
            (ordem_servico.data_inicio_programado::Date = '${strDateTomorrow}')
        Group By
            tecnicos.descricao,
            To_Char(ordem_servico.data_inicio_programado, 'DD/MM/YYYY'),
            ordem_servico_disponibilidade.id_periodo_dia,
            periodo_dia.descricao,
            ordem_servico.data_inicio_programado::Date,
            a_core_regiao_turno_vaga.vagas
        Order By
            REGIAO,
            ordem_servico.data_inicio_programado::Date,
            ID_TURNO`
    );
}

exports.getOrdensServicoPainel = async function(_date){
    //O postgres espera uma data no formato MM/DD/YYYY
    const strDateToday = [(_date.getMonth()+1).toString().padStart(2, '0'), //o getMonth tem indice 0, portanto, precisa incrementar +1 para obter o mês correto.
    _date.getDate().toString().padStart(2, '0'),
    _date.getFullYear()].join('/');
    
    let tomorrowDate = new Date(_date.getTime());
    tomorrowDate.setDate(_date.getDate() + 1);
    const strDateTomorrow = [(tomorrowDate.getMonth()+1).toString().padStart(2, '0'), //o getMonth tem indice 0, portanto, precisa incrementar +1 para obter o mês correto.
                                tomorrowDate.getDate().toString().padStart(2, '0'),
                                tomorrowDate.getFullYear()].join('/');

    return database.query(`With
                            "05_PAINEL_OS_DATA_REGIONAL" As (
                            With
                                tecnicos As (
                                Select
                                    usuario_setor.id_usuario,
                                    a_core_regiao.setor_id_primario,
                                    setor.descricao,
                                    users.name
                                From
                                    usuario_setor Inner Join
                                    users On usuario_setor.id_usuario = users.id Inner Join
                                    a_core_regiao On a_core_regiao.setor_id = usuario_setor.id_setor Inner Join
                                    setor On setor.id_setor = a_core_regiao.setor_id_primario
                                Where
                                    users.tecnico And
                                    users.ativo
                                Group By
                                    usuario_setor.id_usuario,
                                    a_core_regiao.setor_id_primario,
                                    setor.descricao,
                                    users.name
                                Order By
                                    usuario_setor.id_usuario,
                                    a_core_regiao.setor_id_primario
                                ),
                                grupo_os As (
                                Select
                                    cg.id,
                                    cg.chave As grupo,
                                    UnNest(Array[String_To_Array(String_Agg(cg.valor, ','::VarChar), ','::VarChar)])::Int4 As
                                    id_tipo_ordem_servico
                                From
                                    a_core_config cg
                                Where
                                    cg.titulo = 'PAINEL_B' And
                                    cg.grupo_id = 1
                                Group By
                                    cg.id,
                                    cg.chave,
                                    cg.grupo_id
                                Order By
                                    grupo,
                                    id_tipo_ordem_servico
                                )
                            Select
                                ordem_servico.id_ordem_servico,
                                tecnicos.descricao As REGIAO,
                                To_Char(ordem_servico.data_inicio_programado, 'DD/MM/YYYY') As DATA_PROGRAMADA,
                                grupo_os.grupo As GRUPO_OS,
                                a_core_dia_semana.descricao,
                                a_core_regiao_dia_semana_vaga.vagas As VAGAS,
                                a_core_regiao.setor_id_primario,
                                ordem_servico.data_inicio_programado::Date As data_filtro
                            From
                                ordem_servico Inner Join
                                ordem_servico_tecnico On ordem_servico_tecnico.id_ordem_servico = ordem_servico.id_ordem_servico Inner Join
                                tecnicos On ordem_servico_tecnico.id_usuario = tecnicos.id_usuario Inner Join
                                a_core_regiao On tecnicos.setor_id_primario = a_core_regiao.setor_id_primario Inner Join
                                a_core_regiao_dia_semana_vaga On a_core_regiao_dia_semana_vaga.id_regiao_primaria =
                                        a_core_regiao.setor_id_primario Inner Join
                                a_core_dia_semana On a_core_dia_semana.id = a_core_regiao_dia_semana_vaga.id_dia_semana Inner Join
                                grupo_os On a_core_regiao_dia_semana_vaga.id_grupo_os = grupo_os.id
                                        And ordem_servico.id_tipo_ordem_servico = grupo_os.id_tipo_ordem_servico
                            Where
                                (ordem_servico.data_inicio_programado::Date = '${strDateToday}' Or
                                    ordem_servico.data_inicio_programado::Date = '${strDateTomorrow}') And
                                a_core_regiao_dia_semana_vaga.id_dia_semana = Extract(DoW From ordem_servico.data_inicio_programado)
                            Group By
                                ordem_servico.id_ordem_servico,
                                tecnicos.descricao,
                                To_Char(ordem_servico.data_inicio_programado, 'DD/MM/YYYY'),
                                grupo_os.grupo,
                                a_core_dia_semana.descricao,
                                a_core_regiao_dia_semana_vaga.vagas,
                                a_core_regiao.setor_id_primario,
                                ordem_servico.data_inicio_programado::Date,
                                a_core_regiao_dia_semana_vaga.id_dia_semana
                            Order By
                                REGIAO,
                                DATA_PROGRAMADA,
                                GRUPO_OS
                            )
                        Select
                            os.REGIAO,
                            os.DATA_PROGRAMADA,
                            os.GRUPO_OS,
                            os.descricao,
                            os.VAGAS,
                            Count(os.DATA_PROGRAMADA) As quantidade_os
                        From
                            "05_PAINEL_OS_DATA_REGIONAL" os
                        Group By
                            os.REGIAO,
                            os.DATA_PROGRAMADA,
                            os.GRUPO_OS,
                            os.descricao,
                            os.VAGAS`);
                            
}