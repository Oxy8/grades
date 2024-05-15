//======================================//

var observerDivAtividades = new MutationObserver(
  
    function(records, observer) {
      
        var totalAdded = 0;
        var totalRemoved = 0;

        for (const record of records) {
            totalAdded += record.addedNodes.length;
            totalRemoved += record.removedNodes.length;
        }

        if (totalRemoved == 5) {
            // o que exatamente significa esse caso aqui?
            // Sob quais circunstâncias mais especificamente
            // a página decide remover elementos, além de quando
            // um novo curso é selecionado?

            // removeBotaoMostrarTurmas();
            // /\ inútil, mas deixa aqui caso a estrutura mude.

            console.log("Removed:" + totalRemoved)
        } 

        if (totalAdded == 5) {
            removeBotoesOriginais();
            insereBotaoMostrarTurmas();
            console.log("Added:" + totalAdded)
        }
    }
)

const divAtividades = document.getElementById("divAtividades");
observerDivAtividades.observe(divAtividades, { 
    childList: true,
    attributes: false,
    characterData: false,
    subtree: false
});

//======================================//

//======================================//

function removeBotoesOriginais() {
    let tabela = divAtividades.getElementsByTagName("table")[0];
    tabela.deleteRow(-1);
}

function insereBotaoMostrarTurmas() {

    let tabela = divAtividades.getElementsByTagName("table")[0];

    let rowBotaoSelecionaTurmas = tabela.insertRow(4);
    let cellBotaoSelecionaTurmas = rowBotaoSelecionaTurmas.insertCell(0);
    cellBotaoSelecionaTurmas.colSpan = 3;

    const botaoSelecionaTurmas = document.createElement('input');
    botaoSelecionaTurmas.className = "button";
    botaoSelecionaTurmas.type = "button";
    botaoSelecionaTurmas.value = "Mostrar turmas diponíveis";

    botaoSelecionaTurmas.addEventListener("click", MostraTabelaTurmasDisponiveis);
    
    const paragBotaoSelecionaTurmas = document.createElement('p');
    paragBotaoSelecionaTurmas.setAttribute('style', 'padding: 20px;');
    paragBotaoSelecionaTurmas.className = "paragBotoes";
    paragBotaoSelecionaTurmas.appendChild(botaoSelecionaTurmas);
    cellBotaoSelecionaTurmas.appendChild(paragBotaoSelecionaTurmas);
}

function MostraTabelaTurmasDisponiveis() {
    
    let tabelaAtividades = divAtividades.getElementsByTagName("table")[0];

    // Remove botões/tabela caso estes ja tenham sido inseridos previamente.
    while (tabelaAtividades.rows.length > 5) {
        tabelaAtividades.deleteRow(-1);
    }

    var quantidadeCadeirasSelecionadas = document.getElementById( "AtivEnsinoSelecionadas" ).options.length;

    if (quantidadeCadeirasSelecionadas > 30) {
        alert("Você pode selecionar no máximo 30 Atividades de Ensino");
        return;
    }
    else if (quantidadeCadeirasSelecionadas == 0) {
        alert("Você deve selecionar no mínimo uma Atividade de Ensino");
        return;
    }

    let rowTabelaTurmas = tabelaAtividades.insertRow(5);
    let cellTabelaTurmas = rowTabelaTurmas.insertCell(0);
    cellTabelaTurmas.style.width = "100%";
    cellTabelaTurmas.colSpan = 3;

    var tabelaSelecaoTurmas = ObtemTabelaTurmasDisponiveis();
    cellTabelaTurmas.appendChild(tabelaSelecaoTurmas);

    InsereBotoesMostraGrades();

}

