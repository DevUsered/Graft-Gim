package com.example.backend.security;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TenantFilterAspect {
    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* com.example.backend.repository.*.*(..))")
    public void aplicarFiltroGimnasio(){
        Integer idGimnasio = TenantContext.getCurrentTenant();

        if(idGimnasio != null){
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter").setParameter("idGimnasio", idGimnasio);
        }
    }
}
