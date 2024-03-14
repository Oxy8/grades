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
    botaoSelecionaTurmas.addEventListener("click", LogaTurmasDisciplinasEscolhidas);
    
    const paragBotaoSelecionaTurmas = document.createElement('p');
    paragBotaoSelecionaTurmas.className = "paragBotoes";
    paragBotaoSelecionaTurmas.appendChild(botaoSelecionaTurmas);
    cellBotaoAtualiza.appendChild(paragBotaoSelecionaTurmas);


    let rowSeletorTurmas = tabela.insertRow(5);
    let cellSeletorTurmas = rowSeletorTurmas.insertCell(0);

    getSeletorTurmas();
}

function getSeletorTurmas() {
    // primeiro coleta quais as turmas disponíveis
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


                console.log(tableElement.innerHTML);
            });



        }
    }
}


