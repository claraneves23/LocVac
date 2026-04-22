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

    private record SeedVacina(String codigo, String nome, String descricao, String dose, Integer idadeMinimaMeses) {}

    @Override
    public void run(ApplicationArguments args) {
        List<SeedVacina> vacinas = List.of(
            new SeedVacina("mfy-1",  "BCG",                        "Tuberculose",                                       "Dose única", 0),
            new SeedVacina("mfy-2",  "Paralisia Infantil",         "1ª dose",                                           "1ª dose",    2),
            new SeedVacina("mfy-3",  "Tetra",                      "Difteria, Tétano, Coqueluche, Hemófilo - 1ª dose",  "1ª dose",    2),
            new SeedVacina("mfy-4",  "Hepatite B",                 "1ª dose",                                           "1ª dose",    0),
            new SeedVacina("mfy-5",  "Paralisia Infantil",         "2ª dose",                                           "2ª dose",    4),
            new SeedVacina("mfy-6",  "Tetra",                      "Difteria, Tétano, Coqueluche, Hemófilo - 2ª dose",  "2ª dose",    4),
            new SeedVacina("mfy-7",  "Hepatite B",                 "2ª dose",                                           "2ª dose",    2),
            new SeedVacina("mfy-8",  "Paralisia Infantil",         "3ª dose",                                           "3ª dose",    6),
            new SeedVacina("mfy-9",  "Tetra",                      "Difteria, Tétano, Coqueluche, Hemófilo - 3ª dose",  "3ª dose",    6),
            new SeedVacina("mfy-10", "Hepatite B",                 "3ª dose",                                           "3ª dose",    6),
            new SeedVacina("mfy-11", "Paralisia Infantil",         "Reforço",                                           "Reforço",    15),
            new SeedVacina("mfy-12", "Difteria/Tétano/Coqueluche", "1º reforço",                                        "1º reforço", 15),
            new SeedVacina("mfy-13", "Sarampo/Caxumba/Rubéola",    "1ª dose",                                           "1ª dose",    12),
            new SeedVacina("mfy-14", "Paralisia Infantil",         "2º reforço",                                        "2º reforço", 48),
            new SeedVacina("mfy-15", "Difteria/Tétano/Coqueluche", "2º reforço",                                        "2º reforço", 48),
            new SeedVacina("mfy-16", "Febre Amarela",              "Dose única",                                        "Dose única", 9)
        );

        for (SeedVacina seed : vacinas) {
            Vacina v = repository.findByCodigoPNI(seed.codigo()).orElse(null);
            if (v == null) {
                v = new Vacina();
                v.setCodigoPNI(seed.codigo());
                v.setNome(seed.nome());
                v.setDescricao(seed.descricao());
                v.setDose(seed.dose());
                v.setAtiva(true);
                v.setTipoSecaoVacinacao(TipoSecaoVacinacao.OBRIGATORIAS_PRIMEIRO_ANO);
                v.setIdadeMinimaMeses(seed.idadeMinimaMeses());
                repository.save(v);
            } else if (v.getIdadeMinimaMeses() == null) {
                v.setIdadeMinimaMeses(seed.idadeMinimaMeses());
                repository.save(v);
            }
        }
    }
}