function ObtemTabelaTurmasDisponiveis() {
    
    var tabelaSelecaoTurmas = document.createElement("table");
    tabelaSelecaoTurmas.id = "TabelaSelecaoTurmas";

    //=========================================================================
    var curriculoSelectVal = document.getElementById( "Curriculo" ).value;
    const [CodCur, CodHab] = curriculoSelectVal.split("/").map(item => item.trim());

    var cadeirasSelecionadas = Array.from(document.getElementById( "AtivEnsinoSelecionadas" ).options);
    var codigosCadeirasSelecionadas = cadeirasSelecionadas.map(item => {
        return item.value.split(",")[1].trim();
    });

    var Semestre = document.getElementById( "PeriodoLetivo" ).value;
    //-------------------------------------------------------------------------

    for (var CodAtiv of codigosCadeirasSelecionadas) {
        $.get('/PortalEnsino/GraduacaoAluno/view/HorarioAtividade.php', {
            CodAtiv: CodAtiv,
            CodHab: CodHab,
            CodCur: CodCur,
            Sem: Semestre
        }, data => {

            // data contem a tabela com listagem de todas turmas para uma determinada atividade.
            
            // Aqui tem que ser feito o tratamento de a cadeira não possuir nenhuma turma disponível.
            // Senão, tentar acessar rows gera um erro.
            
            var tableElement = pegaTabelaTurma(data);

            for (var row of tableElement.rows) {

                var rowCopy = row.cloneNode(true);

                var celulaBotao = rowCopy.insertCell(0);
                celulaBotao.setAttribute("align", "center");
                celulaBotao.setAttribute('valign', 'middle');
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';       
                celulaBotao.appendChild(checkbox);

                rowCopy.className = "modelo1";

                tabelaSelecaoTurmas.appendChild(rowCopy);
            }
        });
    }

    var titulo = obtemTituloTabelaTurmas();
    tabelaSelecaoTurmas.insertBefore(titulo, tabelaSelecaoTurmas.firstChild);
    
    return tabelaSelecaoTurmas;
}

function obtemTituloTabelaTurmas() {
    
    var newRow = document.createElement("tr");
    newRow.setAttribute("valign", "middle");

    var cell0 = document.createElement("td");
    cell0.className = "th1";
    cell0.setAttribute("align", "center");
    cell0.setAttribute("width", "7%");
    cell0.textContent = "Incluir";
    newRow.appendChild(cell0);

    var cell1 = document.createElement("td");
    cell1.className = "th1";
    cell1.setAttribute("align", "center");
    cell1.setAttribute("width", "28%");
    cell1.textContent = "Atividade de Ensino";
    newRow.appendChild(cell1);

    var cell2 = document.createElement("td");
    cell2.className = "th1";
    cell2.setAttribute("align", "center");
    cell2.innerHTML = "Carga Horária";
    newRow.appendChild(cell2);

    var cell3 = document.createElement("td");
    cell3.className = "th1";
    cell3.setAttribute("align", "center");
    cell3.textContent = "Turma";
    newRow.appendChild(cell3);

    var cell4 = document.createElement("td");
    cell4.className = "th1";
    cell4.setAttribute("align", "center");
    cell4.textContent = "Vagas Oferecidas";
    newRow.appendChild(cell4);

    var cell5 = document.createElement("td");
    cell5.className = "th1";
    cell5.setAttribute("align", "center");
    cell5.setAttribute("width", "25%");
    cell5.textContent = "Horário-Período-Local";
    newRow.appendChild(cell5);

    var cell6 = document.createElement("td");
    cell6.className = "th1";
    cell6.setAttribute("align", "center");
    cell5.setAttribute("width", "33%");
    cell6.textContent = "Professor(es)";
    newRow.appendChild(cell6);

    return newRow;
}


function pegaTabelaTurma(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    var tableElement = div.getElementsByTagName('table')[0];

    if (tableElement != undefined) {
        tableElement.deleteRow(0);
    }

    return tableElement;
}


function InsereBotoesMostraGrades() {

    let tabela = divAtividades.getElementsByTagName("table")[0];

    let rowBotoesMostraGrades = tabela.insertRow(6);
    let cellBotoesGrades = rowBotoesMostraGrades.insertCell(0);
    cellBotoesGrades.colSpan = 3;

    const botaoGrades = document.createElement('input');
    
    botaoGrades.className = "button";
    botaoGrades.type = "button";
    botaoGrades.value = "Mostrar Grades de Horários";

    const botaoGradeUnica = document.createElement('input');
    botaoGradeUnica.className = "button";
    botaoGradeUnica.type = "button";
    botaoGradeUnica.value = "Mostrar Grade Única de Horários";

    botaoGrades.addEventListener("click", mostraGrades);
    botaoGradeUnica.addEventListener("click", mostraGradeUnica);
    
    const paragBotoesGrades = document.createElement('p');
    paragBotoesGrades.setAttribute('style', 'padding: 20px;');
    paragBotoesGrades.className = "paragBotoes";
    paragBotoesGrades.appendChild(botaoGrades);
    paragBotoesGrades.appendChild(botaoGradeUnica);
    cellBotoesGrades.appendChild(paragBotoesGrades);

    /*
    divAtividades.setAttribute("BotoesGrades", "true");
    */
}

