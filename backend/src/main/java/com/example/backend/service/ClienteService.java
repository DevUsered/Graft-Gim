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

    public Cliente actualizarCliente(Integer id, Cliente detCliente){
        Cliente clienteExis = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        clienteExis.setCarnetIdentidad(detCliente.getCarnetIdentidad());
        clienteExis.setNombreCompleto(detCliente.getNombreCompleto());
        clienteExis.setTelefono(detCliente.getTelefono());

        if(detCliente.getEstado() != null){
            clienteExis.setEstado(detCliente.getEstado());
        }
        return clienteRepository.save(clienteExis);
    }
    public void eliminarCliente(Integer id){
        clienteRepository.deleteById(id);
    }
}