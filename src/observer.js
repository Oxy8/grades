var observer = new MutationObserver(
  
    function(records, observer) {
      
        var totalAdded = 0;
        var totalRemoved = 0;

        for (const record of records) {
            totalAdded += record.addedNodes.length;
            totalRemoved += record.removedNodes.length;
        }

        if (totalRemoved == 5) { // o que exatamente significa esse caso aqui? Precisa remover seletor mesmo?
            //removeSeletorTurmas();
            console.log("Removed:" + totalRemoved)
        } 

        if (totalAdded == 5) {
            removeBotoesOriginais();
            insereSeletorTurmas();
            console.log("Added:" + totalAdded)
        }
    }
)

const divAtividades = document.getElementById("divAtividades");
  
observer.observe(divAtividades, { 
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

function insereSeletorTurmas() {

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
    
    // aqui eu tenho que limpar possíveis adições prévias de
    // MostraTabelaTurmasDisponiveis() && InsereBotoesMostraGrades()

    var tabelaSelecaoTurmas = ObtemTabelaTurmasDisponiveis();

    let tabelaAtividades = divAtividades.getElementsByTagName("table")[0];

    let rowTabelaTurmas = tabelaAtividades.insertRow(5);
    let cellTabelaTurmas = rowTabelaTurmas.insertCell(0);
    cellTabelaTurmas.style.whiteSpace = 'nowrap';
    cellTabelaTurmas.setAttribute("width", "100%");

    

    cellTabelaTurmas.appendChild(tabelaSelecaoTurmas);

    divAtividades.setAttribute("TabelaTurmas", "true");

    //=========================================================================

    InsereBotoesMostraGrades();
    // Remover botões originais, inserir novos aqui
}

function InsereBotoesMostraGrades() {

    // Botoes ja foram inseridos?

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

    botaoGrades.addEventListener("click", MostraTabelaTurmasDisponiveis);
    botaoGradeUnica.addEventListener("click", MostraTabelaTurmasDisponiveis);
    
    const paragBotoesGrades = document.createElement('p');
    paragBotoesGrades.setAttribute('style', 'padding: 20px;');
    paragBotoesGrades.className = "paragBotoes";
    paragBotoesGrades.appendChild(botaoGrades);
    paragBotoesGrades.appendChild(botaoGradeUnica);
    cellBotoesGrades.appendChild(paragBotoesGrades);

    divAtividades.setAttribute("BotoesGrades", "true");

}

function ObtemTabelaTurmasDisponiveis() {
    
    var tabelaSelecaoTurmas = document.createElement('div');
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
            
            var tableElement = pegaTabelaTurma(data);

            for (var row of tableElement.rows) {

                var newRow = row.cloneNode(true);

                var celulaBotao = newRow.insertCell(0);
                celulaBotao.setAttribute("align", "center");
                celulaBotao.setAttribute('valign', 'middle');
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';             
                celulaBotao.appendChild(checkbox);

                tabelaSelecaoTurmas.appendChild(newRow);
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
    cell0.setAttribute("width", "10%");
    newRow.appendChild(cell0);

    var cell1 = document.createElement("td");
    cell1.className = "th1";
    cell1.setAttribute("align", "center");
    cell1.setAttribute("width", "32%");
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
    cell6.textContent = "Professor(es)";
    newRow.appendChild(cell6);

    return newRow;
}


function pegaTabelaTurma(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    var tableElement = div.getElementsByTagName('table')[0];
    tableElement.deleteRow(0);

    return tableElement;
}

// Pega tabela me retorna tabela com info de 1 turma.
// Criar botão que quando clicado, mostra a tabela
// de seleção de turmas, e ao mesmo tempo,
// armazena em algum lugar essa tabela para uso futuro?


/*
function MostraTabelaTurmasDisponiveis() {
    
    var curriculoSelectVal = document.getElementById( "Curriculo" ).value;
    const [CodCur, CodHab] = curriculoSelectVal.split("/").map(item => item.trim());

    var Semestre = document.getElementById( "PeriodoLetivo" ).value;

    var cadeirasSelecionadas = Array.from(document.getElementById( "AtivEnsinoSelecionadas" ).options);
    var codigosCadeirasSelecionadas = cadeirasSelecionadas.map(item => {
        return item.value.split(",")[1].trim();
    });

    for (var CodAtiv of codigosCadeirasSelecionadas) {
        $.get('/PortalEnsino/GraduacaoAluno/view/HorarioAtividade.php', {
            CodAtiv: CodAtiv,
            CodHab: CodHab,
            CodCur: CodCur,
            Sem: Semestre
        }, data => {
            
            var tableElement = pegaTabelaTurma(data);
            
            for (var i = 0; i < tableElement.rows.length; i++) {
                
                var celulaHorarios = tableElement.rows[i].cells[4];
                for (var child of celulaHorarios.children) {
                    
                    var toBeParsed = child.innerHTML.split("<br>", 1)[0];
                    
                    const toBeParsedSplit= toBeParsed.trim().split(" ");
                    if (toBeParsedSplit.length == 5) {
                        const [Dia, HorarioInicio, , , NumeroPeriodos] = toBeParsedSplit;
                        
                        console.log(Dia);
                        console.log(HorarioInicio);
                        console.log(NumeroPeriodos);

                        // vou ter uma tabela 7x16, onde serão marcados os períodos.
                        // cada cadeira vai ter a sua própria tabela.

                        // Depois para montar horários, criar função verifica conflitos horários.
                    }
                }
            }
        });
    }
}
*/