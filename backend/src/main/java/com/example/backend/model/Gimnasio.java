package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "gimnasios")
public class Gimnasio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gimnasio")
    private Integer idGimnasio;

    @Column(nullable = false)
    private String nombre;

    private String direccion;

    public Integer getIdGimnasio() {
        return idGimnasio;
    }

    public void setIdGimnasio(Integer idGimnasio) {
        this.idGimnasio = idGimnasio;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
}
