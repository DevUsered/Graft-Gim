package com.example.backend.controller;

import com.example.backend.model.Pago;
import com.example.backend.repository.PagoRepository;
import com.example.backend.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen(){
        return ResponseEntity.ok(pagoService.obtenerResumenFinanzas());
    }


    @GetMapping
    public List<Pago> listarPagos(){
        return pagoService.listarPagos();
    }
    @PostMapping
    public Pago registrarPago(@RequestBody Pago pago){
        return pagoService.guardarPago(pago);
    }
}
