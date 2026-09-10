package com.example.backend.task;

import com.example.backend.model.Gimnasio;
import com.example.backend.repository.GimnasioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class LicenciaScheduler {
    @Autowired
    private GimnasioRepository gimnasioRepository;

    @Scheduled(cron = "0 0 0 * * ?")
    public void verificarLicenciasVencidas(){
        System.out.println("Revisando licencias de gimnasios...");

        List<Gimnasio> gimnasios = gimnasioRepository.findAll();
        LocalDate hoy = LocalDate.now();

        for(Gimnasio gym : gimnasios){
            if(gym.getFechaVencimiento() != null && gym.getFechaVencimiento().isBefore(hoy)){
                if("ACTIVO".equals(gym.getEstado())){
                    gym.setEstado("CLAUSURADO");
                    gimnasioRepository.save(gym);
                    System.out.println("Gimnasio '"+gym.getNombre() + "' ha sido CLAUSURADO por falta de pago.");
                }
            }
        }
    }
}
