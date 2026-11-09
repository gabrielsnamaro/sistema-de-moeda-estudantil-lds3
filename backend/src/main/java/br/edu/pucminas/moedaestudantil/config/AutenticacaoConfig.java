package br.edu.pucminas.moedaestudantil.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AutenticacaoConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    public AutenticacaoConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/instituicoes",
                        "/api/instituicoes/**"
                );
    }
}
