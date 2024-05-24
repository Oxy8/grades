
// Melhorar nome dessas funções, algo tipo:
// organizaTurmasSelecionadasPorAtividade()
async function obtemArrayTurmasPorAtividade() {
    
    var arrayInfoTurmas = await constroiArrayInfoTurmas();

    var turmasPorAtividade = [];

    for (var tripla of arrayInfoTurmas) {

        var aLength = turmasPorAtividade.length;

        if (aLength == 0 || tripla[0] != turmasPorAtividade[aLength - 1][0][0]) {
            turmasPorAtividade.push([tripla]);
        } else {
            turmasPorAtividade[aLength - 1].push(tripla);
        }
    }

    var qtdCadeirasSelecionadas = document.getElementById("AtivEnsinoSelecionadas").children.length;
    var qtdCadeirasDisponiveis = obtemQuantidadeCadeirasDisponiveis();
    var qtdCadeirasTurmasSelecionadas = turmasPorAtividade.length;
    
    if (qtdCadeirasSelecionadas > qtdCadeirasDisponiveis) {
        alert("Pelo menos uma das atividades selecionadas não tem turmas disponíveis neste semestre.");
    }
    
    if (qtdCadeirasDisponiveis > qtdCadeirasTurmasSelecionadas) {
        alert("Existe pelo menos uma atividade com turmas disponíveis que não teve nenhuma turma selecionada. A grade será gerada, mas tenha isso em mente.");
    }

    return turmasPorAtividade;
}

function obtemQuantidadeCadeirasDisponiveis() {

    var tabelaSelecaoTurmas = document.getElementById("TabelaSelecaoTurmas");

    var listaAtividadesDeEnsino = []

    for (let i = 1; i < tabelaSelecaoTurmas.rows.length; i++) {
        var celulaCheckbox = tabelaSelecaoTurmas.rows[i].cells[0];

        var listaLength = listaAtividadesDeEnsino.length

        var AtividadeDeEnsino = tabelaSelecaoTurmas.rows[i].cells[1].textContent.trim();

        if (listaLength == 0 || AtividadeDeEnsino != listaAtividadesDeEnsino[listaLength - 1]) {
            listaAtividadesDeEnsino.push(AtividadeDeEnsino);
        }
    
    }

    return listaAtividadesDeEnsino.length;
}


async function constroiArrayInfoTurmas() {

    var arrayInfoTurmas = [];

    var tabelaSelecaoTurmas = document.getElementById("TabelaSelecaoTurmas");

    var codigosCadeiras = await obtemCodigosCadeiras();

    var tabelaCoresAtividades = await constroiTabelaCores();

    for (let i = 1; i < tabelaSelecaoTurmas.rows.length; i++) {
        var celulaCheckbox = tabelaSelecaoTurmas.rows[i].cells[0];

        if (celulaCheckbox.firstChild.checked) {
            
            var celulaHorarios = tabelaSelecaoTurmas.rows[i].cells[5];
            var horarioCodificado = parseHorarioTurma(celulaHorarios); //==//

            var AtividadeDeEnsino = tabelaSelecaoTurmas.rows[i].cells[1].textContent.trim(); //==//
            var Turma = tabelaSelecaoTurmas.rows[i].cells[3].textContent.trim();
            var VagasOferecidas = tabelaSelecaoTurmas.rows[i].cells[4].textContent.trim();

            var stringTurma = geraStringTurma(codigosCadeiras, AtividadeDeEnsino, Turma, VagasOferecidas); //==//

            var Cor = tabelaCoresAtividades[AtividadeDeEnsino]; //==//

            arrayInfoTurmas.push([AtividadeDeEnsino, stringTurma, horarioCodificado, Cor]);
        }
    }

    return arrayInfoTurmas;
}

async function constroiTabelaCores() {

    var responseData = await cachedRequestMontaGrade();

    var tempResponse = document.createElement('div');
    tempResponse.innerHTML = responseData;
    var fieldsetCodigosCadeiras = tempResponse.getElementsByTagName("fieldset")[0];

    var labelsCodigosCadeiras = fieldsetCodigosCadeiras.getElementsByTagName("label");

    var mapeamentoCores = {};

    for (var label of labelsCodigosCadeiras) {   
        var i = label.textContent.indexOf(' - ');
        var nomeAtividade = label.textContent.slice(i+3);
        mapeamentoCores[nomeAtividade] = label.style.color;
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

function geraStringTurma(relacaoCodigosCadeiras, AtividadeDeEnsino, Turma, VagasOferecidas) {

    for (var pair of relacaoCodigosCadeiras) {
        
        let [CodigoD, NomeD] = pair;

        if (NomeD.trim() == AtividadeDeEnsino) {
            return (CodigoD + " - " + Turma + " - " + VagasOferecidas);
        }
    }
}


function createCachedRequestMontaGrade() {
    
    let cache = null;
    let aDadosAntigo = null;
  
    return async function() {
    
    	var cadeirasSelecionadas = Array.from(document.getElementById("AtivEnsinoSelecionadas").options);
        var codigosCadeirasSelecionadas = cadeirasSelecionadas.map(item => {
            return item.value.split(",")[1].trim();
        });

        var sGrupoMatricula = $('#GrupoMatricula').val();
        var iPeriodoLetivo = $('#PeriodoLetivo').val();

        const aDados = {
            GradeUnica: 1,
            PeriodoLetivo: iPeriodoLetivo,
            GrupoMatricula: sGrupoMatricula,
            'Atividades[]': codigosCadeirasSelecionadas
        };

        if (!cache || JSON.stringify(aDados) !== JSON.stringify(aDadosAntigo)) {
            
            console.log("Cache miss");

            cache = await requestMontaGrade(aDados);
            aDadosAntigo = aDados;
        }
        
        return cache;
    };
}


function requestMontaGrade(aDados) {
    return new Promise((resolve) => {
	$.post('/PortalEnsino/GradeHorarios/index.php?r=grade/montaGrade', aDados, function(responseData) {
            resolve(responseData);
        });
    });
}

const cachedRequestMontaGrade = createCachedRequestMontaGrade();


async function obtemCodigosCadeiras() {
    
    var arrayCodigosNomesCadeiras = [];

    var responseData = await cachedRequestMontaGrade();

    var tempResponse = document.createElement('div');
    tempResponse.innerHTML = responseData;
    var fieldsetCodigosCadeiras = tempResponse.getElementsByTagName("fieldset")[0];

    var labelsCodigosCadeiras = fieldsetCodigosCadeiras.getElementsByTagName("label");

    for (var label of labelsCodigosCadeiras) {   
        var i = label.textContent.indexOf(' - ');
        var splits = [label.textContent.slice(0,i), label.textContent.slice(i+3)];
        arrayCodigosNomesCadeiras.push(splits);
    }

    return arrayCodigosNomesCadeiras;
}
