package com.example.backend.controller;

import com.example.backend.model.Membresia;
import com.example.backend.service.MembresiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/membresias")
public class MembresiaController {

    @Autowired
    private MembresiaService membresiaService;

    @GetMapping
    public List<Membresia> listarMembresias() {
        return membresiaService.obtenerTodasLasMembresias();
    }

    @PostMapping
    public Membresia crearMembresia(@RequestBody Membresia membresia) {
        return membresiaService.guardarMembresia(membresia);
    }
}