package com.example.backend.controller;

import com.example.backend.dto.VentaRequest;
import com.example.backend.service.RecepcionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recepcion")
public class RecepcionController {
    @Autowired
    private RecepcionService recepcionService;

    @PostMapping("/cobrar")
    public ResponseEntity<?> procesarCobro(@RequestBody VentaRequest request){
        try{
            recepcionService.procesarCobroRecepcion(request);
            return ResponseEntity.ok().body("{\"mensaje\": \"Cobro procesado, stock actualizado y accesos registrados correctamente.\"}");
        }catch (Exception e){
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
