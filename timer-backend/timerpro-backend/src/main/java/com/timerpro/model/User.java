package com.timerpro.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    // "cronometro" ou "personalizado"
    @Column(name = "aula_mode", nullable = false, length = 20)
    @Builder.Default
    private String aulaMode = "cronometro";

    // URL da imagem salva no Cloudinary (null se modo cronometro)
    @Column(name = "aula_image_url", columnDefinition = "TEXT")
    private String aulaImageUrl;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
