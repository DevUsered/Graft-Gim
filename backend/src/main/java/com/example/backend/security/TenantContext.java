package com.example.backend.security;

public class TenantContext {
    private static final ThreadLocal<Integer> CURRENT_TENANT = new ThreadLocal<>();

    public static void setCurrentTenant(Integer tenant){
        CURRENT_TENANT.set(tenant);
    }
    public static Integer getCurrentTenant(){
        return CURRENT_TENANT.get();
    }
    public static void clear(){
        CURRENT_TENANT.remove();
    }
}
