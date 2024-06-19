
async function organizaTurmasSelecionadasPorAtividade() {
    const tabelaSelecaoTurmas = document.getElementById("TabelaSelecaoTurmas");
    const codigosCadeiras = await obtemCodigosCadeiras();
    const tabelaCoresAtividades = await constroiTabelaCores();

    const arrayInfoTurmas = [...tabelaSelecaoTurmas.rows].slice(1)
        .filter(row => row.cells[0].firstChild.checked)
        .map(turma => {
            const horarioCell = turma.cells[5];
            const [ , AtividadeDeEnsino, , Turma, VagasOferecidas] = [...turma.cells].map(cell => cell.textContent.trim());
            const horarioCodificado = parseHorarioTurma(horarioCell);
            const stringTurma = codigosCadeiras[AtividadeDeEnsino] + " - " + Turma + " - " + VagasOferecidas
            return [AtividadeDeEnsino, stringTurma, horarioCodificado, tabelaCoresAtividades[codigosCadeiras[AtividadeDeEnsino]]];
        });


    var turmasPorAtividade = [];
    for (var tripla of arrayInfoTurmas) {

        var aLength = turmasPorAtividade.length;

        if (aLength == 0 || tripla[0] != turmasPorAtividade[aLength - 1][0][0]) {
            turmasPorAtividade.push([tripla]);
        } else {
            turmasPorAtividade[aLength - 1].push(tripla);
        }
    }

    alertaUsuarioProblemasSelecao(turmasPorAtividade.length);

    return turmasPorAtividade;
}


function alertaUsuarioProblemasSelecao(qtdCadeirasTurmasSelecionadas) {
    
    var qtdCadeirasSelecionadas = document.getElementById("AtivEnsinoSelecionadas").children.length;
    var qtdCadeirasDisponiveis = obtemQuantidadeCadeirasDisponiveis();
    
    if (qtdCadeirasSelecionadas > qtdCadeirasDisponiveis) {
        alert("Pelo menos uma das atividades selecionadas não tem turmas disponíveis neste semestre.");
    }
    
    if (qtdCadeirasDisponiveis > qtdCadeirasTurmasSelecionadas) {
        alert("Existe pelo menos uma atividade com turmas disponíveis que não teve nenhuma turma selecionada. As grades serão geradas, mas tenha isso em mente.");
    }
}


function obtemQuantidadeCadeirasDisponiveis() {
    const tabelaSelecaoTurmas = document.getElementById("TabelaSelecaoTurmas");
    const listaAtividadesDeEnsino = [];

    for (let i = 1; i < tabelaSelecaoTurmas.rows.length; i++) {

        const AtividadeDeEnsino = tabelaSelecaoTurmas.rows[i].cells[1].textContent.trim();
        if (listaAtividadesDeEnsino.length === 0 || AtividadeDeEnsino !== listaAtividadesDeEnsino[listaAtividadesDeEnsino.length - 1]) {
            listaAtividadesDeEnsino.push(AtividadeDeEnsino);
        }
    }

    return listaAtividadesDeEnsino.length;
}



async function constroiTabelaCores() {

    var responseData = await cachedRequestMontaGrade();

    var tempResponse = document.createElement('div');
    tempResponse.innerHTML = responseData;
    var fieldsetCodigosCadeiras = tempResponse.getElementsByTagName("fieldset")[0];

    var labelsCodigosCadeiras = fieldsetCodigosCadeiras.getElementsByTagName("label");

    var mapeamentoCores = {};

    for (var label of labelsCodigosCadeiras) {
        var codAtividade = label.textContent.split(' - ')[0];
        mapeamentoCores[codAtividade] = label.style.color;
    }

    return mapeamentoCores;
}

function parseHorarioTurma(celulaHorarios) {

    var HorariosCodificados = new Uint16Array(6);

    for (var child of celulaHorarios.children) {
                
        var toBeParsed = child.innerHTML.split("<br>", 1)[0];

        const toBeParsedSplit = toBeParsed.trim().split(" ");
        // tem que considerar que alem de "Quinta 13:30 - 15:10 (2)",
        // tambem podem aparecer no formato "N.I.".
        // Nesse segundo caso, toBeParsedSplit.length será != 5,
        // e portanto HorariosCodificados não será modificado.

        if (toBeParsedSplit.length == 5) {
            const [Dia, HorarioInicio, , , NumeroPeriodos] = toBeParsedSplit;
            
            HorariosCodificados = codificaUmHorario(Dia, HorarioInicio, NumeroPeriodos, HorariosCodificados);
        }
    }

    return HorariosCodificados;
}

function codificaUmHorario(Dia, HorarioInicio, NumeroPeriodos, arrayHorariosCodificados) {
    
    var indexDia;
    var valHorario;
    var quantHorarios;

    switch (Dia) {
        case "Segunda": indexDia = 0; break;
        case "Terça":   indexDia = 1; break;
        case "Quarta":  indexDia = 2; break;
        case "Quinta":  indexDia = 3; break;
        case "Sexta":   indexDia = 4; break;
        default:        indexDia = 5;
    }

    valHorario = parseInt(HorarioInicio.split(":")[0], 10) - 7;

    quantHorarios = parseInt(NumeroPeriodos.replace(/[()]/g, ''), 10);

    for (let i=0; i<quantHorarios; i++) {
        arrayHorariosCodificados[indexDia] |= Math.pow(2, (valHorario + i));
    }

    return arrayHorariosCodificados;
}

function createCachedRequestMontaGrade() {
    
    let cache = null;
    let requestDataAntigo = null;
  
    return async function() {
    
    	var cadeirasSelecionadas = Array.from(document.getElementById("AtivEnsinoSelecionadas").options);
        var codigosCadeirasSelecionadas = cadeirasSelecionadas.map(item => {
            return item.value.split(",")[1].trim();
        });

        var sGrupoMatricula = document.getElementById("GrupoMatricula").value
        var iPeriodoLetivo = document.getElementById("PeriodoLetivo").value


        let requestData = new URLSearchParams();
        requestData.append("GradeUnica", 1);
        requestData.append("PeriodoLetivo", iPeriodoLetivo);
        requestData.append("GrupoMatricula", sGrupoMatricula);

        for (var atividade of codigosCadeirasSelecionadas) {
            requestData.append('Atividades[]', atividade);
        }

        if (!cache || requestData.toString() !== requestDataAntigo.toString()) {

            cache = await requestMontaGrade(requestData);

            requestDataAntigo = requestData;
        }
        
        return cache;
    };
}

function requestMontaGrade(requestData) {

    return fetch("/PortalEnsino/GradeHorarios/index.php?r=grade/montaGrade", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: requestData
    })
    .then(response => response.arrayBuffer())
    .then(buffer => {
        let decoder = new TextDecoder("iso-8859-1");
        let text = decoder.decode(buffer);
        return text;
    });
}


const cachedRequestMontaGrade = createCachedRequestMontaGrade();


async function obtemCodigosCadeiras() {
    
    var arrayCodigosNomesCadeiras = {};

    var responseData = await cachedRequestMontaGrade();

    var tempResponse = document.createElement('div');
    tempResponse.innerHTML = responseData;
    var fieldsetCodigosCadeiras = tempResponse.getElementsByTagName("fieldset")[0];

    var labelsCodigosCadeiras = fieldsetCodigosCadeiras.getElementsByTagName("label");

    for (var label of labelsCodigosCadeiras) {   
        var i = label.textContent.indexOf(' - ');
        arrayCodigosNomesCadeiras[label.textContent.slice(i+3)] = label.textContent.slice(0,i);
    }

    return arrayCodigosNomesCadeiras;
}
