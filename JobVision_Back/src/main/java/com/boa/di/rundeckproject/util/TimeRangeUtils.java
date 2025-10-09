package com.boa.di.rundeckproject.util;

import org.apache.commons.lang3.tuple.Pair;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Date;


public class TimeRangeUtils {
    public static long convertTimeRangeToMillis(String timeRange) {
        long now = System.currentTimeMillis();
        return switch (timeRange) {
            case "5m" -> now - Duration.ofMinutes(5).toMillis();
            case "15m" -> now - Duration.ofMinutes(15).toMillis();
            case "30m" -> now - Duration.ofMinutes(30).toMillis();
            case "1h" -> now - Duration.ofHours(1).toMillis();
            case "3h" -> now - Duration.ofHours(3).toMillis();
            case "6h" -> now - Duration.ofHours(6).toMillis();
            case "12h" -> now - Duration.ofHours(12).toMillis();
            case "1d" -> now - Duration.ofDays(1).toMillis();
            case "2d" -> now - Duration.ofDays(2).toMillis();
            case "7d" -> now - Duration.ofDays(7).toMillis();
            case "30d" -> now - Duration.ofDays(30).toMillis();
            case "90d" -> now - Duration.ofDays(90).toMillis();
            case "6m" -> now - Duration.ofDays(30L * 6).toMillis();      // approximated to 30 days/month
            case "1y" -> now - Duration.ofDays(365L).toMillis();
            case "2y" -> now - Duration.ofDays(365L * 2).toMillis();
            case "5y" -> now - Duration.ofDays(365L * 5).toMillis();
            default -> now - Duration.ofDays(1).toMillis(); // fallback: 1 day
        };
    }

    public static double millisToSeconds(long millis) {
        return millis / 1000.0;
    }

    public static Pair<Instant, Instant> getLastMonthRange() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate now = LocalDate.now(zone);
        YearMonth lastMonth = YearMonth.from(now.minusMonths(1));

        LocalDate start = lastMonth.atDay(1);
        LocalDate end = lastMonth.atEndOfMonth();

        Instant from = start.atStartOfDay(zone).toInstant();
        Instant to = end.atTime(LocalTime.MAX).atZone(zone).toInstant();

        return Pair.of(from, to);
    }

    public static Pair<Instant, Instant> resolveTimeRange(String timeRange) {
        LocalDate today = LocalDate.now();
        ZoneId zone = ZoneId.systemDefault();

        return switch (timeRange) {
            case "today" -> Pair.of(today.atStartOfDay(zone).toInstant(), Instant.now());
            case "yesterday" -> {
                LocalDate y = today.minusDays(1);
                yield Pair.of(y.atStartOfDay(zone).toInstant(), y.plusDays(1).atStartOfDay(zone).toInstant());
            }
            case "thisWeek" -> {
                LocalDate monday = today.with(DayOfWeek.MONDAY);
                yield Pair.of(monday.atStartOfDay(zone).toInstant(), Instant.now());
            }
            case "lastWeek" -> {
                LocalDate monday = today.with(DayOfWeek.MONDAY).minusWeeks(1);
                LocalDate sunday = monday.plusDays(6);
                yield Pair.of(monday.atStartOfDay(zone).toInstant(), sunday.plusDays(1).atStartOfDay(zone).toInstant());
            }
            case "thisMonth" -> {
                LocalDate first = today.withDayOfMonth(1);
                yield Pair.of(first.atStartOfDay(zone).toInstant(), Instant.now());
            }
            case "lastMonth" -> getLastMonthRange();
            case "lastYear" -> {
                LocalDate firstJanLastYear = today.minusYears(1).withDayOfYear(1);
                LocalDate firstJanThisYear = today.withDayOfYear(1);
                yield Pair.of(firstJanLastYear.atStartOfDay(zone).toInstant(), firstJanThisYear.atStartOfDay(zone).toInstant());
            }
            case "thisYear" -> {
                LocalDate firstJanThisYear = today.withDayOfYear(1);
                yield Pair.of(firstJanThisYear.atStartOfDay(zone).toInstant(), Instant.now());
            }
            default -> {
                long fromMillis = convertTimeRangeToMillis(timeRange);
                yield Pair.of(Instant.ofEpochMilli(fromMillis), Instant.now());
            }
        };
    }
}
