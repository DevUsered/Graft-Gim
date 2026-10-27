package com.example.backend.config;

import com.example.backend.model.Producto;
import com.example.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public void run(String... args) throws Exception {
        List<Producto> productosExistentes = productoRepository.findAll();
        boolean paseExiste = productosExistentes.stream()
                .anyMatch(p -> p.getNombre().toLowerCase().contains("pase"));

        if (!paseExiste) {
            Producto paseLibre = new Producto();
            paseLibre.setNombre("Pase Libre (Visita Diaria)");
            paseLibre.setPrecio(new BigDecimal("25.00"));
            paseLibre.setStock(999999);
            paseLibre.setCategoria("Servicios");
            paseLibre.setImagen("🎟️");

            productoRepository.save(paseLibre);
            System.out.println("✅ SISTEMA: Se creó automáticamente el producto 'Pase Libre' en el inventario.");
        }
    }
}
