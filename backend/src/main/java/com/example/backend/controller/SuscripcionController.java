package com.example.backend.controller;

import com.example.backend.model.Suscripcion;
import com.example.backend.service.SuscripcionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
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
    @PutMapping("/{id}")
    public Suscripcion actualizarSuscripcion(@PathVariable Integer id, @RequestBody Suscripcion suscripcion){
        return suscripcionService.actualizar(id, suscripcion);
    }
    @DeleteMapping("/{id}")
    public void eliminarSuscripcion(@PathVariable Integer id){
        suscripcionService.eliminar(id);
    }
    @GetMapping("/cliente/{idCliente}/activa")
    public ResponseEntity<?> obtenerSuscripcionActiva(@PathVariable Integer idCliente){
        Optional<Suscripcion> sub = suscripcionService.obtenerActivaPorCliente(idCliente);

        if(sub.isPresent()){
            return ResponseEntity.ok(sub.get());
        }
        return ResponseEntity.notFound().build();
    }
}