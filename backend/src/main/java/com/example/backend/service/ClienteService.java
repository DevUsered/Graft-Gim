package com.example.backend.service;

import com.example.backend.model.Cliente;
import com.example.backend.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    // Obtener todos los clientes
    public List obtenerTodosLosClientes() {
        return clienteRepository.findAll();
    }

    // Guardar un cliente nuevo
    public Cliente guardarCliente(Cliente cliente) {
        return clienteRepository.save(cliente);
    }
}