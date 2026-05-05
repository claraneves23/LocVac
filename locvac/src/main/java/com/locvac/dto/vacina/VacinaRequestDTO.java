package com.locvac.dto.vacina;

import com.locvac.model.enums.TipoSecaoVacinacao;
import jakarta.validation.constraints.Size;

public class VacinaRequestDTO {
    @Size(max = 150)
    private String nome;
    @Size(max = 500)
    private String descricao;
    @Size(max = 50)
    private String dose;
    @Size(max = 50)
    private String viaAdministracao;
    @Size(max = 20)
    private String codigoPNI;
    private TipoSecaoVacinacao tipoSecaoVacinacao;
    private Integer idadeMinimaMeses;
    private Integer idadeMaximaMeses;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getDose() { return dose; }
    public void setDose(String dose) { this.dose = dose; }

    public String getViaAdministracao() { return viaAdministracao; }
    public void setViaAdministracao(String viaAdministracao) { this.viaAdministracao = viaAdministracao; }

    public String getCodigoPNI() { return codigoPNI; }
    public void setCodigoPNI(String codigoPNI) { this.codigoPNI = codigoPNI; }

    public TipoSecaoVacinacao getTipoSecaoVacinacao() { return tipoSecaoVacinacao; }
    public void setTipoSecaoVacinacao(TipoSecaoVacinacao tipoSecaoVacinacao) { this.tipoSecaoVacinacao = tipoSecaoVacinacao; }

    public Integer getIdadeMinimaMeses() { return idadeMinimaMeses; }
    public void setIdadeMinimaMeses(Integer idadeMinimaMeses) { this.idadeMinimaMeses = idadeMinimaMeses; }

    public Integer getIdadeMaximaMeses() { return idadeMaximaMeses; }
    public void setIdadeMaximaMeses(Integer idadeMaximaMeses) { this.idadeMaximaMeses = idadeMaximaMeses; }
}
