package com.locvac.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HostFilter extends OncePerRequestFilter {

    private static final Set<String> MAIN_DOMAIN_HOSTS = Set.of(
            "locvac.com.br",
            "www.locvac.com.br"
    );

    private static final Set<String> ALLOWED_PATHS_ON_MAIN_DOMAIN = Set.of(
            "/excluir-conta",
            "/logo.png",
            "/favicon.ico"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String host = request.getServerName().toLowerCase();
        String path = request.getRequestURI();

        if (MAIN_DOMAIN_HOSTS.contains(host) && !ALLOWED_PATHS_ON_MAIN_DOMAIN.contains(path)) {
            servirPaginaEmConstrucao(response);
            return;
        }

        chain.doFilter(request, response);
    }

    private void servirPaginaEmConstrucao(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType(MediaType.TEXT_HTML_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(HTML_EM_CONSTRUCAO);
    }

    private static final String HTML_EM_CONSTRUCAO = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Em construção — LocVac</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(180deg, #F1F5F4 0%, #E5EEF2 100%);
    color: #1a2b27;
    line-height: 1.6;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .card {
    background: #FFFFFF;
    border: 1px solid #d9e3df;
    border-radius: 20px;
    padding: 48px 36px;
    max-width: 480px;
    width: 100%;
    text-align: center;
    box-shadow: 0 12px 32px rgba(26, 36, 34, 0.08);
  }
  .logo-wrap {
    width: 96px;
    height: 96px;
    margin: 0 auto 24px;
    border-radius: 24px;
    background: #03394A;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(3, 57, 74, 0.18);
  }
  .logo-wrap img {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }
  .badge {
    display: inline-block;
    background: #F6EFD9;
    color: #6E5419;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 999px;
    margin-bottom: 16px;
  }
  h1 {
    font-size: 26px;
    color: #03394A;
    margin-bottom: 12px;
    letter-spacing: -0.3px;
  }
  p {
    color: #525E5C;
    font-size: 15px;
    margin-bottom: 8px;
  }
  .small {
    margin-top: 24px;
    font-size: 13px;
    color: #7C8786;
  }
  .small a {
    color: #03394A;
    text-decoration: none;
    font-weight: 600;
  }
  .small a:hover { text-decoration: underline; }
  .divider {
    width: 48px;
    height: 3px;
    background: #03394A;
    border-radius: 2px;
    margin: 24px auto;
    opacity: 0.2;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="logo-wrap">
      <img src="/logo.png" alt="LocVac">
    </div>
    <span class="badge">Em construção</span>
    <h1>Esta página ainda não está disponível</h1>
    <p>Estamos trabalhando para trazer mais conteúdo em breve aqui no site oficial do LocVac.</p>
    <div class="divider"></div>
    <p>Enquanto isso, o aplicativo está disponível na Google Play Store.</p>
    <p class="small">Precisa solicitar exclusão de conta ou dados? <a href="/excluir-conta">Clique aqui</a>.</p>
  </div>
</body>
</html>
""";
}
