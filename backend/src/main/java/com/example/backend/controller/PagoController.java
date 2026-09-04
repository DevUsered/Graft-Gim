package com.example.backend.controller;

import com.example.backend.model.Pago;
import com.example.backend.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/pagos")
public class PagoController {
    @Autowired
    private PagoRepository pagoRepository;

    @GetMapping
    public List<Pago> listarPagos(){
        return pagoRepository.findAll();
    }
    @PostMapping
    public Pago registrarPago(@RequestBody Pago pago){
        return pagoRepository.save(pago);
    }
}
