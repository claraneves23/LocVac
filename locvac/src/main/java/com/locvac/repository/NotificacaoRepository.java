package com.locvac.repository;

import com.locvac.model.associacao.CalendarioVacinal;
import com.locvac.model.associacao.Notificacao;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import com.locvac.model.enums.TipoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    boolean existsByPessoaAndCalendarioAndTipoNotificacaoAndDiasOffsetAndDataCriacao(
            Pessoa pessoa,
            CalendarioVacinal calendario,
            TipoNotificacao tipo,
            Integer diasOffset,
            LocalDate dataCriacao
    );

    boolean existsByUsuarioAndCampanhaAndTipoNotificacaoAndDiasOffsetAndDataCriacao(
            Usuario usuario,
            Campanha campanha,
            TipoNotificacao tipo,
            Integer diasOffset,
            LocalDate dataCriacao
    );

    List<Notificacao> findByUsuarioAndLidaFalseOrUsuarioAndPersistenteTrueOrderByDataCriacaoDesc(
            Usuario usuario1, Usuario usuario2
    );

    List<Notificacao> findByPersistenteTrue();

    List<Notificacao> findByPessoaId(Long idPessoa);

    List<Notificacao> findByCampanhaId(Long idCampanha);

    long countByUsuarioAndDataCriacao(Usuario usuario, LocalDate dataCriacao);

    boolean existsByUsuarioAndTipoNotificacaoAndDataCriacao(
            Usuario usuario, TipoNotificacao tipo, LocalDate dataCriacao);

    @Query("SELECT COUNT(n) FROM Notificacao n WHERE n.usuario = :u AND n.dataCriacao < :hoje AND (n.lida = false OR n.persistente = true)")
    long contarPendentesAnteriores(@Param("u") Usuario u, @Param("hoje") LocalDate hoje);
}
