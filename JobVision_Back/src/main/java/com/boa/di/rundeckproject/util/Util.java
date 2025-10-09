package com.boa.di.rundeckproject.util;

import com.boa.di.rundeckproject.dto.job.GlobalStatsDTO;

import java.text.SimpleDateFormat;
import java.util.Date;

public class Util {
    public static <E extends Enum<E>> E getEnumIgnoreCase(Class<E> enumClass, String value) {
        if (value == null) return null;
        for (E e : enumClass.getEnumConstants()) {
            if (e.name().equalsIgnoreCase(value)) {
                return e;
            }
        }
        return null;
    }

}
