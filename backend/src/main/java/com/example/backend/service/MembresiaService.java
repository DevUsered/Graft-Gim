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
}