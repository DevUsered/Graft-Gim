package com.example.backend;

import com.example.backend.model.Usuario;
import com.example.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Buscamos si existe tu usuario 'edgar'
        Optional<Usuario> adminOpt = usuarioRepository.findByUsername("edgar");

        if (adminOpt.isPresent()) {
            Usuario admin = adminOpt.get();
            // Le aplicamos el encriptado real de BCrypt a la palabra "admin123"
            admin.setPassword(passwordEncoder.encode("admin123"));
            usuarioRepository.save(admin);
            System.out.println("✅ Contraseña del usuario 'edgar' actualizada y encriptada correctamente.");
        }
    }
}