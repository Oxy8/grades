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

function LogaTurmasDisciplinasEscolhidas()
{
    let aAtividades = new Array();
    let iSelected = 0;

    $('#AtivEnsinoSelecionadas option').each(function (i) {
        aDados = $(this).val().split(',');
        aAtividades.push(aDados[1]);
        iSelected++;
    });

    if (iSelected > 30)
    {
        alert("Você pode selecionar no máximo 30 Atividades de Ensino")
        return false
    } else if (iSelected == 0)
    {
        alert("Você deve selecionar no mínimo uma Atividades de Ensino")
    } else
    {
        sGrupoMatricula = $('#GrupoMatricula').val();
        iPeriodoLetivo = $('#PeriodoLetivo').val();
        
        if ((iPeriodoLetivo != '') && (sGrupoMatricula != ''))
        {
            aDados = {GradeUnica: 1, PeriodoLetivo: iPeriodoLetivo, GrupoMatricula: sGrupoMatricula, 'Atividades[]': aAtividades};
            
            $.post('/PortalEnsino/GradeHorarios/index.php?r=grade/montaGrade', aDados, function(responseData) {

                var tempResponse = document.createElement('div');
                tempResponse.innerHTML = responseData;

                var tableElement = tempResponse.getElementsByTagName('table')[0];


                //console.log(tableElement.outerHTML);
                //console.log("OIE");

                infoTabela(tableElement); // nome bosta, só testando ainda
                
            });



        }
    }
}

function infoTabela(tabela) {

    // itera pela tabela.
    // processamento final é uma lista de Turmas com informação de quais os horários da turma.



    var rowLength = tabela.rows.length;  // numero de linhas
    console.log("numero de linhas = " + rowLength);

    for (i = 1; i < rowLength; i++) { // primeira linha contém os dias da semana, então podemos ignorar.

        var linha_celulas = tabela.rows[i].cells;
        var comprimento_linha = linha_celulas.length;

        console.log("comprimento_linha = " + comprimento_linha);

        for (var j = 1; j < comprimento_linha; j++) { // primeira coluna contém os horários, então podemos ignorar.

            var celula = linha_celulas[j];
            //console.log(celula);


            var child_number = celula.children.length;
            if (child_number != 0) {

                // Aqui temos uma célula que contém info a respeito de uma disciplina
                    // i nos fornece o horário
                    // j nos fornece o dia da semana.

                for (var k = 0; k < child_number; k++) {
                    console.log(celula.children[k]);

                    // Esse loop itera sobre todas as disciplinas em um determinado dia/horário.
                    

                }
            }
        }
    }
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
