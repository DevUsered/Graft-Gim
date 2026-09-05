package com.example.backend.controller;

import com.example.backend.model.Usuario;
import com.example.backend.repository.UsuarioRepository;
import com.example.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioRepository usuarioRepository;

    // Esta clase interna sirve para recibir los datos de React
    public static class AuthRequest {
        public String username;
        public String password;
    }

    @PostMapping("/login")
    public Map<String, String> crearToken(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            // Intenta iniciar sesión con los datos que mandó React
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.username, authRequest.password)
            );
        } catch (Exception e) {
            throw new Exception("Usuario o contraseña incorrectos", e);
        }
        Usuario usuarioDb = usuarioRepository.findByUsername(authRequest.username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Si la contraseña era correcta, le fabricamos un token
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.username);
        final String jwt = jwtUtil.generateToken(userDetails, usuarioDb.getIdGimnasio());

        // Se lo devolvemos a React en formato JSON
        return Map.of("token", jwt);
    }
}