package com.locvac.service.impl;

import com.locvac.dto.notificacao.NotificacaoResponseDTO;
import com.locvac.dto.notificacao.RegistrarTokenDTO;
import com.locvac.model.associacao.CalendarioVacinal;
import com.locvac.model.associacao.ExpoPushToken;
import com.locvac.model.associacao.Notificacao;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import com.locvac.model.enums.TipoNotificacao;
import com.locvac.repository.ExpoPushTokenRepository;
import com.locvac.repository.NotificacaoRepository;
import com.locvac.repository.UsuarioPessoaRepository;
import com.locvac.repository.UsuarioRepository;
import com.locvac.service.ExpoPushService;
import com.locvac.service.NotificacaoService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class NotificacaoServiceImpl implements NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final ExpoPushTokenRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioPessoaRepository usuarioPessoaRepository;
    private final ExpoPushService expoPushService;

    public NotificacaoServiceImpl(
            NotificacaoRepository notificacaoRepository,
            ExpoPushTokenRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            UsuarioPessoaRepository usuarioPessoaRepository,
            ExpoPushService expoPushService
    ) {
        this.notificacaoRepository = notificacaoRepository;
        this.tokenRepository = tokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioPessoaRepository = usuarioPessoaRepository;
        this.expoPushService = expoPushService;
    }

    @Override
    public void notificarVacinaProxima(Pessoa pessoa, CalendarioVacinal calendario, LocalDate dataPrevista, int diasOffset) {
        LocalDate hoje = LocalDate.now();
        TipoNotificacao tipo = TipoNotificacao.PROXIMA_VACINA;

        if (notificacaoRepository.existsByPessoaAndCalendarioAndTipoNotificacaoAndDiasOffsetAndDataCriacao(
                pessoa, calendario, tipo, diasOffset, hoje)) {
            return;
        }

        Usuario usuario = donoDePessoa(pessoa);
        if (usuario == null) return;

        String nomeVacina = calendario.getVacina() != null ? calendario.getVacina().getNome() : "vacina";
        String titulo;
        String mensagem;

        if (diasOffset == 0) {
            titulo = "Hoje é o dia da vacina!";
            mensagem = "A vacina \"" + nomeVacina + "\" de " + pessoa.getNome() + " deve ser aplicada hoje.";
        } else {
            titulo = "Vacina se aproximando";
            mensagem = "A vacina \"" + nomeVacina + "\" de " + pessoa.getNome() + " deve ser aplicada em " + diasOffset + " dia(s).";
        }

        boolean persistente = diasOffset == 0;
        Notificacao n = persistir(usuario, pessoa, calendario, null, tipo, diasOffset, titulo, mensagem, persistente);
        dispararPush(usuario, n);
    }

    @Override
    public void notificarVacinaAtrasada(Pessoa pessoa, CalendarioVacinal calendario, LocalDate dataPrevista, int diasOffset) {
        LocalDate hoje = LocalDate.now();
        TipoNotificacao tipo = TipoNotificacao.VACINA_ATRASADA;

        if (notificacaoRepository.existsByPessoaAndCalendarioAndTipoNotificacaoAndDiasOffsetAndDataCriacao(
                pessoa, calendario, tipo, diasOffset, hoje)) {
            return;
        }

        Usuario usuario = donoDePessoa(pessoa);
        if (usuario == null) return;

        String nomeVacina = calendario.getVacina() != null ? calendario.getVacina().getNome() : "vacina";
        int diasAtraso = Math.abs(diasOffset);

        String titulo = "Vacina em atraso";
        String mensagem = "A vacina \"" + nomeVacina + "\" de " + pessoa.getNome() + " está atrasada há " + diasAtraso + " dia(s).";

        Notificacao n = persistir(usuario, pessoa, calendario, null, tipo, diasOffset, titulo, mensagem, true);
        dispararPush(usuario, n);
    }

    @Override
    public void notificarCampanha(Usuario usuario, Campanha campanha, int diasOffset) {
        LocalDate hoje = LocalDate.now();
        TipoNotificacao tipo = TipoNotificacao.NOVA_CAMPANHA;

        if (notificacaoRepository.existsByUsuarioAndCampanhaAndTipoNotificacaoAndDiasOffsetAndDataCriacao(
                usuario, campanha, tipo, diasOffset, hoje)) {
            return;
        }

        String titulo;
        String mensagem;
        if (diasOffset == 0) {
            titulo = "Campanha começa hoje";
            mensagem = "A campanha \"" + campanha.getNome() + "\" começa hoje.";
        } else {
            titulo = "Campanha próxima";
            mensagem = "A campanha \"" + campanha.getNome() + "\" começa em " + diasOffset + " dia(s).";
        }

        boolean persistente = diasOffset == 0;
        Notificacao n = persistir(usuario, null, null, campanha, tipo, diasOffset, titulo, mensagem, persistente);
        dispararPush(usuario, n);
    }

    @Override
    public List<NotificacaoResponseDTO> listar(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        return notificacaoRepository
                .findByUsuarioAndLidaFalseOrUsuarioAndPersistenteTrueOrderByDataCriacaoDesc(usuario, usuario)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void marcarComoLida(Long id, UUID usuarioId) {
        Notificacao n = notificacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada."));

        if (!n.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Notificação não pertence ao usuário.");
        }

        if (!n.isLida()) {
            n.setLida(true);
            n.setDataVisualizacao(LocalDate.now());
            notificacaoRepository.save(n);
        }
    }

    @Override
    public void registrarToken(UUID usuarioId, RegistrarTokenDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        ExpoPushToken existente = tokenRepository.findByToken(dto.token()).orElse(null);
        if (existente != null) {
            existente.setUsuario(usuario);
            existente.setPlataforma(dto.plataforma());
            tokenRepository.save(existente);
            return;
        }

        ExpoPushToken novo = new ExpoPushToken();
        novo.setUsuario(usuario);
        novo.setToken(dto.token());
        novo.setPlataforma(dto.plataforma());
        novo.setCriadoEm(LocalDateTime.now());
        tokenRepository.save(novo);
    }

    @Override
    public void removerToken(String token) {
        tokenRepository.deleteByToken(token);
    }

    private Notificacao persistir(
            Usuario usuario, Pessoa pessoa, CalendarioVacinal calendario, Campanha campanha,
            TipoNotificacao tipo, int diasOffset, String titulo, String mensagem, boolean persistente
    ) {
        Notificacao n = new Notificacao();
        n.setUsuario(usuario);
        n.setPessoa(pessoa);
        n.setCalendario(calendario);
        n.setCampanha(campanha);
        n.setTipoNotificacao(tipo);
        n.setDiasOffset(diasOffset);
        n.setTitulo(titulo);
        n.setMensagem(mensagem);
        n.setLida(false);
        n.setPersistente(persistente);
        n.setDataCriacao(LocalDate.now());
        return notificacaoRepository.save(n);
    }

    private void dispararPush(Usuario usuario, Notificacao n) {
        List<String> tokens = tokenRepository.findByUsuario(usuario).stream()
                .map(ExpoPushToken::getToken)
                .toList();

        if (tokens.isEmpty()) return;

        Map<String, Object> dados = new HashMap<>();
        dados.put("notificacaoId", n.getId());
        dados.put("tipo", n.getTipoNotificacao().name());
        if (n.getCalendario() != null) dados.put("calendarioId", n.getCalendario().getId());
        if (n.getCampanha() != null) dados.put("campanhaId", n.getCampanha().getId());
        if (n.getPessoa() != null) dados.put("pessoaId", n.getPessoa().getId());

        expoPushService.enviar(tokens, n.getTitulo(), n.getMensagem(), dados);
    }

    private Usuario donoDePessoa(Pessoa pessoa) {
        if (pessoa == null) return null;
        List<UsuarioPessoa> vinculos = usuarioPessoaRepository.findByPessoaId(pessoa.getId());
        if (vinculos.isEmpty()) return null;
        return vinculos.get(0).getUsuario();
    }

    private NotificacaoResponseDTO toResponse(Notificacao n) {
        return new NotificacaoResponseDTO(
                n.getId(),
                n.getTipoNotificacao(),
                n.getTitulo(),
                n.getMensagem(),
                n.getDiasOffset(),
                n.isLida(),
                n.isPersistente(),
                n.getDataCriacao(),
                n.getCalendario() != null ? n.getCalendario().getId() : null,
                n.getPessoa() != null ? n.getPessoa().getId() : null,
                n.getCampanha() != null ? n.getCampanha().getId() : null
        );
    }
}
