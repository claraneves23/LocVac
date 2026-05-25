package com.locvac.service.impl;

import com.locvac.dto.pessoa.PessoaFotoResponseDTO;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.PessoaFoto;
import com.locvac.repository.PessoaFotoRepository;
import com.locvac.repository.PessoaRepository;
import com.locvac.service.PessoaFotoService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Base64;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
public class PessoaFotoServiceImpl implements PessoaFotoService {

    private static final int MAX_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final Pattern DATA_URL = Pattern.compile(
            "^data:(?<type>image/[a-zA-Z0-9.+-]+);base64,(?<data>.+)$",
            Pattern.DOTALL
    );

    private final PessoaFotoRepository fotoRepository;
    private final PessoaRepository pessoaRepository;

    public PessoaFotoServiceImpl(PessoaFotoRepository fotoRepository, PessoaRepository pessoaRepository) {
        this.fotoRepository = fotoRepository;
        this.pessoaRepository = pessoaRepository;
    }

    @Override
    public PessoaFotoResponseDTO salvar(Long idPessoa, String dataUrl) {
        Pessoa pessoa = pessoaRepository.findById(idPessoa)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));

        Matcher matcher = DATA_URL.matcher(dataUrl == null ? "" : dataUrl.trim());
        if (!matcher.matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de dataUrl inválido");
        }
        String contentType = matcher.group("type").toLowerCase();
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Tipo de imagem não suportado");
        }
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(matcher.group("data"));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Base64 inválido");
        }
        if (bytes.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem vazia");
        }
        if (bytes.length > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Imagem excede 5 MB");
        }

        PessoaFoto foto = fotoRepository.findById(idPessoa).orElseGet(PessoaFoto::new);
        foto.setPessoa(pessoa);
        foto.setBytes(bytes);
        foto.setContentType(contentType);
        foto.setAtualizadoEm(Instant.now());
        fotoRepository.save(foto);

        String url = "/pessoas/" + idPessoa + "/foto?v=" + foto.getAtualizadoEm().toEpochMilli();
        pessoa.setFotoUrl(url);
        pessoaRepository.save(pessoa);

        return new PessoaFotoResponseDTO(dataUrl, url);
    }

    @Override
    public PessoaFotoResponseDTO obter(Long idPessoa) {
        PessoaFoto foto = fotoRepository.findById(idPessoa)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foto não encontrada"));
        String b64 = Base64.getEncoder().encodeToString(foto.getBytes());
        String dataUrl = "data:" + foto.getContentType() + ";base64," + b64;
        String url = "/pessoas/" + idPessoa + "/foto?v=" + foto.getAtualizadoEm().toEpochMilli();
        return new PessoaFotoResponseDTO(dataUrl, url);
    }

    @Override
    public void remover(Long idPessoa) {
        Pessoa pessoa = pessoaRepository.findById(idPessoa)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));
        fotoRepository.findById(idPessoa).ifPresent(fotoRepository::delete);
        pessoa.setFotoUrl(null);
        pessoaRepository.save(pessoa);
    }
}
