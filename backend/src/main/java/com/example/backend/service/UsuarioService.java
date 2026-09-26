package com.example.backend.service;

import com.example.backend.model.Usuario;
import com.example.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario buscarPorUsername(String username){
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public List<Usuario> listarEmpleados(String username){
        Usuario admin = buscarPorUsername(username);
        if("SUPERADMIN".equals(admin.getRol())) return List.of();

        return usuarioRepository.findByIdGimnasioAndRolNot(admin.getIdGimnasio(), "SUPERADMIN");
    }

    public Usuario guardarUsuario(Usuario usuario){
        if(usuarioRepository.findByUsername(usuario.getUsername()).isPresent()){
            throw new IllegalArgumentException("El usuario '"+usuario.getUsername()+"' ya esta en uso. Te sugerimos usar algo como: " + usuario.getUsername() + "123");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }
    public Usuario actualizarUsuario(Integer id, Usuario detalles) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (!existente.getUsername().equals(detalles.getUsername()) &&
                usuarioRepository.findByUsername(detalles.getUsername()).isPresent()) {
            throw new IllegalArgumentException("El usuario '" + detalles.getUsername() + "' ya está ocupado por otra persona.");
        }

        // 2. Actualizamos datos básicos
        existente.setUsername(detalles.getUsername());
        existente.setRol(detalles.getRol());

        // 3. MAGIA: Solo actualizamos la contraseña si React nos mandó una nueva
        if (detalles.getPassword() != null && !detalles.getPassword().isEmpty()) {
            existente.setPassword(passwordEncoder.encode(detalles.getPassword()));
        }

        return usuarioRepository.save(existente);
    }

    public void eliminarUsuario(Integer id){
        usuarioRepository.deleteById(id);
    }
}
