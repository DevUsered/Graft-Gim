package com.example.backend.controller;

import com.example.backend.model.Suscripcion;
import com.example.backend.service.SuscripcionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/suscripciones")
public class SuscripcionController {

    @Autowired
    private SuscripcionService suscripcionService;

    @GetMapping
    public List<Suscripcion> listarSuscripciones() {
        return suscripcionService.obtenerTodas();
    }

    @PostMapping
    public Suscripcion crearSuscripcion(@RequestBody Suscripcion suscripcion) {
        return suscripcionService.guardar(suscripcion);
    }
}