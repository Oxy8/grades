// import { mostraGrades, mostraGradeUnica } from './grades.js';

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

            //console.log("Removed:" + totalRemoved)
        } 

        if (totalAdded == 5) {
            removeBotoesOriginais();
            insereBotaoMostrarTurmas();
            //console.log("Added:" + totalAdded)
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

async function MostraTabelaTurmasDisponiveis() {

    removeGradesHorarias();

    var tabelaSelecaoTurmas = document.getElementById("TabelaSelecaoTurmas");
    
    var qtdCadeirasSelecionadas = document.getElementById( "AtivEnsinoSelecionadas" ).options.length;

    if (qtdCadeirasSelecionadas > 30) {
        escondeTurmasEBotoesGrades(tabelaSelecaoTurmas);
        alert("Você pode selecionar no máximo 30 Atividades de Ensino");
        return;
    }
    else if (qtdCadeirasSelecionadas == 0) {
        escondeTurmasEBotoesGrades(tabelaSelecaoTurmas);
        alert("Você deve selecionar no mínimo uma Atividade de Ensino");
        return;
    }

    if (!tabelaSelecaoTurmas) { // Se tabelaSelecaoTurmas não existir.
        var tabelaSelecaoTurmas = document.createElement("table");
        tabelaSelecaoTurmas.id = "TabelaSelecaoTurmas";

        var titulo = await obtemTituloTabelaTurmas();
        tabelaSelecaoTurmas.appendChild(titulo);

        let tabelaAtividades = divAtividades.getElementsByTagName("table")[0];
        let rowTabelaTurmas = tabelaAtividades.insertRow(5);
        let cellTabelaTurmas = rowTabelaTurmas.insertCell(0);
        cellTabelaTurmas.style.width = "100%";
        cellTabelaTurmas.colSpan = 3;
        cellTabelaTurmas.appendChild(tabelaSelecaoTurmas);

        insereBotoesMostraGrades();
    }

    await atualizaTabelaTurmasDisponiveis(tabelaSelecaoTurmas);
    
    var qtdCadeirasDisponiveis = obtemQuantidadeCadeirasDisponiveis();

    if (qtdCadeirasDisponiveis == 0) {
        escondeTurmasEBotoesGrades(tabelaSelecaoTurmas);

        // setTimeout é uma forma simples de permitir a atualização do DOM antes de chamar alert()
        setTimeout(function() {
            alert("Nenhuma das atividades selecionadas possui turmas disponíveis neste semestre.");
        }, 50);

    } else {
        mostraTurmasEBotoesGrades(tabelaSelecaoTurmas);

        if (qtdCadeirasSelecionadas > qtdCadeirasDisponiveis) {
            // setTimeout é uma forma simples de permitir a atualização do DOM antes de chamar alert()
            setTimeout(function() {
                alert("Pelo menos uma das atividades selecionadas não tem turmas disponíveis neste semestre.");
            }, 50);
        }
    }    
}

function escondeTurmasEBotoesGrades(tabelaSelecaoTurmas) {
    
    if (tabelaSelecaoTurmas) {
        tabelaSelecaoTurmas.style.display = "none";
    }
        
    var rowBotoesMostraGrades = document.getElementById("rowBotoesMostraGrades");
    if (rowBotoesMostraGrades) {
        removeBotoesMostraGrades();
    }
}

function mostraTurmasEBotoesGrades(tabelaSelecaoTurmas) {
    
    if (tabelaSelecaoTurmas) {
        tabelaSelecaoTurmas.style.display = "inline-block";
    }
        
    var rowBotoesMostraGrades = document.getElementById("rowBotoesMostraGrades");
    if (!rowBotoesMostraGrades) {
        insereBotoesMostraGrades();
    }
}

function removeBotoesMostraGrades() {
    
    var rowBotoesMostraGrades = document.getElementById("rowBotoesMostraGrades");
    rowBotoesMostraGrades.remove();
}

async function atualizaTabelaTurmasDisponiveis(tabelaSelecaoTurmas) {
    return new Promise(async (resolve) => {

        var cadeirasSelecionadas = Array.from(document.getElementById( "AtivEnsinoSelecionadas" ).options);
        var identificadoresCadeirasSelecionadas = cadeirasSelecionadas.map(item => {
            return item.value.split(",")[1].trim();
        });

        var identificadoresCadeirasJaInseridas = obtemIdentificadoresAtividades(tabelaSelecaoTurmas);
        var identificadoresVelhos = subtraiArrays(identificadoresCadeirasJaInseridas, identificadoresCadeirasSelecionadas);
        var identificadoresNovos = subtraiArrays(identificadoresCadeirasSelecionadas, identificadoresCadeirasJaInseridas);

        await removeAtividadesVelhas(tabelaSelecaoTurmas, identificadoresVelhos);

        await insereAtividadesNovas(tabelaSelecaoTurmas, identificadoresNovos);

        resolve();
    });
}

function obtemIdentificadoresAtividades(tabelaSelecaoTurmas) {
    var arrayIdentificadoresAtividades = [];
    
    for (var row of tabelaSelecaoTurmas.rows) {

        // Pula o titulo;
        if (row === tabelaSelecaoTurmas.rows[0]) {
            continue;
        }

        let identificador = row.getAttribute("atividade");

        if (!arrayIdentificadoresAtividades.includes(identificador)) {
            arrayIdentificadoresAtividades.push(identificador);
        }

    }

    return arrayIdentificadoresAtividades;
}

function subtraiArrays(array1, array2) {
    return array1.filter(element => !array2.includes(element));
}

function removeAtividadesVelhas(tabelaSelecaoTurmas, identificadoresVelhos) {
    
    return new Promise(async (resolve) => {
        var linhasTabela = tabelaSelecaoTurmas.rows;

        for (let i = 1; i < linhasTabela.length;) {
            if ( identificadoresVelhos.includes(linhasTabela[i].getAttribute("atividade")) ) {
                tabelaSelecaoTurmas.deleteRow(i);
            } else {
                i += 1;
            }
        }

        resolve();
    });

}


async function insereAtividadesNovas(tabelaSelecaoTurmas, identificadoresNovos) {
    var curriculoSelectVal = document.getElementById("Curriculo").value;
    const [CodCur, CodHab] = curriculoSelectVal.split("/").map(item => item.trim());
    var Semestre = document.getElementById("PeriodoLetivo").value;

    let fragmentGeral = new DocumentFragment();

    const requests = identificadoresNovos.map(identificador => {
        return fetch(`/PortalEnsino/GraduacaoAluno/view/HorarioAtividade.php?CodAtiv=${identificador}&CodHab=${CodHab}&CodCur=${CodCur}&Sem=${Semestre}`)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                let decoder = new TextDecoder("iso-8859-1");
                let text = decoder.decode(buffer);
                return text;
            })
            .then(paginaTurmasAtividade => {
                var tableElement = pegaTabelaTurmas(paginaTurmasAtividade);

                if (tableElement) {
                    let fragmentCadeira = new DocumentFragment();

                    for (var row of tableElement.rows) {
                        var rowCopy = row.cloneNode(true);

                        var celulaBotao = rowCopy.insertCell(0);
                        celulaBotao.setAttribute("align", "center");
                        celulaBotao.setAttribute('valign', 'middle');
                        var checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        celulaBotao.appendChild(checkbox);

                        rowCopy.className = "modelo1";
                        rowCopy.setAttribute("atividade", identificador);

                        fragmentCadeira.appendChild(rowCopy);
                    }

                    fragmentGeral.appendChild(fragmentCadeira);
                }
            });
    });

    await Promise.all(requests);

    tabelaSelecaoTurmas.appendChild(fragmentGeral);

    return tabelaSelecaoTurmas;
}


function obtemTituloTabelaTurmas() {
    return new Promise((resolve) => {
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
        cell6.setAttribute("width", "25%");
        cell6.textContent = "Professor(es)";
        newRow.appendChild(cell6);

        resolve(newRow);
    });
}


function pegaTabelaTurmas(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    var tableElement = div.getElementsByTagName('table')[0];

    if (tableElement != undefined) {
        tableElement.deleteRow(0);
    }

    return tableElement;
}


function insereBotoesMostraGrades() {

    let tabela = divAtividades.getElementsByTagName("table")[0];

    let rowBotoesMostraGrades = tabela.insertRow(6);
    rowBotoesMostraGrades.id = "rowBotoesMostraGrades";
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
    paragBotoesGrades.id = "botoesGrades";
    paragBotoesGrades.appendChild(botaoGrades);
    paragBotoesGrades.appendChild(botaoGradeUnica);
    cellBotoesGrades.appendChild(paragBotoesGrades);

}
