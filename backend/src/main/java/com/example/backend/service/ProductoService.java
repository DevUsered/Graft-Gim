package com.example.backend.service;

import com.example.backend.model.Producto;
import com.example.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> listarTodos(){
        return productoRepository.findAll();
    }
    public Producto guardarProducto(Producto producto){
        return productoRepository.save(producto);
    }
    public Producto actualizarProducto(Integer id, Producto detalles) {
        Producto existente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        existente.setNombre(detalles.getNombre());
        existente.setPrecio(detalles.getPrecio());
        existente.setStock(detalles.getStock());
        existente.setCategoria(detalles.getCategoria());

        existente.setImagen(detalles.getImagen());

        return productoRepository.save(existente);
    }
    public void eliminarProducto(Integer id) {
        productoRepository.deleteById(id);
    }
}
