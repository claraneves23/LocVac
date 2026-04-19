package com.locvac.config;

import com.locvac.model.core.Vacina;
import com.locvac.model.enums.TipoSecaoVacinacao;
import com.locvac.repository.VacinaRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VacinaDataInitializer implements ApplicationRunner {

    private final VacinaRepository repository;

    public VacinaDataInitializer(VacinaRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<String[]> vacinas = List.of(
            new String[]{"mfy-1",  "BCG",                          "Tuberculose",                                              "Dose única"},
            new String[]{"mfy-2",  "Paralisia Infantil",           "1ª dose",                                                  "1ª dose"},
            new String[]{"mfy-3",  "Tetra",                        "Difteria, Tétano, Coqueluche, Hemófilo - 1ª dose",         "1ª dose"},
            new String[]{"mfy-4",  "Hepatite B",                   "1ª dose",                                                  "1ª dose"},
            new String[]{"mfy-5",  "Paralisia Infantil",           "2ª dose",                                                  "2ª dose"},
            new String[]{"mfy-6",  "Tetra",                        "Difteria, Tétano, Coqueluche, Hemófilo - 2ª dose",         "2ª dose"},
            new String[]{"mfy-7",  "Hepatite B",                   "2ª dose",                                                  "2ª dose"},
            new String[]{"mfy-8",  "Paralisia Infantil",           "3ª dose",                                                  "3ª dose"},
            new String[]{"mfy-9",  "Tetra",                        "Difteria, Tétano, Coqueluche, Hemófilo - 3ª dose",         "3ª dose"},
            new String[]{"mfy-10", "Hepatite B",                   "3ª dose",                                                  "3ª dose"},
            new String[]{"mfy-11", "Paralisia Infantil",           "Reforço",                                                  "Reforço"},
            new String[]{"mfy-12", "Difteria/Tétano/Coqueluche",   "1º reforço",                                               "1º reforço"},
            new String[]{"mfy-13", "Sarampo/Caxumba/Rubéola",      "1ª dose",                                                  "1ª dose"},
            new String[]{"mfy-14", "Paralisia Infantil",           "2º reforço",                                               "2º reforço"},
            new String[]{"mfy-15", "Difteria/Tétano/Coqueluche",   "2º reforço",                                               "2º reforço"},
            new String[]{"mfy-16", "Febre Amarela",                "Dose única",                                               "Dose única"}
        );

        for (String[] dados : vacinas) {
            if (!repository.existsByCodigoPNI(dados[0])) {
                Vacina v = new Vacina();
                v.setCodigoPNI(dados[0]);
                v.setNome(dados[1]);
                v.setDescricao(dados[2]);
                v.setDose(dados[3]);
                v.setAtiva(true);
                v.setTipoSecaoVacinacao(TipoSecaoVacinacao.OBRIGATORIAS_PRIMEIRO_ANO);
                repository.save(v);
            }
        }
    }
}
