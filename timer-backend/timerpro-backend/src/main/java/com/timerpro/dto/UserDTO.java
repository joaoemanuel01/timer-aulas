package com.timerpro.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class UserDTO {

    // Atualizar preferencias (modo + imagem)
    @Data
    public static class UpdatePrefsRequest {
        @NotBlank(message = "aulaMode e obrigatorio")
        @Pattern(regexp = "cronometro|personalizado", message = "aulaMode deve ser 'cronometro' ou 'personalizado'")
        private String aulaMode;
    }

    // Resposta com dados do usuario (sem senha e sem token)
    @Data
    @AllArgsConstructor
    public static class UserResponse {
        private Long   id;
        private String name;
        private String email;
        private String aulaMode;
        private String aulaImageUrl;
    }
}