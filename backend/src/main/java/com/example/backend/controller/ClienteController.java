package com.example.backend.controller;

import com.example.backend.model.Cliente;
import com.example.backend.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// @CrossOrigin permite que nuestro Frontend (que corre en el puerto 5173)
// pueda conectarse con el Backend (que corre en el puerto 8080) sin errores de seguridad.
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // Cuando React haga una petición GET a /api/clientes, devolverá esta lista
    @GetMapping
    public List listarClientes() {
        return clienteService.obtenerTodosLosClientes();
    }

    // Cuando React haga una petición POST a /api/clientes enviando datos, se ejecutará esto
    @PostMapping
    public Cliente crearCliente(@RequestBody Cliente cliente) {
        return clienteService.guardarCliente(cliente);
    }

    @PutMapping("/{id}")
    public Cliente actualizarCliente(@PathVariable Integer id, @RequestBody Cliente cliente){
        return clienteService.actualizarCliente(id, cliente);
    }
    @DeleteMapping("/{id}")
    public void eliminarCliente(@PathVariable Integer id){
        clienteService.eliminarCliente(id);
    }
}