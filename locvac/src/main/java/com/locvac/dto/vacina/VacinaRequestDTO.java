package com.locvac.dto.vacina;

import com.locvac.model.enums.TipoSecaoVacinacao;

public class VacinaRequestDTO {
    private String nome;
    private String descricao;
    private String dose;
    private String viaAdministracao;
    private String codigoPNI;
    private TipoSecaoVacinacao tipoSecaoVacinacao;

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
}