async function mostraGradeUnica() {

    var arrayInfoTurmas = await obtemArrayTurmasPorAtividade();

    // chamada aqui com turmasPorAtividade para enfim, iterar cada uma das
    // cadeira, e tentar montar tabelas.

    // Monta array com todas possíveis combinações que não dão conflito
    // (2 for loops e um verificador de conflitos no fim pra decidir se add
    // na array ou não).
    // (tem que adicionar um limite de tamanho tambem pra nao explodir a memoria)

    // Depois pega cada um dos itens e processa em uma tabela, joga essa tabela no fim da página.
    

}

async function mostraGrades() {

    var turmasOrganizadasPorAtividade = await obtemArrayTurmasPorAtividade();
    var quantAtividades = turmasOrganizadasPorAtividade.length;

    const indicesMaximosControle = new Array(quantAtividades).fill(0);
    for (i=0; i<quantAtividades; i++) {
        indicesMaximosControle[i] = turmasOrganizadasPorAtividade[i].length;
    }

    var indicesTurmaPorAtividade = new Array(quantAtividades).fill(0);

    //===================================================================

    var conjuntoArraysTurmasSemConflito = [];

    var fim_do_loop = false;
    proximo_set: while (fim_do_loop == false) {


        var arrayTurmasSemConflito = [];

        var verificaConflitos = new Uint16Array(6);
        
        for (i=0; i<quantAtividades; i++) {

            var horarioCodificado = turmasOrganizadasPorAtividade[i][indicesTurmaPorAtividade[i]][2];


            var conflito = verificaConflitoHorarioCodificado(verificaConflitos, horarioCodificado);

            if (conflito) {
                fim_do_loop = tentaIncrementarIndice(indicesMaximosControle, indicesTurmaPorAtividade, i);
                // Tenta incrementar índica na posição atual, zerando as restantes.                
                // Seta indicesTurmaPorAtividade como -1 no caso de se ter esgotado todos indices;

                continue proximo_set;

            } else {
                uniaoHorariosCodificados(verificaConflitos, horarioCodificado);

                arrayTurmasSemConflito.push(turmasOrganizadasPorAtividade[i][indicesTurmaPorAtividade[i]]);
            }
        }

        // Tenta incrementar o índice da última atividade, cuidando por um possível overflow.
        fim_do_loop = tentaIncrementarIndice(indicesMaximosControle, indicesTurmaPorAtividade, quantAtividades-1);

        conjuntoArraysTurmasSemConflito.push(arrayTurmasSemConflito);
    }

    console.log("################");
    console.log(conjuntoArraysTurmasSemConflito);
}

function tentaIncrementarIndice(indicesMaximosControle, indicesTurmaPorAtividade, indice) {
    if (indice == -1) {
        return true; // retorna erro aqui.
    }
    
    indicesTurmaPorAtividade[indice] += 1;
    if (indicesTurmaPorAtividade[indice] >= indicesMaximosControle[indice]) {
        zeraDoIndiceAoFim(indicesTurmaPorAtividade, indice);
        return tentaIncrementarIndice(indicesMaximosControle, indicesTurmaPorAtividade, indice-1);
    }

    return false;
}

function zeraDoIndiceAoFim(array, indice) {
    for (k=indice; k < array.length; k++) {
        array[k] = 0;
    }
}

function uniaoHorariosCodificados(horario1, horario2) {

    for (j=0; j<horario1.length; j++) {
        horario1[j] |= horario2[j];
    }
}

