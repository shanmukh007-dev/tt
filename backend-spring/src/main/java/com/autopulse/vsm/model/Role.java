package com.autopulse.vsm.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    STAFF("staff"),
    CUSTOMER("customer");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static Role fromString(String text) {
        for (Role r : Role.values()) {
            if (r.value.equalsIgnoreCase(text)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + text);
    }
}
