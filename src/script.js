document.getElementById("buttonGrades").addEventListener("click", selecionaDisciplinasEscolhidas());

function selecionaDisciplinasEscolhidas()
    {
        aAtividades = new Array();
        iSelected = 0;

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
                $('#divGrade').load('/PortalEnsino/GradeHorarios/index.php?r=grade/montaGrade', aDados, function () {
                    $('#divGrade').show();
                });
            }
        }
    }


onclick="selecionaDisciplinasEscolhidas(0)" 