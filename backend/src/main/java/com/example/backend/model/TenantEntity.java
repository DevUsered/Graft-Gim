package com.example.backend.model;

import com.example.backend.security.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@MappedSuperclass
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "idGimnasio", type = Integer.class))
@Filter(name = "tenantFilter", condition = "id_gimnasio = :idGimnasio")
public abstract class TenantEntity {

    @Column(name = "id_gimnasio", updatable = false)
    private Integer idGimnasio;

    @PrePersist
    public void asignarGimnasio(){
        if(this.idGimnasio == null && TenantContext.getCurrentTenant() != null){
            this.idGimnasio = TenantContext.getCurrentTenant();
        }
    }

    public Integer getIdGimnasio() {
        return idGimnasio;
    }

    public void setIdGimnasio(Integer idGimnasio) {
        this.idGimnasio = idGimnasio;
    }
}
