var observer = new MutationObserver(
  
    function(records, observer) {
      
        var totalAdded = 0;
        var totalRemoved = 0;

        for (const record of records) {
            totalAdded += record.addedNodes.length;
            totalRemoved += record.removedNodes.length;
        }

        if (totalRemoved == 5) {
            //removeSeletorTurmas();
            console.log("Removed:" + totalRemoved)
        } 

        if (totalAdded == 5) {
            //removeBotoesOriginais();
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

    let rowBotaoAtualiza = tabela.insertRow(4);
    let cellBotaoAtualiza = rowBotaoAtualiza.insertCell(0);
    cellBotaoAtualiza.colSpan = 1;
    cellBotaoAtualiza.width = "100%";
    // width is deprecated
    // and <td> not getting to full <tr> width, idk why.
    // fix later.

    const botaoSelecionaTurmas = document.createElement('input');
    botaoSelecionaTurmas.className = "button";
    botaoSelecionaTurmas.type = "button";
    botaoSelecionaTurmas.value = "Mostrar turmas diponíveis";
    
    //botaoSelecionaTurmas.addEventListener("click", LogaTurmasDisciplinasEscolhidas);
    // Chamada para LogaTurmasDisciplinasEscolhidas()

    botaoSelecionaTurmas.addEventListener("click", LogaTurmasDisciplinasEscolhidas2);
    
    const paragBotaoSelecionaTurmas = document.createElement('p');
    paragBotaoSelecionaTurmas.className = "paragBotoes";
    paragBotaoSelecionaTurmas.appendChild(botaoSelecionaTurmas);
    cellBotaoAtualiza.appendChild(paragBotaoSelecionaTurmas);


    let rowSeletorTurmas = tabela.insertRow(5);
    let cellSeletorTurmas = rowSeletorTurmas.insertCell(0);

    getSeletorTurmas();
}

function getSeletorTurmas() {
    // deve mostrar as turmas disponíveis junto com informações a respeito do professor
    // e horário e te permite 

    // usar funções já existentes


    // Usar 
}

// Procedimento:
// Obtem todas turmas das cadeiras usando função abaixo
// pede pro usuário selecionar aquelas turmas que ele quiser.
// fazer Parsing de Horário-Período-Local
// para aquelas turmas que o usuário selecionou, mostrar todas combinações possíveis.
// 
// Um possível seletor de prioridade fica para mais tarde, aqui basta mostrar todas possíveis.


// todo right now:
// parsing de Horário-Período-Local para valores em uma tabela.

function LogaTurmasDisciplinasEscolhidas2() {
    
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
            
            var tableElement = pegaTabelaTurmas(data);
            
            var rowLength = tableElement.rows.length;
            for (var i = 1; i < rowLength; i++) {
                
                var celulaHorarios = tableElement.rows[i].cells[4];
                for (var child of celulaHorarios.children) {
                    console.log(child);
                }
            }
        });
    }

}

function pegaTabelaTurmas(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes.
    return div.getElementsByTagName('table')[0];
  }

// Obter a tabela me ajuda de alguma maneira?
// é  mais fácil fazer parsing de "Terça 13:30 - 15:10 (2)" ou do código da cadeira?
// "Segunda 07:30 - 08:20 (1)" é sempre o mesmo formato.
// .split(" ")
// Split vai gerar: [Segunda, 07:30, -, 08:20, (1)]
// usar [0] pro dia da semana, [1] pro primeiro período da cadeira, [4] pro número de períodos.
// são todas as informações necessárias (períodos tem sempre 50min).

// analisar bem certinho qual a estrutura de display
// Sempre tem parenteses para indicar períodos?
