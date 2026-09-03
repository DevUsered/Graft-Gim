package com.example.backend.service;

import com.example.backend.model.Membresia;
import com.example.backend.repository.MembresiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MembresiaService {

    @Autowired
    private MembresiaRepository membresiaRepository;

    public List<Membresia> obtenerTodasLasMembresias() {
        return membresiaRepository.findAll();
    }

    public Membresia guardarMembresia(Membresia membresia) {
        return membresiaRepository.save(membresia);
    }
    public Membresia actualizarMembresia(Integer id, Membresia detMembresia){
        Membresia membresiaExis = membresiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membresia no encontrada"));

        membresiaExis.setNombre(detMembresia.getNombre());
        membresiaExis.setPrecio(detMembresia.getPrecio());
        membresiaExis.setDuracionDias(detMembresia.getDuracionDias());
        membresiaExis.setDescripcion(detMembresia.getDescripcion());

        return membresiaRepository.save(membresiaExis);
    }
    public void eliminarMembresia(Integer id){
        membresiaRepository.deleteById(id);
    }
}