function verificaConflitoHorarioCodificado(horario1, horario2) {
 
    var diaHorario1;

    for (j=0; j<horario1.length; j++) {
        
        diaHorario1 = horario1[j]; // Necessario para evitar modificar array original.
        diaHorario1 &= horario2[j];
        if (diaHorario1 != 0) {
            return true; // Houve conflito.
        }
    }

    /*
    console.log("horario1");
    console.log(horario1);
    console.log("---");
    */

    return false; // Não houve conflito.
}

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

    var tabelaSelecaoTurmas = document.getElementById("AtivEnsinoSelecionadas");
    if (tabelaSelecaoTurmas.children.length > turmasPorAtividade.length) {
        alert("Existe pelo menos uma atividade para a qual não foi designada nenhuma turma. A grade será gerada, mas tenha isso em mente.");
    }

    return turmasPorAtividade;
}


async function constroiArrayInfoTurmas() {

    var arrayInfoTurmas = [];

    var tabelaSelecaoTurmas = document.getElementById("TabelaSelecaoTurmas");

    var codigosCadeiras = await obtemCodigosCadeiras();

    for (var i = 1; i < tabelaSelecaoTurmas.rows.length; i++) {
        var celulaCheckbox = tabelaSelecaoTurmas.rows[i].cells[0];

        if (celulaCheckbox.firstChild.checked) {
            var celulaHorarios = tabelaSelecaoTurmas.rows[i].cells[5];
            var horarioCodificado = parseHorarioTurma(celulaHorarios);

            var AtividadeDeEnsino = tabelaSelecaoTurmas.rows[i].cells[1].textContent.trim();
            var Turma = tabelaSelecaoTurmas.rows[i].cells[3].textContent.trim();
            var VagasOferecidas = tabelaSelecaoTurmas.rows[i].cells[4].textContent.trim();

            var stringTurma = geraStringTurma(codigosCadeiras, AtividadeDeEnsino, Turma, VagasOferecidas);

            arrayInfoTurmas.push([AtividadeDeEnsino, stringTurma, horarioCodificado]);
        }
    }

    return arrayInfoTurmas;
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
        case "Segunda":
            indexDia = 0;
            break;
        case "Terça":
            indexDia = 1;
            break;
        case "Quarta":
            indexDia = 2;
            break;
        case "Quinta":
            indexDia = 3;
            break;
        case "Sexta":
            indexDia = 4;
            break;
        default:          // Sábado
            indexDia = 5;    
    }

    valHorario = parseInt(HorarioInicio.split(":")[0], 10) - 7;

    quantHorarios = parseInt(NumeroPeriodos.replace(/[()]/g, ''), 10);

    for (i=0; i<quantHorarios; i++) {
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

function obtemCodigosCadeiras() {
    return new Promise((resolve) => {  // Tentar mover mais para baixo no corpo da func mais tarde.

        var cadeirasSelecionadas = Array.from(document.getElementById("AtivEnsinoSelecionadas").options);
        var codigosCadeirasSelecionadas = cadeirasSelecionadas.map(item => {
            return item.value.split(",")[1].trim();
        });

        var sGrupoMatricula = $('#GrupoMatricula').val();
        var iPeriodoLetivo = $('#PeriodoLetivo').val();

        if ((iPeriodoLetivo != '') && (sGrupoMatricula != '')) {
            var aDados = {
                GradeUnica: 1,
                PeriodoLetivo: iPeriodoLetivo,
                GrupoMatricula: sGrupoMatricula,
                'Atividades[]': codigosCadeirasSelecionadas
            };

            $.post('/PortalEnsino/GradeHorarios/index.php?r=grade/montaGrade', aDados, function(responseData) {
                var arrayCodigosNomesCadeiras = [];

                var tempResponse = document.createElement('div');
                tempResponse.innerHTML = responseData;
                var fieldsetCodigosCadeiras = tempResponse.getElementsByTagName("fieldset")[0].getElementsByTagName("label");

                for (var codigo of fieldsetCodigosCadeiras) {
                    var i = codigo.textContent.indexOf(' - ');
                    var splits = [codigo.textContent.slice(0,i), codigo.textContent.slice(i+3)];
                    arrayCodigosNomesCadeiras.push(splits);
                }

                resolve(arrayCodigosNomesCadeiras);
            });
        }
    });
}
